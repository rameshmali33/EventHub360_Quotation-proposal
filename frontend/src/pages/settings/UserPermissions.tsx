import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Loader2, Lock, Shield, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopHeader from '../../components/TopHeader';
import { useToast } from '../../context/ToastContext';
import { authService, type AuthUser } from '../../services/authService';
import { ASSIGNABLE_ROLES, normalizeRole, type AppRole } from '../../utils/permissions';

const roleAccess: Record<AppRole, string[]> = {
  'Super Admin': ['View quotes: Full', 'Create quotes: Full', 'Edit drafts: Full', 'Approve discounts: Full', 'Send to client: Full'],
  'Company Owner': ['View quotes: Full', 'Create quotes: Full', 'Edit drafts: Full', 'Approve discounts: Tier 3', 'Send to client: Full'],
  'Sales Manager': ['View quotes: Full', 'Create quotes: Full', 'Edit drafts: Full', 'Approve discounts: Tier 2', 'Send to client: Full'],
  'Sales Executive': ['View quotes: Own only', 'Create quotes: Yes', 'Edit drafts: Own only', 'Approve discounts: No', 'Send to client: If approved'],
  'Finance Manager': ['View quotes: Full', 'Create quotes: No', 'Edit drafts: No', 'Approve discounts: No', 'Send to client: No'],
  'Event Manager': ['View quotes: Won only', 'Create quotes: No', 'Edit drafts: No', 'Approve discounts: No', 'Send to client: No'],
  Auditor: ['View quotes: Full', 'Create quotes: No', 'Edit drafts: No', 'Approve discounts: No', 'Send to client: No'],
  Client: ['Client proposal viewer only'],
};

const roleColors: Record<AppRole, string> = {
  'Super Admin': 'bg-red-50 text-red-700',
  'Company Owner': 'bg-amber-50 text-amber-700',
  'Sales Manager': 'bg-indigo-50 text-indigo-700',
  'Sales Executive': 'bg-blue-50 text-blue-700',
  'Finance Manager': 'bg-emerald-50 text-emerald-700',
  'Event Manager': 'bg-cyan-50 text-cyan-700',
  Auditor: 'bg-violet-50 text-violet-700',
  Client: 'bg-gray-100 text-gray-700',
};

