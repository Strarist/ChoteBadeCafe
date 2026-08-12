const { createHmac } = require('node:crypto');

const API = process.env.API_URL || 'http://127.0.0.1:3001';
const PETPOOJA_WEBHOOK_SECRET =
  process.env.PETPOOJA_WEBHOOK_SECRET || 'dev-petpooja-webhook-secret';

async function req(path, init = {}) {
  const { headers: initHeaders, ...rest } = init;
  const res = await fetch(`${API}${path}`, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...(initHeaders || {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${path} → ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

function signPetpooja(body) {
  const raw = JSON.stringify(body);
  const sig = createHmac('sha256', PETPOOJA_WEBHOOK_SECRET).update(raw).digest('hex');
  return { raw, sig };
}

async function main() {
  console.log('=== SMOKE: prerequisites + admin RBAC ===');

  const health = await req('/health');
  console.log('health', health.status, health.database, health.redis);

  const integrations = await req('/health/integrations');
  console.log('integrations', {
    petpooja: integrations.petpooja.status,
    payment: integrations.payment.status,
    notifications: integrations.notifications.status,
    auth: integrations.auth.sessionSecretConfigured,
  });

  const menu = await req('/menu');
  console.log('menu items', menu.length);

  console.log('admin login');
  const adminLogin = await req('/auth/staff/login', {
    method: 'POST',
    body: JSON.stringify({ name: 'Admin', pin: '1234' }),
  });
  const adminAuth = { Authorization: `Bearer ${adminLogin.token}` };

  console.log('cashier denied from admin staff list');
  const cashierLogin = await req('/auth/staff/login', {
    method: 'POST',
    body: JSON.stringify({ name: 'Cashier', pin: '3456' }),
  });
  try {
    await req('/admin/staff', {
      headers: { Authorization: `Bearer ${cashierLogin.token}` },
    });
    throw new Error('cashier should not list staff');
  } catch (err) {
    if (!String(err).includes('403') && !String(err).includes('Forbidden')) throw err;
    console.log('cashier blocked from manageStaff OK');
  }

  const staff = await req('/admin/staff', { headers: adminAuth });
  console.log('staff count', staff.length);

  const me = await req('/admin/me', { headers: adminAuth });
  console.log('admin permissions manageStaff', me.permissions.manageStaff);

  console.log('order happy path with staff auth');
  const order = await req('/orders', {
    method: 'POST',
    body: JSON.stringify({
      source: 'qr',
      customer: { name: 'Smoke', mobile: '9888877777' },
      items: [{ menuItemId: menu[0].id, quantity: 1 }],
    }),
  });
  if (!order.accessToken) throw new Error('create must return accessToken');
  const orderAccess = { 'X-Order-Access': order.accessToken };

  await req(`/orders/${order.id}/checkout`, {
    method: 'POST',
    headers: orderAccess,
    body: JSON.stringify({ method: 'pay_at_counter' }),
  });
  await req(`/orders/${order.id}/confirm-counter-payment`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cashierLogin.token}` },
    body: JSON.stringify({ method: 'cash' }),
  });
  await new Promise((r) => setTimeout(r, 500));

  const readyBody = { cafe_order_id: order.id, status: 'food_ready' };
  const readySigned = signPetpooja(readyBody);
  await req('/petpooja/webhooks/order-status', {
    method: 'POST',
    headers: { 'x-petpooja-signature': readySigned.sig },
    body: readySigned.raw,
  });
  await new Promise((r) => setTimeout(r, 500));
  await req(`/orders/${order.id}/claim`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cashierLogin.token}` },
    body: JSON.stringify({}),
  });
  const collected = await req(`/orders/${order.id}/collect`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cashierLogin.token}` },
    body: JSON.stringify({}),
  });
  console.log('collected', collected.status);

  console.log('confirm razorpay signature path');
  const online = await req('/orders', {
    method: 'POST',
    body: JSON.stringify({
      source: 'qr',
      customer: { name: 'Pay', mobile: '9777766666' },
      items: [{ menuItemId: menu[0].id, quantity: 1 }],
    }),
  });
  const onlineAccess = { 'X-Order-Access': online.accessToken };
  await req(`/orders/${online.id}/checkout`, {
    method: 'POST',
    headers: onlineAccess,
    body: JSON.stringify({ method: 'upi' }),
  });
  const checkout = await req(`/payments/orders/${online.id}/checkout`, {
    method: 'POST',
    headers: onlineAccess,
  });
  const paymentId = `pay_mock_${Date.now()}`;
  const razorpaySignature = createHmac('sha256', 'mock')
    .update(`${checkout.razorpayOrderId}|${paymentId}`)
    .digest('hex');
  const paid = await req(`/payments/orders/${online.id}/confirm`, {
    method: 'POST',
    headers: onlineAccess,
    body: JSON.stringify({
      razorpayOrderId: checkout.razorpayOrderId,
      razorpayPaymentId: paymentId,
      razorpaySignature,
    }),
  });
  console.log('paid', paid.status, paid.paymentStatus);

  console.log('public order list denied');
  try {
    await req('/orders?status=awaiting_payment');
    throw new Error('list should require staff auth');
  } catch (err) {
    if (!String(err).includes('401')) throw err;
    console.log('list requires staff OK');
  }

  console.log('\nSMOKE OK');
}

main().catch((err) => {
  console.error('SMOKE FAIL', err);
  process.exit(1);
});
