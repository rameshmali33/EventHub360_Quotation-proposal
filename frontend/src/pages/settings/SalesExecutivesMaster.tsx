import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopHeader from '../../components/TopHeader';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Mail, Phone, Plus, Search, Trash2, UserRound, X, Edit3, CheckCircle2 } from 'lucide-react';

const SALES_EXECUTIVES_KEY = 'sales_executives_master';

type SalesExecutive = {
  id: string;
  name: string;
  email: string;
  phone: string;
  territory: string;
  target: number;
  status: 'Active' | 'Inactive';
};

const seedExecutives: SalesExecutive[] = [
  {
    id: 'se-1',
    name: 'Ramesh Mali',
    email: 'ramesh.mali@eventhub360.com',
    phone: '+91 98765 43210',
    territory: 'Mumbai',
    target: 500000,
    status: 'Active',
  },
];

const formatINR = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  territory: '',
  target: '0',
  status: 'Active' as 'Active' | 'Inactive',
};

const SalesExecutivesMaster = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [executives, setExecutives] = useState<SalesExecutive[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExecutive, setEditingExecutive] = useState<SalesExecutive | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SalesExecutive | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const saved = localStorage.getItem(SALES_EXECUTIVES_KEY);
    if (saved) {
      setExecutives(JSON.parse(saved));
    } else {
      localStorage.setItem(SALES_EXECUTIVES_KEY, JSON.stringify(seedExecutives));
      setExecutives(seedExecutives);
    }
  }, []);

  const saveExecutives = (next: SalesExecutive[]) => {
    localStorage.setItem(SALES_EXECUTIVES_KEY, JSON.stringify(next));
    setExecutives(next);
  };

  const filteredExecutives = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return executives;
    return executives.filter((item) => `${item.name} ${item.email} ${item.phone} ${item.territory} ${item.status}`.toLowerCase().includes(term));
  }, [executives, searchQuery]);

  const openCreate = () => {
    setEditingExecutive(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (executive: SalesExecutive) => {
    setEditingExecutive(executive);
    setForm({
      name: executive.name,
      email: executive.email,
      phone: executive.phone,
      territory: executive.territory,
      target: String(executive.target),
      status: executive.status,
    });
    setShowModal(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      showToast('Name, email, and mobile number are required.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      showToast('Enter a valid email address.', 'error');
      return;
    }

    const payload: SalesExecutive = {
      id: editingExecutive?.id || `se-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      territory: form.territory.trim() || 'Unassigned',
      target: Number(form.target || 0),
      status: form.status,
    };

    const next = editingExecutive
      ? executives.map((item) => item.id === editingExecutive.id ? payload : item)
      : [payload, ...executives];

    saveExecutives(next);
    setShowModal(false);
    showToast(editingExecutive ? 'Sales executive updated.' : 'Sales executive added.', 'success');
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    saveExecutives(executives.filter((item) => item.id !== deleteTarget.id));
    showToast('Sales executive deleted.', 'success');
    setDeleteTarget(null);
  };

  const activeCount = executives.filter((item) => item.status === 'Active').length;
  const targetTotal = executives.reduce((sum, item) => sum + Number(item.target || 0), 0);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-8 pb-32">
          <div className="max-w-[1200px] mx-auto space-y-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between mb-8">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/settings')} className="w-10 h-10 bg-white border border-[#ECECF1] rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Sales Executives Master</h1>
                  <p className="text-[15px] text-gray-500 mt-1">Add and manage sales executives used for ownership, follow-ups, and approval routing.</p>
                </div>
              </div>
              <button onClick={openCreate} className="h-11 px-5 bg-gradient-to-r from-red-700 to-orange-400 text-white rounded-full font-bold text-[14px] shadow-sm hover:shadow-md transition-all flex items-center gap-2 self-start md:self-auto">
                <Plus className="w-4 h-4" /> Add Executive
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-[#ECECF1] rounded-[20px] p-5 shadow-sm">
                <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Total Executives</p>
                <p className="text-[28px] font-black text-gray-900 mt-2">{executives.length}</p>
              </div>
              <div className="bg-white border border-[#ECECF1] rounded-[20px] p-5 shadow-sm">
                <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Active</p>
                <p className="text-[28px] font-black text-emerald-600 mt-2">{activeCount}</p>
              </div>
              <div className="bg-white border border-[#ECECF1] rounded-[20px] p-5 shadow-sm">
                <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Monthly Target</p>
                <p className="text-[28px] font-black text-gray-900 mt-2">{formatINR(targetTotal)}</p>
              </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-[#ECECF1] overflow-hidden">
              <div className="p-5 border-b border-[#ECECF1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-red-50 flex items-center justify-center text-red-600">
                    <UserRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-gray-900">Executive Directory</h2>
                    <p className="text-[12px] font-semibold text-gray-500">Search, edit, or deactivate sales users.</p>
                  </div>
                </div>
                <div className="relative sm:w-[320px]">
                  <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search executives..."
                    className="w-full h-10 pl-10 pr-4 bg-[#F8F9FC] border border-[#ECECF1] rounded-full text-[13px] font-semibold focus:outline-none focus:border-red-300"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#F8F9FC]">
                    <tr>
                      <th className="py-3 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Executive</th>
                      <th className="py-3 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="py-3 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Territory</th>
                      <th className="py-3 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Target</th>
                      <th className="py-3 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExecutives.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-sm font-semibold text-gray-400">No sales executives found.</td>
                      </tr>
                    ) : filteredExecutives.map((executive) => (
                      <tr key={executive.id} className="border-b border-[#ECECF1] hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-black text-sm">
                              {executive.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-[14px] font-bold text-gray-900">{executive.name}</p>
                              <p className="text-[12px] text-gray-500">Sales Executive</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-[13px] font-semibold text-gray-700 flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400" /> {executive.email}</p>
                          <p className="text-[13px] font-semibold text-gray-500 flex items-center gap-2 mt-1"><Phone className="w-3.5 h-3.5 text-gray-400" /> {executive.phone}</p>
                        </td>
                        <td className="py-4 px-6 text-[13px] font-bold text-gray-700">{executive.territory}</td>
                        <td className="py-4 px-6 text-[13px] font-black text-gray-900">{formatINR(executive.target)}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase ${executive.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            <CheckCircle2 className="w-3.5 h-3.5" /> {executive.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEdit(executive)} className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors" aria-label="Edit sales executive">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteTarget(executive)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" aria-label="Delete sales executive">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] w-full max-w-[560px] shadow-2xl border border-[#ECECF1] overflow-hidden">
            <div className="p-6 border-b border-[#ECECF1] flex items-center justify-between">
              <h3 className="text-[20px] font-bold text-gray-900">{editingExecutive ? 'Edit Sales Executive' : 'Add Sales Executive'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Full Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold focus:bg-white focus:border-red-400 focus:outline-none" placeholder="e.g. Asha Verma" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold focus:bg-white focus:border-red-400 focus:outline-none" placeholder="name@eventhub360.com" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Mobile *</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold focus:bg-white focus:border-red-400 focus:outline-none" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Territory</label>
                  <input value={form.territory} onChange={(e) => setForm({ ...form, territory: e.target.value })} className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold focus:bg-white focus:border-red-400 focus:outline-none" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Monthly Target (₹)</label>
                  <input type="number" min="0" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold focus:bg-white focus:border-red-400 focus:outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'Active' | 'Inactive' })} className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-red-400 focus:outline-none">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-[#ECECF1] bg-gray-50 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="h-11 px-5 rounded-full border border-gray-200 bg-white text-[13px] font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="h-11 px-6 rounded-full bg-gradient-to-r from-red-700 to-orange-400 text-white text-[13px] font-bold shadow-md hover:shadow-lg">{editingExecutive ? 'Save Changes' : 'Add Executive'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Delete Sales Executive?"
        message={`This will remove ${deleteTarget?.name || 'this executive'} from the sales master.`}
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default SalesExecutivesMaster;
