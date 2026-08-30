const { createHmac } = require('node:crypto');
const { io } = require('socket.io-client');

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

function signPetpooja(bodyObj) {
  const raw = JSON.stringify(bodyObj);
  const sig = createHmac('sha256', PETPOOJA_WEBHOOK_SECRET).update(raw).digest('hex');
  return { raw, sig };
}

async function main() {
  console.log('1) health');
  const health = await req('/health');
  console.log(health);

  console.log('2) menu');
  const menu = await req('/menu');
  if (!menu.length) throw new Error('menu empty — run pnpm db:seed');
  const item = menu[0];

  console.log('3) create QR order');
  const order = await req('/orders', {
    method: 'POST',
    body: JSON.stringify({
      source: 'qr',
      tableId: 'T12',
      customer: { name: 'Audit Guest', mobile: '9876543210', email: 'audit@example.com' },
      items: [{ menuItemId: item.id, quantity: 1, instructions: 'less sugar' }],
    }),
  });
  if (!order.accessToken) throw new Error('missing accessToken');
  const orderAccess = { 'X-Order-Access': order.accessToken };
  console.log({ id: order.id, token: order.token, status: order.status, logs: order.statusLogs.length });

  console.log('4) checkout pay_at_counter → confirmed + PetPooja push');
  const confirmed = await req(`/orders/${order.id}/checkout`, {
    method: 'POST',
    headers: orderAccess,
    body: JSON.stringify({ method: 'pay_at_counter' }),
  });
  if (confirmed.status !== 'confirmed') {
    throw new Error(`expected confirmed after COD checkout, got ${confirmed.status}`);
  }
  console.log({
    status: confirmed.status,
    payment: confirmed.payments[0]?.method,
    discount: confirmed.discountAmount,
  });

  console.log('5) socket listen briefly');
  await new Promise((resolve, reject) => {
    const socket = io(API, { transports: ['websocket', 'polling'] });
    const t = setTimeout(() => {
      socket.disconnect();
      resolve();
    }, 1500);
    socket.on('connect', () => socket.emit('ping'));
    socket.on('pong', () => console.log('pong ok'));
    socket.on('connect_error', (e) => {
      clearTimeout(t);
      reject(e);
    });
  });

  await new Promise((r) => setTimeout(r, 800));
  const afterPush = await req(`/orders/${order.id}`, { headers: orderAccess });
  console.log('6) after push', {
    petpoojaOrderId: afterPush.petpoojaOrderId,
    pushFailed: afterPush.petpoojaPushFailed,
  });

  console.log('7) petpooja ready webhook');
  const readyPayload = { cafe_order_id: order.id, status: 'food_ready' };
  const readySigned = signPetpooja(readyPayload);
  const webhookAuth = {
    Authorization: `Bearer ${PETPOOJA_WEBHOOK_SECRET}`,
    'x-petpooja-signature': readySigned.sig,
  };
  const ready = await req('/petpooja/webhooks/order-status', {
    method: 'POST',
    headers: webhookAuth,
    body: readySigned.raw,
  });
  await new Promise((r) => setTimeout(r, 600));
  const readyAfterNotify = await req(`/orders/${order.id}`, { headers: orderAccess });
  console.log({
    status: ready.status,
    readyAt: ready.readyAt,
    notify: readyAfterNotify.readyNotificationStatus,
    channel: readyAfterNotify.readyNotificationChannel,
  });

  console.log('8) claim + collect (staff)');
  const login = await req('/auth/staff/login', {
    method: 'POST',
    body: JSON.stringify({ name: 'Cashier', pin: '3456' }),
  });
  const staffAuth = { Authorization: `Bearer ${login.token}` };
  await req(`/orders/${order.id}/claim`, {
    method: 'POST',
    headers: staffAuth,
    body: JSON.stringify({}),
  });
  const collected = await req(`/orders/${order.id}/collect`, {
    method: 'POST',
    headers: staffAuth,
    body: JSON.stringify({}),
  });
  console.log({ status: collected.status, logs: collected.statusLogs.map((l) => l.status) });

  console.log('9) online payment checkout');
  const online = await req('/orders', {
    method: 'POST',
    body: JSON.stringify({
      source: 'qr',
      customer: { name: 'Online Guest', mobile: '9123456780' },
      items: [{ menuItemId: item.id, quantity: 1 }],
    }),
  });
  const onlineAccess = { 'X-Order-Access': online.accessToken };
  await req(`/orders/${online.id}/checkout`, {
    method: 'POST',
    headers: onlineAccess,
    body: JSON.stringify({ method: 'upi' }),
  });

  let checkout;
  try {
    checkout = await req(`/payments/orders/${online.id}/checkout`, {
      method: 'POST',
      headers: onlineAccess,
    });
  } catch (err) {
    throw new Error(
      `Online checkout failed (${err.message}). Local audit expects PAYMENT_ADAPTER=fake and ALLOW_FAKE_PAYMENTS=1. Live mode needs valid RAZORPAY_KEY_ID / KEY_SECRET.`,
    );
  }

  if (checkout.keyId === 'mock') {
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
    console.log({ onlineStatus: paid.status, paymentStatus: paid.paymentStatus });
  } else {
    console.log({
      liveCheckout: true,
      razorpayOrderId: checkout.razorpayOrderId,
      keyPrefix: String(checkout.keyId || '').slice(0, 8),
    });
  }

  console.log('10) aggregator stub (signed)');
  const aggBody = {
    source: 'swiggy',
    customer: { name: 'Swiggy Guest', mobile: '9000000001' },
    items: [{ menuItemId: item.id, quantity: 2 }],
  };
  const aggSigned = signPetpooja(aggBody);
  const agg = await req('/petpooja/webhooks/aggregator-order', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PETPOOJA_WEBHOOK_SECRET}`,
      'x-petpooja-signature': aggSigned.sig,
    },
    body: aggSigned.raw,
  });
  console.log({ aggStatus: agg.status, source: agg.source, token: agg.token });

  console.log('\nAUDIT OK');
}

main().catch((err) => {
  console.error('AUDIT FAIL', err);
  process.exit(1);
});
