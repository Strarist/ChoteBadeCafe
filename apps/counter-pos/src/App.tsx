import { useCallback, useEffect, useMemo, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { MenuItem, OrderDetail, StaffLoginResponse, StaffRole } from '@cafe/shared-types';
import { ROLE_PERMISSIONS, SOCKET_EVENTS } from '@cafe/shared-types';
import { api, getAuthToken, setAuthToken } from './lib/api';
import { loadMenuCache, saveMenuCache } from './lib/menuCache';
import { useConnectionStatus } from './hooks/useConnectionStatus';
import { ConnectionBanner } from './components/ConnectionBanner';
import './index.css';

type Tab = 'order' | 'pay' | 'kitchen' | 'ready' | 'push';
type RealtimeState = 'live' | 'reconnecting' | 'offline';

const STAFF_SESSION =
  localStorage.getItem('counter-staff-session') ??
  (() => {
    const id = `staff_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('counter-staff-session', id);
    return id;
  })();

function formatPaise(paise: number) {
  return `₹${(paise / 100).toFixed(paise % 100 === 0 ? 0 : 2)}`;
}

function waitMinutes(readyAt: string | null, createdAt: string) {
  const start = readyAt ? new Date(readyAt).getTime() : new Date(createdAt).getTime();
  return Math.max(0, Math.floor((Date.now() - start) / 60000));
}

export default function App() {
  const [staffName, setStaffName] = useState(import.meta.env.PROD ? '' : 'Cashier');
  const [staffPin, setStaffPin] = useState(import.meta.env.PROD ? '' : '3456');
  const [authedName, setAuthedName] = useState<string | null>(
    localStorage.getItem('counter-auth-name'),
  );
  const [staffRole, setStaffRole] = useState<StaffRole | null>(() => {
    const raw = localStorage.getItem('counter-auth-role');
    return raw === 'admin' || raw === 'manager' || raw === 'cashier' ? raw : null;
  });
  const canRetryPush = staffRole ? ROLE_PERMISSIONS[staffRole].retryPetpoojaPush : false;
  const [tab, setTab] = useState<Tab>('order');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<
    Array<{ menuItemId: string; name: string; price: number; quantity: number; instructions: string }>
  >([]);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [pendingPay, setPendingPay] = useState<OrderDetail[]>([]);
  const [kitchen, setKitchen] = useState<OrderDetail[]>([]);
  const [ready, setReady] = useState<OrderDetail[]>([]);
  const [pushFailed, setPushFailed] = useState<OrderDetail[]>([]);
  const [lastTicket, setLastTicket] = useState<OrderDetail | null>(null);
  const [collectTarget, setCollectTarget] = useState<OrderDetail | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [flashId, setFlashId] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [queuesStale, setQueuesStale] = useState(false);
  const [menuStale, setMenuStale] = useState(false);

  const networkStatus = useConnectionStatus();
  const realtimeState: RealtimeState =
    networkStatus === 'offline' ? 'offline' : socketConnected ? 'live' : 'reconnecting';

  const realtimeLabel =
    realtimeState === 'live'
      ? 'Live'
      : realtimeState === 'offline'
        ? 'Offline'
        : 'Reconnecting…';

  const canCreateTicket =
    customerName.trim().length > 0 && customerMobile.trim().length >= 8 && cart.length > 0;

  const login = async () => {
    setError(null);
    try {
      const res = await api.post<StaffLoginResponse>('/auth/staff/login', {
        name: staffName,
        pin: staffPin,
      });
      setAuthToken(res.token);
      localStorage.setItem('counter-auth-name', res.staff.name);
      localStorage.setItem('counter-auth-role', res.staff.role);
      setAuthedName(res.staff.name);
      setStaffRole(res.staff.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const logout = () => {
    setAuthToken(null);
    localStorage.removeItem('counter-auth-name');
    localStorage.removeItem('counter-auth-role');
    setAuthedName(null);
    setStaffRole(null);
  };

  const refreshQueues = useCallback(async () => {
    try {
      const [pay, confirmed, preparing, readyList] = await Promise.all([
        api.get<OrderDetail[]>('/orders?status=awaiting_payment'),
        api.get<OrderDetail[]>('/orders?status=confirmed'),
        api.get<OrderDetail[]>('/orders?status=preparing'),
        api.get<OrderDetail[]>('/orders?status=ready_for_handover'),
      ]);
      setPendingPay(pay);
      setKitchen([...preparing, ...confirmed]);
      setReady(readyList);
      setPushFailed(confirmed.filter((o) => o.petpoojaPushFailed));
      setQueuesStale(false);
    } catch (err) {
      setQueuesStale(true);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const loadMenu = useCallback(async () => {
    try {
      const items = await api.get<MenuItem[]>('/menu');
      setMenu(items);
      saveMenuCache(items);
      setMenuStale(false);
    } catch (err) {
      const cached = loadMenuCache<MenuItem>();
      if (cached) {
        setMenu(cached);
        setMenuStale(true);
      }
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    if (!getAuthToken() || !authedName) return;

    void loadMenu();
    void refreshQueues();

    const socket: Socket = io(api.url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    const token = getAuthToken();
    const joinStaff = () => {
      if (token) socket.emit(SOCKET_EVENTS.JOIN_STAFF, { token });
    };

    const reload = () => void refreshQueues();

    socket.on('connect', () => {
      setSocketConnected(true);
      joinStaff();
      void refreshQueues();
    });
    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('connect_error', () => setSocketConnected(false));

    if (socket.connected) {
      setSocketConnected(true);
      joinStaff();
    }

    socket.on(SOCKET_EVENTS.ORDER_CREATED, reload);
    socket.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, reload);
    socket.on(SOCKET_EVENTS.MENU_UPDATED, () => void loadMenu());

    let disconnectedAt: number | null = socket.connected ? null : Date.now();
    const pollFallback = window.setInterval(() => {
      if (socket.connected) {
        disconnectedAt = null;
        return;
      }
      if (disconnectedAt === null) disconnectedAt = Date.now();
      if (Date.now() - disconnectedAt >= 10_000) void refreshQueues();
    }, 5000);

    const tick = window.setInterval(() => setNow(Date.now()), 30000);

    return () => {
      socket.disconnect();
      setSocketConnected(false);
      window.clearInterval(pollFallback);
      window.clearInterval(tick);
    };
  }, [refreshQueues, loadMenu, authedName]);

  const categories = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of menu) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return Array.from(map.entries());
  }, [menu]);

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const qtyFor = (menuItemId: string) =>
    cart.find((c) => c.menuItemId === menuItemId)?.quantity ?? 0;

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.menuItemId === item.id);
      if (existing) {
        return prev.map((p) =>
          p.menuItemId === item.id ? { ...p, quantity: p.quantity + 1 } : p,
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          instructions: '',
        },
      ];
    });
    setFlashId(item.id);
    window.setTimeout(() => setFlashId((cur) => (cur === item.id ? null : cur)), 420);
  };

  const placeCounterOrder = async () => {
    if (!canCreateTicket) return;
    setBusy(true);
    setError(null);
    try {
      const created = await api.post<OrderDetail>('/orders', {
        source: 'counter',
        customer: { name: customerName.trim(), mobile: customerMobile.trim() },
        items: cart.map((c) => ({
          menuItemId: c.menuItemId,
          quantity: c.quantity,
          instructions: c.instructions || null,
        })),
      });
      const checkedOut = await api.post<OrderDetail>(`/orders/${created.id}/checkout`, {
        method: 'pay_at_counter',
      });
      setLastTicket(checkedOut);
      setCart([]);
      setCustomerName('');
      setCustomerMobile('');
      setTab('pay');
      await refreshQueues();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const confirmPay = async (orderId: string, method: 'cash' | 'card' | 'upi' | 'qr') => {
    setBusy(true);
    try {
      await api.post(`/orders/${orderId}/confirm-counter-payment`, { method });
      await refreshQueues();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const openCollect = async (order: OrderDetail) => {
    try {
      await api.post(`/orders/${order.id}/claim`, { staffSessionId: STAFF_SESSION });
      setCollectTarget(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const confirmCollect = async () => {
    if (!collectTarget) return;
    setBusy(true);
    try {
      await api.post(`/orders/${collectTarget.id}/collect`, {
        staffSessionId: STAFF_SESSION,
      });
      setCollectTarget(null);
      await refreshQueues();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const markPreparing = async (orderId: string) => {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/orders/${orderId}/preparing`);
      await refreshQueues();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const markReady = async (orderId: string) => {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/orders/${orderId}/ready`);
      await refreshQueues();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const retryPush = async (orderId: string) => {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/petpooja/orders/${orderId}/retry-push`);
      await refreshQueues();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  void now;

  if (!authedName || !getAuthToken()) {
    return (
      <div className="login-screen">
        <form
          className="login-card"
          onSubmit={(e) => {
            e.preventDefault();
            void login();
          }}
        >
          <p className="eyebrow">Chote Bade · Counter</p>
          <h1>Staff login</h1>
          <p className="login-lead">Enter your name and PIN to open the till.</p>
          {error && <div className="banner-error">{error}</div>}
          <label>
            Name
            <input
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </label>
          <label>
            PIN
            <input
              type="password"
              value={staffPin}
              onChange={(e) => setStaffPin(e.target.value)}
              autoComplete="current-password"
              inputMode="numeric"
            />
          </label>
          <button type="submit" className="primary">
            Unlock POS
          </button>
          {!import.meta.env.PROD && <p className="empty">Demo: Cashier / 3456</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="counter-shell">
      <ConnectionBanner status={networkStatus} />
      <header className="counter-header">
        <div>
          <p className="eyebrow">Chote Bade · Counter · {authedName}</p>
          <h1>POS</h1>
          <p className={`realtime-indicator realtime-${realtimeState}`}>{realtimeLabel}</p>
        </div>
        <nav className="tabs">
          {(
            [
              ['order', 'New order'],
              ['pay', `Pay (${pendingPay.length})`],
              ['kitchen', `Kitchen (${kitchen.length})`],
              ['ready', `Ready (${ready.length})`],
              ...(canRetryPush
                ? ([['push', `Push fails (${pushFailed.length})`]] as const)
                : []),
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? 'tab active' : 'tab'}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
          <button type="button" className="tab" onClick={logout}>
            Lock
          </button>
        </nav>
      </header>

      {error && (
        <div className="banner-error" role="alert">
          {error}
          <button type="button" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {tab === 'order' && (
        <div className="order-grid">
          {menuStale && (
            <p className="stale-notice order-stale-notice">
              Showing saved menu — prices may be outdated.{' '}
              <button type="button" onClick={() => void loadMenu()}>
                Refresh menu
              </button>
            </p>
          )}
          <section className="menu-pane">
            {categories.map(([category, items]) => (
              <div key={category} className="category-block">
                <h2>{category}</h2>
                <div className="item-grid">
                  {items.map((item) => {
                    const qty = qtyFor(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`menu-tile${flashId === item.id ? ' just-added' : ''}${qty > 0 ? ' in-cart' : ''}`}
                        onClick={() => addToCart(item)}
                      >
                        <span className="tile-top">
                          <span className="name">{item.name}</span>
                          {qty > 0 && <span className="qty-badge">{qty}</span>}
                        </span>
                        <span className="price">{formatPaise(item.price)}</span>
                        <span className="tile-hint">{qty > 0 ? `Qty ${qty} · tap +1` : 'Tap to add'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
          <aside className="cart-pane">
            <h2>Running cart</h2>
            <label>
              Name *
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                aria-required
              />
            </label>
            <label>
              Mobile *
              <input
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                inputMode="tel"
                required
                aria-required
              />
            </label>
            <ul className="cart-list">
              {cart.map((item) => (
                <li key={item.menuItemId}>
                  <div className="row">
                    <strong>{item.name}</strong>
                    <span>{formatPaise(item.price * item.quantity)}</span>
                  </div>
                  <div className="row">
                    <div className="qty">
                      <button
                        type="button"
                        onClick={() =>
                          setCart((prev) =>
                            prev
                              .map((p) =>
                                p.menuItemId === item.menuItemId
                                  ? { ...p, quantity: p.quantity - 1 }
                                  : p,
                              )
                              .filter((p) => p.quantity > 0),
                          )
                        }
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCart((prev) =>
                            prev.map((p) =>
                              p.menuItemId === item.menuItemId
                                ? { ...p, quantity: p.quantity + 1 }
                                : p,
                            ),
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    placeholder="Kitchen instructions"
                    value={item.instructions}
                    onChange={(e) =>
                      setCart((prev) =>
                        prev.map((p) =>
                          p.menuItemId === item.menuItemId
                            ? { ...p, instructions: e.target.value }
                            : p,
                        ),
                      )
                    }
                  />
                </li>
              ))}
            </ul>
            <div className="cart-footer">
              <p className="total">{formatPaise(cartTotal)}</p>
              <button
                type="button"
                className="primary"
                disabled={busy || !canCreateTicket}
                onClick={() => void placeCounterOrder()}
              >
                {busy ? 'Creating…' : 'Create ticket'}
              </button>
              {!canCreateTicket && (
                <p className="field-hint">
                  {!cart.length
                    ? 'Add items, then fill name * and mobile *'
                    : 'Name * and mobile * (8+ digits) required'}
                </p>
              )}
              {lastTicket && (
                <p className="token-flash">Last token: {lastTicket.token}</p>
              )}
            </div>
          </aside>
        </div>
      )}

      {tab === 'pay' && (
        <section className="queue-pane">
          <div className="queue-head">
            <h2>Awaiting payment</h2>
            <button type="button" className="refresh-btn" onClick={() => void refreshQueues()}>
              Refresh
            </button>
          </div>
          {queuesStale && (
            <p className="stale-notice">Queue data may be outdated — tap Refresh when back online.</p>
          )}
          <div className="ticket-grid">
            {pendingPay.map((order) => {
              const pendingMethod = order.payments.find((p) => p.status === 'pending')?.method;
              return (
              <article key={order.id} className="ticket">
                <header>
                  <strong>{order.token}</strong>
                  <span>{order.customer.name}</span>
                </header>
                <p>{formatPaise(order.totalAmount)}</p>
                <p className="field-hint">
                  {pendingMethod === 'pay_at_counter' ? 'Pay at counter' : `Online (${pendingMethod ?? 'upi'})`}
                  {order.tableId ? ` · ${order.tableId}` : ''}
                </p>
                <ul>
                  {order.items.map((i) => (
                    <li key={i.id}>
                      {i.quantity}× {i.menuItem.name}
                    </li>
                  ))}
                </ul>
                <div className="actions">
                  {(['cash', 'upi', 'card', 'qr'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      disabled={busy}
                      onClick={() => void confirmPay(order.id, m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </article>
              );
            })}
            {!pendingPay.length && <p className="empty">No pending payments</p>}
          </div>
        </section>
      )}

      {tab === 'kitchen' && (
        <section className="queue-pane">
          <div className="queue-head">
            <h2>Live tickets</h2>
            <button type="button" className="refresh-btn" onClick={() => void refreshQueues()}>
              Refresh
            </button>
          </div>
          {queuesStale && (
            <p className="stale-notice">Queue data may be outdated — tap Refresh when back online.</p>
          )}
          <div className="ticket-grid">
            {kitchen.map((order) => (
              <article key={order.id} className="ticket">
                <header>
                  <strong>{order.token}</strong>
                  <span>{order.status === 'preparing' ? 'preparing' : 'new'}</span>
                </header>
                <p>{order.customer.name}</p>
                {order.tableId && <p className="field-hint">{order.tableId}</p>}
                <ul>
                  {order.items.map((i) => (
                    <li key={i.id}>
                      {i.quantity}× {i.menuItem.name}
                    </li>
                  ))}
                </ul>
                <div className="actions">
                  {order.status === 'confirmed' && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void markPreparing(order.id)}
                    >
                      Preparing
                    </button>
                  )}
                  <button
                    type="button"
                    className="primary"
                    disabled={busy}
                    onClick={() => void markReady(order.id)}
                  >
                    Ready
                  </button>
                </div>
              </article>
            ))}
            {!kitchen.length && <p className="empty">No live tickets</p>}
          </div>
        </section>
      )}

      {tab === 'ready' && (
        <section className="queue-pane">
          <div className="queue-head">
            <h2>Ready for handover</h2>
            <button type="button" className="refresh-btn" onClick={() => void refreshQueues()}>
              Refresh
            </button>
          </div>
          {queuesStale && (
            <p className="stale-notice">Queue data may be outdated — tap Refresh when back online.</p>
          )}
          <div className="ticket-grid">
            {ready.map((order) => {
              const mins = waitMinutes(order.readyAt, order.createdAt);
              return (
                <article
                  key={order.id}
                  className={`ticket ${mins >= 5 ? 'stale' : ''}`}
                >
                  <header>
                    <strong>{order.token}</strong>
                    <span>{mins}m waiting</span>
                  </header>
                  <p>{order.customer.name}</p>
                  <ul>
                    {order.items.map((i) => (
                      <li key={i.id}>
                        {i.quantity}× {i.menuItem.name}
                      </li>
                    ))}
                  </ul>
                  <button type="button" className="primary" onClick={() => void openCollect(order)}>
                    Collected
                  </button>
                </article>
              );
            })}
            {!ready.length && <p className="empty">Nothing waiting</p>}
          </div>
        </section>
      )}

      {tab === 'push' && (
        <section className="queue-pane">
          <div className="queue-head">
            <h2>PetPooja push failures</h2>
            <button type="button" className="refresh-btn" onClick={() => void refreshQueues()}>
              Refresh
            </button>
          </div>
          {queuesStale && (
            <p className="stale-notice">Queue data may be outdated — tap Refresh when back online.</p>
          )}
          <div className="ticket-grid">
            {pushFailed.map((order) => (
              <article key={order.id} className="ticket stale">
                <header>
                  <strong>{order.token}</strong>
                  <span>push failed</span>
                </header>
                <p className="error-text">{order.petpoojaPushError}</p>
                <button type="button" className="primary" onClick={() => void retryPush(order.id)}>
                  Retry push
                </button>
              </article>
            ))}
            {!pushFailed.length && <p className="empty">No push failures</p>}
          </div>
        </section>
      )}

      {collectTarget && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true">
            <h3>Confirm collected</h3>
            <p className="token">{collectTarget.token}</p>
            <p>{collectTarget.customer.name}</p>
            <ul>
              {collectTarget.items.map((i) => (
                <li key={i.id}>
                  {i.quantity}× {i.menuItem.name}
                </li>
              ))}
            </ul>
            <div className="actions">
              <button type="button" className="secondary" onClick={() => setCollectTarget(null)}>
                Cancel
              </button>
              <button type="button" className="primary" disabled={busy} onClick={() => void confirmCollect()}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
