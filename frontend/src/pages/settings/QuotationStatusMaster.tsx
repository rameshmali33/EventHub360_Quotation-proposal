import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Edit3, ListChecks, Loader, LockKeyhole, Plus, Search, Trash2, X } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import TopHeader from '../../components/TopHeader';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useToast } from '../../context/ToastContext';
import { QuotationStatusMasterItem, statusMasterService } from '../../services/statusMasterService';

const colors = ['gray', 'amber', 'indigo', 'emerald', 'blue', 'red', 'orange', 'purple'];
const colorStyles: Record<string, string> = {
  gray: 'bg-gray-100 text-gray-700',
  amber: 'bg-amber-50 text-amber-700',
  indigo: 'bg-indigo-50 text-indigo-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  blue: 'bg-blue-50 text-blue-700',
  red: 'bg-red-50 text-red-700',
  orange: 'bg-orange-50 text-orange-700',
  purple: 'bg-purple-50 text-purple-700',
};

const emptyForm = {
  code: '',
  label: '',
  description: '',
  color: 'gray',
  sortOrder: 100,
  isActive: true,
};

const QuotationStatusMaster = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [statuses, setStatuses] = useState<QuotationStatusMasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState<QuotationStatusMasterItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuotationStatusMasterItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadStatuses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await statusMasterService.list(true);
      setStatuses(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Unable to load quotation statuses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatuses();
  }, []);

  const filteredStatuses = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return statuses;
    return statuses.filter((status) =>
      `${status.code} ${status.label} ${status.description || ''}`.toLowerCase().includes(term),
    );
  }, [searchQuery, statuses]);

  const openCreate = () => {
    setEditingStatus(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (status: QuotationStatusMasterItem) => {
    setEditingStatus(status);
    setForm({
      code: status.code,
      label: status.label,
      description: status.description || '',
      color: status.color || 'gray',
      sortOrder: status.sort_order,
      isActive: status.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.label.trim() || (!editingStatus && !form.code.trim())) {
      showToast('Status code and display label are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...(!editingStatus ? { code: form.code.trim().toUpperCase() } : {}),
        label: form.label.trim(),
        description: form.description.trim(),
        color: form.color,
        sortOrder: Number(form.sortOrder),
        isActive: form.isActive,
      };
      if (editingStatus) {
        await statusMasterService.update(editingStatus.status_id, payload);
      } else {
        await statusMasterService.create(payload);
      }
      showToast(editingStatus ? 'Quotation status updated.' : 'Quotation status added.', 'success');
      setShowModal(false);
      await loadStatuses();
    } catch (err: any) {
      showToast(err.message || 'Unable to save quotation status.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await statusMasterService.remove(deleteTarget.status_id);
      showToast('Quotation status deleted.', 'success');
      setDeleteTarget(null);
      await loadStatuses();
    } catch (err: any) {
      showToast(err.message || 'Unable to delete quotation status.', 'error');
    }
  };

  const activeCount = statuses.filter((status) => status.is_active).length;

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      <div className="ml-[260px] flex h-screen flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-8 pb-24">
          <div className="mx-auto max-w-[1100px] space-y-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/settings')} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ECECF1] bg-white text-gray-600 shadow-sm hover:bg-gray-50" aria-label="Back to settings">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-[28px] font-bold tracking-tight text-gray-900">Quotation Status Master</h1>
                  <p className="mt-1 text-[15px] text-gray-500">Manage status labels and availability without changing workflow history.</p>
                </div>
              </div>
              <button onClick={openCreate} className="flex h-11 items-center gap-2 self-start rounded-full bg-gradient-to-r from-red-700 to-orange-400 px-5 text-[14px] font-bold text-white shadow-sm hover:shadow-md md:self-auto">
                <Plus className="h-4 w-4" /> Add Status
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-[20px] border border-[#ECECF1] bg-white p-5 shadow-sm">
                <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Total Statuses</p>
                <p className="mt-2 text-[28px] font-black text-gray-900">{statuses.length}</p>
              </div>
              <div className="rounded-[20px] border border-[#ECECF1] bg-white p-5 shadow-sm">
                <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Active</p>
                <p className="mt-2 text-[28px] font-black text-emerald-600">{activeCount}</p>
              </div>
              <div className="rounded-[20px] border border-[#ECECF1] bg-white p-5 shadow-sm">
                <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Protected Workflow</p>
                <p className="mt-2 text-[28px] font-black text-indigo-600">{statuses.filter((status) => status.is_system).length}</p>
              </div>
            </div>

            <section className="overflow-hidden rounded-[24px] border border-[#ECECF1] bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-[#ECECF1] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-red-50 text-red-600"><ListChecks className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-[18px] font-bold text-gray-900">Status Directory</h2>
                    <p className="text-[12px] font-semibold text-gray-500">Only active statuses appear in quotation filters.</p>
                  </div>
                </div>
                <div className="relative sm:w-[320px]">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search statuses..." className="h-10 w-full rounded-full border border-[#ECECF1] bg-[#F8F9FC] pl-10 pr-4 text-[13px] font-semibold outline-none focus:border-red-300" />
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-16"><Loader className="h-8 w-8 animate-spin text-red-500" /></div>
              ) : error ? (
                <div className="p-10 text-center">
                  <p className="text-sm font-semibold text-red-600">{error}</p>
                  <button onClick={loadStatuses} className="mt-4 rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-700">Retry</button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left">
                    <thead className="bg-[#F8F9FC]">
                      <tr>
                        <th className="px-6 py-3 text-[12px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                        <th className="px-6 py-3 text-[12px] font-bold uppercase tracking-wider text-gray-500">Description</th>
                        <th className="px-6 py-3 text-[12px] font-bold uppercase tracking-wider text-gray-500">Availability</th>
                        <th className="px-6 py-3 text-right text-[12px] font-bold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStatuses.length === 0 ? (
                        <tr><td colSpan={4} className="py-12 text-center text-sm font-semibold text-gray-400">No quotation statuses found.</td></tr>
                      ) : filteredStatuses.map((status) => (
                        <tr key={status.status_id} className="border-b border-[#ECECF1] hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase ${colorStyles[status.color] || colorStyles.gray}`}>{status.label}</span>
                              <div>
                                <p className="font-mono text-[12px] font-bold text-gray-700">{status.code}</p>
                                <p className="mt-0.5 text-[10px] font-bold uppercase text-gray-400">{status.is_system ? 'System' : 'Custom'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="max-w-[420px] px-6 py-4 text-[13px] font-semibold text-gray-600">{status.description || 'No description'}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${status.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                              <CheckCircle2 className="h-3.5 w-3.5" /> {status.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => openEdit(status)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900" aria-label={`Edit ${status.label}`}><Edit3 className="h-4 w-4" /></button>
                              {status.is_system ? (
                                <span className="rounded-lg p-2 text-gray-300" title="System statuses cannot be deleted"><LockKeyhole className="h-4 w-4" /></span>
                              ) : (
                                <button onClick={() => setDeleteTarget(status)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${status.label}`}><Trash2 className="h-4 w-4" /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[560px] overflow-hidden rounded-[24px] border border-[#ECECF1] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ECECF1] p-6">
              <h3 className="text-[20px] font-bold text-gray-900">{editingStatus ? 'Edit Quotation Status' : 'Add Quotation Status'}</h3>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-bold text-gray-700">Status Code *</label>
                    <input value={form.code} disabled={Boolean(editingStatus)} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })} placeholder="e.g. ON_HOLD" className="h-11 w-full rounded-xl border border-transparent bg-gray-50 px-4 font-mono text-sm font-bold outline-none focus:border-red-400 focus:bg-white disabled:text-gray-400" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-bold text-gray-700">Display Label *</label>
                    <input value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} placeholder="e.g. On Hold" className="h-11 w-full rounded-xl border border-transparent bg-gray-50 px-4 text-sm font-semibold outline-none focus:border-red-400 focus:bg-white" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-gray-700">Description</label>
                  <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} placeholder="Explain when this status is used" className="w-full resize-none rounded-xl border border-transparent bg-gray-50 px-4 py-3 text-sm font-semibold outline-none focus:border-red-400 focus:bg-white" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-bold text-gray-700">Color</label>
                    <select value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} className="h-11 w-full rounded-xl border border-transparent bg-gray-50 px-3 text-sm font-bold capitalize outline-none focus:border-red-400">{colors.map((color) => <option key={color} value={color}>{color}</option>)}</select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-bold text-gray-700">Sort Order</label>
                    <input type="number" min="0" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} className="h-11 w-full rounded-xl border border-transparent bg-gray-50 px-4 text-sm font-bold outline-none focus:border-red-400" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-bold text-gray-700">Availability</label>
                    <select value={form.isActive ? 'active' : 'inactive'} onChange={(event) => setForm({ ...form, isActive: event.target.value === 'active' })} className="h-11 w-full rounded-xl border border-transparent bg-gray-50 px-3 text-sm font-bold outline-none focus:border-red-400"><option value="active">Active</option><option value="inactive">Inactive</option></select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-[#ECECF1] bg-gray-50 p-6">
                <button type="button" onClick={() => setShowModal(false)} className="h-11 rounded-full border border-gray-200 bg-white px-5 text-[13px] font-bold text-gray-700">Cancel</button>
                <button type="submit" disabled={saving} className="h-11 rounded-full bg-gradient-to-r from-red-700 to-orange-400 px-6 text-[13px] font-bold text-white shadow-md disabled:opacity-60">{saving ? 'Saving...' : editingStatus ? 'Save Changes' : 'Add Status'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal open={Boolean(deleteTarget)} title="Delete Quotation Status?" message={`This will permanently remove ${deleteTarget?.label || 'this custom status'} from the master.`} confirmLabel="Delete Status" onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
    </div>
  );
};

export default QuotationStatusMaster;