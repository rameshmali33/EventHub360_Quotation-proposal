import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopHeader from '../../components/TopHeader';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft, Users, Shield, Plus, Edit2, Trash2, CheckCircle2, Lock, X
} from 'lucide-react';

const ROLES_KEY = 'user_permission_roles';

type PermissionKey = 'createQuotes' | 'approveQuotes' | 'deleteQuotes' | 'manageTemplates' | 'manageBranding';

type Role = {
  id: string;
  name: string;
  type: 'System' | 'Custom';
  users: number;
  color: string;
  permissions: Record<PermissionKey, boolean>;
};

const defaultRoles: Role[] = [
  {
    id: 'role-admin',
    name: 'Administrator',
    type: 'System',
    users: 1,
    color: 'bg-red-50 text-red-700',
    permissions: {
      createQuotes: true,
      approveQuotes: true,
      deleteQuotes: true,
      manageTemplates: true,
      manageBranding: true,
    },
  },
  {
    id: 'role-sales-director',
    name: 'Sales Director',
    type: 'System',
    users: 0,
    color: 'bg-indigo-50 text-indigo-700',
    permissions: {
      createQuotes: true,
      approveQuotes: true,
      deleteQuotes: false,
      manageTemplates: true,
      manageBranding: false,
    },
  },
];

const permissionLabels: { key: PermissionKey; title: string; desc: string; group: 'Quotations & Proposals' | 'Template Library' }[] = [
  { key: 'createQuotes', title: 'Create & Edit Quotes', desc: 'Allow generating and modifying quotations.', group: 'Quotations & Proposals' },
  { key: 'approveQuotes', title: 'Approve Quotes', desc: 'Allow approval workflow actions.', group: 'Quotations & Proposals' },
  { key: 'deleteQuotes', title: 'Delete Quotes', desc: 'Allow removing quotation records.', group: 'Quotations & Proposals' },
  { key: 'manageTemplates', title: 'Manage Templates', desc: 'Create, edit, and archive global templates.', group: 'Template Library' },
  { key: 'manageBranding', title: 'Manage Branding', desc: 'Update global styling and brand settings.', group: 'Template Library' },
];

const ToggleSwitch = ({ enabled, onChange, disabled = false }: any) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onChange(!enabled)}
    className={`w-11 h-6 rounded-full transition-colors relative disabled:opacity-60 ${enabled ? 'bg-red-700' : 'bg-gray-200'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enabled ? 'left-6' : 'left-1'}`} />
  </button>
);

const emptyPermissions: Record<PermissionKey, boolean> = {
  createQuotes: true,
  approveQuotes: false,
  deleteQuotes: false,
  manageTemplates: false,
  manageBranding: false,
};