const UserPermissions = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [selectedRole, setSelectedRole] = useState<AppRole>('Sales Manager');
  const [pendingRoles, setPendingRoles] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authService.listUsers();
      setUsers(response);
      setPendingRoles(Object.fromEntries(response.map((user) => [user.id, normalizeRole(user.role)])));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const counts = useMemo(() => users.reduce((result, user) => {
    const role = normalizeRole(user.role);
    result[role] = (result[role] || 0) + 1;
    return result;
  }, {} as Record<AppRole, number>), [users]);

  const saveRole = async (user: AuthUser) => {
    const role = pendingRoles[user.id];
    if (!role || role === normalizeRole(user.role)) return;
    setSavingId(user.id);
    try {
      const updated = await authService.assignRole(user.id, role);
      setUsers((current) => current.map((item) => item.id === user.id ? { ...item, ...updated } : item));
      showToast(role + ' access assigned to ' + user.firstName + ' ' + user.lastName + '.', 'success');
    } catch (caught) {
      showToast(caught instanceof Error ? caught.message : 'Role assignment failed', 'error');
      setPendingRoles((current) => ({ ...current, [user.id]: normalizeRole(user.role) }));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-8 pb-24">
          <div className="max-w-[1240px] mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-7">
              <button onClick={() => navigate('/settings')} className="w-10 h-10 bg-white border border-[#ECECF1] rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50"><ArrowLeft className="w-5 h-5" /></button>
              <div>
                <h1 className="text-[28px] font-bold text-gray-900">Users & Role Access</h1>
                <p className="text-[14px] text-gray-500 mt-1">New accounts begin as Client. Only the Super Admin can assign operational roles.</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              <section className="rounded-lg border border-[#ECECF1] bg-white overflow-hidden shadow-sm">
                <div className="p-5 border-b border-[#ECECF1] bg-[#F8F9FC] flex items-center gap-3"><Shield className="w-5 h-5 text-red-600" /><h2 className="font-bold text-gray-900">Access Matrix</h2></div>
                <div className="divide-y divide-[#ECECF1]">
                  {(Object.keys(roleAccess) as AppRole[]).map((role) => (
                    <button key={role} onClick={() => setSelectedRole(role)} className={'w-full p-4 text-left transition-colors ' + (selectedRole === role ? 'bg-red-50/50' : 'hover:bg-gray-50')}>
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-extrabold text-gray-900 flex items-center gap-2">{role}{role === 'Super Admin' && <Lock className="w-3.5 h-3.5 text-gray-400" />}</span>
                        <span className={'rounded px-2 py-0.5 text-[10px] font-extrabold ' + roleColors[role]}>{counts[role] || 0} users</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-5 border-t border-[#ECECF1]">
                  <p className="text-[11px] font-extrabold uppercase text-gray-400 mb-3">{selectedRole} access</p>
                  <div className="space-y-2">
                    {roleAccess[selectedRole].map((access) => <p key={access} className="flex gap-2 text-[12px] font-semibold text-gray-600"><Check className="w-4 h-4 text-emerald-600 shrink-0" />{access}</p>)}
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-[#ECECF1] bg-white overflow-hidden shadow-sm">
                <div className="p-5 border-b border-[#ECECF1] bg-[#F8F9FC] flex items-center justify-between">
                  <div className="flex items-center gap-3"><Users className="w-5 h-5 text-red-600" /><div><h2 className="font-bold text-gray-900">Registered Users</h2><p className="text-[11px] font-semibold text-gray-500">{users.length} accounts</p></div></div>
                  <button onClick={loadUsers} className="text-[12px] font-bold text-red-600 hover:text-red-700">Refresh</button>
                </div>
                {error ? <div className="p-6 text-sm font-semibold text-red-700">{error}</div> : loading ? (
                  <div className="p-10 flex items-center justify-center gap-3 text-sm font-semibold text-gray-500"><Loader2 className="w-5 h-5 animate-spin" />Loading users...</div>
                ) : (
                  <div className="divide-y divide-[#ECECF1]">
                    {users.map((user) => {
                      const isAdmin = normalizeRole(user.role) === 'Super Admin';
                      const changed = pendingRoles[user.id] !== normalizeRole(user.role);
                      return (
                        <div key={user.id} className="grid grid-cols-[1fr_190px_90px] items-center gap-4 px-5 py-4">
                          <div className="min-w-0">
                            <p className="text-[14px] font-extrabold text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                            <p className="text-[12px] font-medium text-gray-500 truncate">{user.email} · {user.organizationName}</p>
                          </div>
                          {isAdmin ? (
                            <div className="h-10 flex items-center px-3 rounded-lg bg-red-50 text-red-700 text-[12px] font-extrabold"><Lock className="w-3.5 h-3.5 mr-2" />Super Admin</div>
                          ) : (
                            <select value={pendingRoles[user.id] || 'Client'} onChange={(event) => setPendingRoles((current) => ({ ...current, [user.id]: event.target.value }))} className="h-10 rounded-lg border border-[#E1E4EA] bg-white px-3 text-[12px] font-bold text-gray-700 outline-none focus:border-red-400">
                              {ASSIGNABLE_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                            </select>
                          )}
                          <button disabled={isAdmin || !changed || savingId === user.id} onClick={() => saveRole(user)} className="h-10 rounded-lg bg-gray-950 px-3 text-[12px] font-bold text-white disabled:bg-gray-100 disabled:text-gray-400">
                            {savingId === user.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserPermissions;