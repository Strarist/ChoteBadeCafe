import { useEffect, useMemo, useState } from 'react';
import type {
  MemoryPin,
  OrderDetail,
  StaffLoginResponse,
  StaffRole,
  StaffUser,
} from '@cafe/shared-types';
import { ROLE_PERMISSIONS } from '@cafe/shared-types';
import { mediaUrl } from '../../../packages/frontend-api.ts';
import { api } from './api';

type Tab = 'integrations' | 'orders' | 'staff' | 'memory';

type MeResponse = {
  staff: { staffUserId: string; name: string; role: StaffRole };
  permissions: (typeof ROLE_PERMISSIONS)['admin'];
};

const TOKEN_KEY = 'cafe-admin-token';

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [me, setMe] = useState<MeResponse | null>(null);
  const [name, setName] = useState(import.meta.env.PROD ? '' : 'Admin');
  const [pin, setPin] = useState(import.meta.env.PROD ? '' : '1234');
  const [tab, setTab] = useState<Tab>('integrations');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<unknown>(null);
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [memories, setMemories] = useState<MemoryPin[]>([]);
  const [memoryFilter, setMemoryFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>(
    'pending',
  );
  const [newStaff, setNewStaff] = useState({ name: '', role: 'cashier' as StaffRole, pin: '' });

  const perms = me?.permissions;

  const flashNotice = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice((cur) => (cur === msg ? null : cur)), 2200);
  };

  const runAction = async (key: string, action: () => Promise<void>, okMsg: string) => {
    setError(null);
    setBusyKey(key);
    try {
      await action();
      flashNotice(okMsg);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyKey(null);
    }
  };

  const login = async () => {
    setError(null);
    setBusyKey('login');
    try {
      const res = await api<StaffLoginResponse>('/auth/staff/login', {
        method: 'POST',
        body: { name, pin },
      });
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyKey(null);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setMe(null);
  };

  const refreshMemories = async () => {
    if (!token) return;
    const q = memoryFilter === 'all' ? '' : `?status=${memoryFilter}`;
    setMemories(await api<MemoryPin[]>(`/admin/memory${q}`, { token }));
  };

  useEffect(() => {
    if (!token) return;
    void api<MeResponse>('/admin/me', { token })
      .then(setMe)
      .catch((err) => {
        setError(String(err));
        logout();
      });
  }, [token]);

  useEffect(() => {
    if (!token || !me) return;
    if (tab === 'integrations' && perms?.viewIntegrations) {
      void api('/admin/integrations', { token }).then(setIntegrations).catch((e) => setError(String(e)));
    }
    if (tab === 'orders' && perms?.viewAllOrders) {
      void api<OrderDetail[]>('/admin/orders', { token }).then(setOrders).catch((e) => setError(String(e)));
    }
    if (tab === 'staff' && perms?.manageStaff) {
      void api<StaffUser[]>('/admin/staff', { token }).then(setStaff).catch((e) => setError(String(e)));
    }
    if (tab === 'memory' && perms?.moderateMemory) {
      void refreshMemories().catch((e) => setError(String(e)));
    }
  }, [
    token,
    me,
    tab,
    memoryFilter,
    perms?.viewIntegrations,
    perms?.viewAllOrders,
    perms?.manageStaff,
    perms?.moderateMemory,
  ]);

  const tabs = useMemo(() => {
    const list: Array<{ id: Tab; label: string; show: boolean }> = [
      { id: 'integrations', label: 'Integrations', show: Boolean(perms?.viewIntegrations) },
      { id: 'orders', label: 'Orders', show: Boolean(perms?.viewAllOrders) },
      { id: 'memory', label: 'Memory Wall', show: Boolean(perms?.moderateMemory) },
      { id: 'staff', label: 'Staff', show: Boolean(perms?.manageStaff) },
    ];
    return list.filter((t) => t.show);
  }, [perms]);

  if (!token || !me) {
    return (
      <main className="login-screen">
        <form
          className="login-card"
          onSubmit={(e) => {
            e.preventDefault();
            void login();
          }}
        >
          <p className="eyebrow">Chote Bade</p>
          <h1>Admin</h1>
          <p className="login-lead">Sign in with your name and PIN. Admin and manager only.</p>
          {error && <p className="error">{error}</p>}
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </label>
          <label>
            PIN
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoComplete="current-password"
              inputMode="numeric"
            />
          </label>
          <button type="submit" className="primary" disabled={busyKey === 'login'}>
            {busyKey === 'login' ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </main>
    );
  }

  if (me.staff.role === 'cashier') {
    return (
      <main className="login-screen">
        <section className="login-card">
          <h1>Access denied</h1>
          <p className="login-lead">Cashiers use the Counter POS, not Admin.</p>
          <button type="button" className="primary" onClick={logout}>
            Sign out
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <header>
        <div>
          <p className="eyebrow">Chote Bade</p>
          <h1>Admin · {me.staff.name}</h1>
          <p className="muted">Role: {me.staff.role}</p>
        </div>
        <button type="button" onClick={logout}>
          Sign out
        </button>
      </header>

      {error && <p className="error">{error}</p>}
      {notice && <p className="notice">{notice}</p>}

      <nav className="tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'integrations' && (
        <section className="card">
          <div className="row">
            <h2>Integration readiness</h2>
            {perms?.menuSync && (
              <button
                type="button"
                className="primary"
                disabled={busyKey === 'sync'}
                onClick={() =>
                  void runAction(
                    'sync',
                    async () => {
                      await api('/admin/menu/sync', { method: 'POST', token });
                    },
                    'Menu sync started',
                  )
                }
              >
                {busyKey === 'sync' ? 'Working…' : 'Sync menu'}
              </button>
            )}
          </div>
          <pre>{JSON.stringify(integrations, null, 2)}</pre>
        </section>
      )}

      {tab === 'orders' && (
        <section className="card">
          <h2>Recent orders</h2>
          <ul className="list">
            {orders.map((o) => (
              <li key={o.id}>
                <strong>{o.token}</strong> · {o.status} · {o.customer.name}
                <div className="actions">
                  {perms?.retryPetpoojaPush && o.petpoojaPushFailed && (
                    <button
                      type="button"
                      disabled={busyKey === `retry:${o.id}`}
                      onClick={() =>
                        void runAction(
                          `retry:${o.id}`,
                          async () => {
                            await api(`/admin/orders/${o.id}/retry-push`, {
                              method: 'POST',
                              token,
                            });
                            setOrders(await api<OrderDetail[]>('/admin/orders', { token }));
                          },
                          `Retry queued for ${o.token}`,
                        )
                      }
                    >
                      {busyKey === `retry:${o.id}` ? 'Working…' : 'Retry push'}
                    </button>
                  )}
                  {perms?.cancelOrders &&
                    o.status !== 'collected' &&
                    o.status !== 'cancelled' && (
                      <button
                        type="button"
                        disabled={busyKey === `cancel:${o.id}`}
                        onClick={() =>
                          void runAction(
                            `cancel:${o.id}`,
                            async () => {
                              await api(`/admin/orders/${o.id}/cancel`, {
                                method: 'POST',
                                token,
                              });
                              setOrders(await api<OrderDetail[]>('/admin/orders', { token }));
                            },
                            `Cancelled ${o.token}`,
                          )
                        }
                      >
                        {busyKey === `cancel:${o.id}` ? 'Working…' : 'Cancel'}
                      </button>
                    )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'memory' && perms?.moderateMemory && (
        <section className="card">
          <div className="row">
            <h2>Memory Wall moderation</h2>
            <div className="actions">
              {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={memoryFilter === f ? 'primary' : ''}
                  onClick={() => setMemoryFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <p className="muted">
            Accept, reject, staff-pick, or delete. Guests only see approved pins.
          </p>
          <ul className="list">
            {memories.map((m) => (
              <li key={m.id}>
                <div className="row" style={{ alignItems: 'flex-start', gap: '1rem' }}>
                  <img
                    src={mediaUrl(m.imageUrl)}
                    alt=""
                    style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 8 }}
                  />
                  <div style={{ flex: 1 }}>
                    <strong>{m.names}</strong> · {m.status}
                    {m.staffPick ? ' · staff pick' : ''}
                    <p className="muted">{m.story}</p>
                    {m.rejectReason ? <p className="error">Reject: {m.rejectReason}</p> : null}
                    <div className="actions">
                      {m.status !== 'approved' && (
                        <button
                          type="button"
                          disabled={busyKey === `accept:${m.id}`}
                          onClick={() =>
                            void runAction(
                              `accept:${m.id}`,
                              async () => {
                                await api(`/admin/memory/${m.id}/accept`, {
                                  method: 'POST',
                                  token,
                                  body: { staffPick: false },
                                });
                                await refreshMemories();
                              },
                              'Accepted',
                            )
                          }
                        >
                          Accept
                        </button>
                      )}
                      {m.status === 'approved' && (
                        <button
                          type="button"
                          disabled={busyKey === `pick:${m.id}`}
                          onClick={() =>
                            void runAction(
                              `pick:${m.id}`,
                              async () => {
                                await api(`/admin/memory/${m.id}/staff-pick`, {
                                  method: 'PATCH',
                                  token,
                                  body: { staffPick: !m.staffPick },
                                });
                                await refreshMemories();
                              },
                              m.staffPick ? 'Removed staff pick' : 'Marked staff pick',
                            )
                          }
                        >
                          {m.staffPick ? 'Unpick' : 'Staff pick'}
                        </button>
                      )}
                      {m.status !== 'rejected' && (
                        <button
                          type="button"
                          disabled={busyKey === `reject:${m.id}`}
                          onClick={() =>
                            void runAction(
                              `reject:${m.id}`,
                              async () => {
                                await api(`/admin/memory/${m.id}/reject`, {
                                  method: 'POST',
                                  token,
                                  body: { reason: 'Not a fit for the wall' },
                                });
                                await refreshMemories();
                              },
                              'Rejected',
                            )
                          }
                        >
                          Reject
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busyKey === `del:${m.id}`}
                        onClick={() =>
                          void runAction(
                            `del:${m.id}`,
                            async () => {
                              await api(`/admin/memory/${m.id}`, {
                                method: 'DELETE',
                                token,
                              });
                              await refreshMemories();
                            },
                            'Deleted',
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {!memories.length && <li className="muted">No pins in this filter.</li>}
          </ul>
        </section>
      )}

      {tab === 'staff' && perms?.manageStaff && (
        <section className="card">
          <h2>Staff (admin only)</h2>
          <ul className="list">
            {staff.map((s) => (
              <li key={s.id}>
                {s.name} · {s.role} · {s.isActive ? 'active' : 'disabled'}
                <div className="actions">
                  <button
                    type="button"
                    disabled={busyKey === `staff:${s.id}`}
                    onClick={() =>
                      void runAction(
                        `staff:${s.id}`,
                        async () => {
                          await api(`/admin/staff/${s.id}`, {
                            method: 'PATCH',
                            token,
                            body: { isActive: !s.isActive },
                          });
                          setStaff(await api<StaffUser[]>('/admin/staff', { token }));
                        },
                        s.isActive ? `Disabled ${s.name}` : `Enabled ${s.name}`,
                      )
                    }
                  >
                    {busyKey === `staff:${s.id}`
                      ? 'Working…'
                      : s.isActive
                        ? 'Disable'
                        : 'Enable'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <h3>Add staff</h3>
          <div className="form-row">
            <input
              placeholder="Name"
              value={newStaff.name}
              onChange={(e) => setNewStaff((s) => ({ ...s, name: e.target.value }))}
            />
            <select
              value={newStaff.role}
              onChange={(e) =>
                setNewStaff((s) => ({ ...s, role: e.target.value as StaffRole }))
              }
            >
              <option value="cashier">cashier</option>
              <option value="manager">manager</option>
              <option value="admin">admin</option>
            </select>
            <input
              placeholder="PIN"
              value={newStaff.pin}
              onChange={(e) => setNewStaff((s) => ({ ...s, pin: e.target.value }))}
            />
            <button
              type="button"
              className="primary"
              disabled={busyKey === 'create-staff'}
              onClick={() =>
                void runAction(
                  'create-staff',
                  async () => {
                    await api('/admin/staff', {
                      method: 'POST',
                      token,
                      body: newStaff,
                    });
                    setStaff(await api<StaffUser[]>('/admin/staff', { token }));
                    setNewStaff({ name: '', role: 'cashier', pin: '' });
                  },
                  'Staff created',
                )
              }
            >
              {busyKey === 'create-staff' ? 'Working…' : 'Create'}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