const UserPermissions = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('role-sales-director');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [rolePendingDelete, setRolePendingDelete] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleUsers, setRoleUsers] = useState('0');
  const [rolePermissions, setRolePermissions] = useState<Record<PermissionKey, boolean>>(emptyPermissions);

  useEffect(() => {
    const saved = localStorage.getItem(ROLES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setRoles(parsed);
      setSelectedRoleId(parsed[1]?.id || parsed[0]?.id || '');
    } else {
      localStorage.setItem(ROLES_KEY, JSON.stringify(defaultRoles));
      setRoles(defaultRoles);
      setSelectedRoleId(defaultRoles[1].id);
    }
  }, []);

  const saveRoles = (next: Role[]) => {
    localStorage.setItem(ROLES_KEY, JSON.stringify(next));
    setRoles(next);
  };

  const selectedRole = roles.find((role) => role.id === selectedRoleId) || roles[0];
  const selectedPermissions = selectedRole?.permissions || emptyPermissions;

  const openCreateRole = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleUsers('0');
    setRolePermissions(emptyPermissions);
    setShowRoleModal(true);
  };

  const openEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleUsers(String(role.users));
    setRolePermissions(role.permissions);
    setShowRoleModal(true);
  };

  const handleRoleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!roleName.trim()) {
      showToast('Role name is required.', 'error');
      return;
    }

    const role: Role = {
      id: editingRole?.id || `role-${Date.now()}`,
      name: roleName.trim(),
      type: editingRole?.type || 'Custom',
      users: Number(roleUsers || 0),
      color: editingRole?.color || 'bg-emerald-50 text-emerald-700',
      permissions: rolePermissions,
    };

    const next = editingRole
      ? roles.map((item) => item.id === editingRole.id ? role : item)
      : [...roles, role];
    saveRoles(next);
    setSelectedRoleId(role.id);
    setShowRoleModal(false);
    showToast(editingRole ? 'Role updated successfully.' : 'Role created successfully.', 'success');
  };

  const confirmDeleteRole = () => {
    if (!rolePendingDelete) return;
    const next = roles.filter((role) => role.id !== rolePendingDelete.id);
    saveRoles(next);
    if (selectedRoleId === rolePendingDelete.id) {
      setSelectedRoleId(next[0]?.id || '');
    }
    showToast('Role deleted successfully.', 'success');
    setRolePendingDelete(null);
  };

  const updateSelectedPermission = (key: PermissionKey, value: boolean) => {
    if (!selectedRole || selectedRole.type === 'System') return;
    const updatedRole = {
      ...selectedRole,
      permissions: {
        ...selectedRole.permissions,
        [key]: value,
      },
    };
    saveRoles(roles.map((role) => role.id === selectedRole.id ? updatedRole : role));
  };

  const groupedPermissions = permissionLabels.reduce((acc, item) => {
    acc[item.group] = [...(acc[item.group] || []), item];
    return acc;
  }, {} as Record<string, typeof permissionLabels>);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-8 pb-32">
          <div className="max-w-[1200px] mx-auto space-y-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/settings')} className="w-10 h-10 bg-white border border-[#ECECF1] rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Roles & Permissions</h1>
                  <p className="text-[15px] text-gray-500 mt-1">Manage user access control and feature permissions.</p>
                </div>
              </div>
              <button onClick={openCreateRole} className="px-5 py-2.5 bg-gradient-to-r from-red-700 to-orange-400 text-white rounded-full font-bold text-[14px] shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Role
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-[24px] shadow-sm border border-[#ECECF1] overflow-hidden">
                  <div className="p-6 border-b border-[#ECECF1] flex items-center gap-3 bg-[#F8F9FC]">
                    <div className="w-8 h-8 rounded-[12px] bg-white shadow-sm flex items-center justify-center text-gray-700">
                      <Users className="w-4 h-4" />
                    </div>
                    <h2 className="text-[16px] font-bold text-gray-900">Configured Roles</h2>
                  </div>
                  <div className="divide-y divide-[#ECECF1]">
                    {roles.map((role) => (
                      <button key={role.id} onClick={() => setSelectedRoleId(role.id)} className={`w-full p-5 text-left hover:bg-gray-50 transition-colors group ${selectedRoleId === role.id ? 'bg-red-50/40' : 'bg-white'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                            {role.name}
                            {role.type === 'System' && <Lock className="w-3 h-3 text-gray-400" />}
                          </h4>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(event) => event.stopPropagation()}>
                            <button type="button" onClick={() => openEditRole(role)} className="text-gray-400 hover:text-gray-900"><Edit2 className="w-3.5 h-3.5" /></button>
                            {role.type !== 'System' && <button type="button" onClick={() => setRolePendingDelete(role)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${role.color}`}>{role.users} Users</span>
                          <span className="text-[12px] text-gray-500 font-semibold">{role.type} Role</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="bg-white rounded-[24px] shadow-sm border border-[#ECECF1] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-red-50 flex items-center justify-center text-red-600">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-[18px] font-bold text-gray-900">Permission Matrix</h2>
                        <p className="text-[13px] text-gray-500 mt-1">Editing permissions for: <span className="font-bold text-gray-700">{selectedRole?.name || 'No role selected'}</span></p>
                      </div>
                    </div>
                    {selectedRole?.type === 'System' && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[11px] font-black uppercase">System role locked</span>
                    )}
                  </div>

                  <div className="space-y-8">
                    {Object.entries(groupedPermissions).map(([group, items]) => (
                      <div key={group}>
                        <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-widest mb-4 bg-[#F8F9FC] p-3 rounded-xl border border-[#ECECF1]">{group}</h3>
                        <div className="space-y-4 px-2">
                          {items.map((permission) => (
                            <div key={permission.key} className="flex items-center justify-between">
                              <div>
                                <p className="text-[14px] font-bold text-gray-700">{permission.title}</p>
                                <p className="text-[12px] text-gray-500">{permission.desc}</p>
                              </div>
                              <ToggleSwitch enabled={Boolean(selectedPermissions[permission.key])} disabled={selectedRole?.type === 'System'} onChange={(value: boolean) => updateSelectedPermission(permission.key, value)} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showRoleModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] w-full max-w-[520px] shadow-2xl border border-[#ECECF1] overflow-hidden">
            <div className="p-6 border-b border-[#ECECF1] flex items-center justify-between">
              <h3 className="text-[20px] font-bold text-gray-900">{editingRole ? 'Edit Role' : 'Create Role'}</h3>
              <button onClick={() => setShowRoleModal(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleRoleSave}>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Role Name *</label>
                  <input value={roleName} onChange={(event) => setRoleName(event.target.value)} className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold focus:bg-white focus:border-red-400 focus:outline-none" placeholder="e.g. Sales Executive" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Assigned Users</label>
                  <input type="number" min="0" value={roleUsers} onChange={(event) => setRoleUsers(event.target.value)} className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold focus:bg-white focus:border-red-400 focus:outline-none" />
                </div>
                <div className="rounded-2xl border border-[#ECECF1] p-4 space-y-3">
                  <p className="text-[13px] font-bold text-gray-700">Starting Permissions</p>
                  {permissionLabels.map((permission) => (
                    <div key={permission.key} className="flex items-center justify-between gap-4">
                      <span className="text-[13px] font-semibold text-gray-600">{permission.title}</span>
                      <ToggleSwitch enabled={rolePermissions[permission.key]} onChange={(value: boolean) => setRolePermissions({ ...rolePermissions, [permission.key]: value })} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-[#ECECF1] bg-gray-50 flex justify-end gap-3">
                <button type="button" onClick={() => setShowRoleModal(false)} className="h-11 px-5 rounded-full border border-gray-200 bg-white text-[13px] font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="h-11 px-6 rounded-full bg-gradient-to-r from-red-700 to-orange-400 text-white text-[13px] font-bold shadow-md hover:shadow-lg">{editingRole ? 'Save Changes' : 'Create Role'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        open={Boolean(rolePendingDelete)}
        title="Delete Role?"
        message={`This will remove ${rolePendingDelete?.name || 'this role'} from permissions.`}
        confirmLabel="Delete Role"
        onCancel={() => setRolePendingDelete(null)}
        onConfirm={confirmDeleteRole}
      />
    </div>
  );
};

export default UserPermissions;
