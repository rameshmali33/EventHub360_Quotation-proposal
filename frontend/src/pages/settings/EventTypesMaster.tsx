import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopHeader from '../../components/TopHeader';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, CalendarDays, CheckCircle2, Edit3, Plus, Search, Trash2, X } from 'lucide-react';
import { EventTypeMasterItem, getEventTypes, saveEventTypes } from '../../utils/eventTypes';

const emptyForm = {
  name: '',
  description: '',
  status: 'Active' as 'Active' | 'Inactive',
};

const EventTypesMaster = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [eventTypes, setEventTypes] = useState<EventTypeMasterItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<EventTypeMasterItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventTypeMasterItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setEventTypes(getEventTypes());
  }, []);

  const persist = (next: EventTypeMasterItem[]) => {
    saveEventTypes(next);
    setEventTypes(next);
  };

  const filteredEventTypes = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return eventTypes;
    return eventTypes.filter((item) => `${item.name} ${item.description} ${item.status}`.toLowerCase().includes(term));
  }, [eventTypes, searchQuery]);

  const openCreate = () => {
    setEditingType(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item: EventTypeMasterItem) => {
    setEditingType(item);
    setForm({ name: item.name, description: item.description, status: item.status });
    setShowModal(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      showToast('Event type name is required.', 'error');
      return;
    }

    const duplicate = eventTypes.some((item) => item.name.toLowerCase() === name.toLowerCase() && item.id !== editingType?.id);
    if (duplicate) {
      showToast('This event type already exists.', 'error');
      return;
    }

    const payload: EventTypeMasterItem = {
      id: editingType?.id || `event-${Date.now()}`,
      name,
      description: form.description.trim() || 'Custom event type',
      status: form.status,
    };

    const next = editingType
      ? eventTypes.map((item) => item.id === editingType.id ? payload : item)
      : [payload, ...eventTypes];

    persist(next);
    setShowModal(false);
    showToast(editingType ? 'Event type updated.' : 'Event type added.', 'success');
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    persist(eventTypes.filter((item) => item.id !== deleteTarget.id));
    showToast('Event type deleted.', 'success');
    setDeleteTarget(null);
  };

  const activeCount = eventTypes.filter((item) => item.status === 'Active').length;

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-8 pb-32">
          <div className="max-w-[1100px] mx-auto space-y-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between mb-8">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/settings')} className="w-10 h-10 bg-white border border-[#ECECF1] rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Event Type Master</h1>
                  <p className="text-[15px] text-gray-500 mt-1">Create, edit, deactivate, or delete event types used while creating quotations.</p>
                </div>
              </div>
              <button onClick={openCreate} className="h-11 px-5 bg-gradient-to-r from-red-700 to-orange-400 text-white rounded-full font-bold text-[14px] shadow-sm hover:shadow-md transition-all flex items-center gap-2 self-start md:self-auto">
                <Plus className="w-4 h-4" /> Add Event Type
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-[#ECECF1] rounded-[20px] p-5 shadow-sm">
                <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Total Event Types</p>
                <p className="text-[28px] font-black text-gray-900 mt-2">{eventTypes.length}</p>
              </div>
              <div className="bg-white border border-[#ECECF1] rounded-[20px] p-5 shadow-sm">
                <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Active</p>
                <p className="text-[28px] font-black text-emerald-600 mt-2">{activeCount}</p>
              </div>
              <div className="bg-white border border-[#ECECF1] rounded-[20px] p-5 shadow-sm">
                <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Used In</p>
                <p className="text-[18px] font-black text-gray-900 mt-3">Create Quotation</p>
              </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-[#ECECF1] overflow-hidden">
              <div className="p-5 border-b border-[#ECECF1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-red-50 flex items-center justify-center text-red-600">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-gray-900">Event Type Directory</h2>
                    <p className="text-[12px] font-semibold text-gray-500">Only active types appear in the quotation wizard.</p>
                  </div>
                </div>
                <div className="relative sm:w-[320px]">
                  <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search event types..."
                    className="w-full h-10 pl-10 pr-4 bg-[#F8F9FC] border border-[#ECECF1] rounded-full text-[13px] font-semibold focus:outline-none focus:border-red-300"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#F8F9FC]">
                    <tr>
                      <th className="py-3 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Event Type</th>
                      <th className="py-3 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="py-3 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEventTypes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-sm font-semibold text-gray-400">No event types found.</td>
                      </tr>
                    ) : filteredEventTypes.map((item) => (
                      <tr key={item.id} className="border-b border-[#ECECF1] hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <p className="text-[14px] font-bold text-gray-900">{item.name}</p>
                        </td>
                        <td className="py-4 px-6 text-[13px] font-semibold text-gray-600 max-w-[460px]">{item.description}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            <CheckCircle2 className="w-3.5 h-3.5" /> {item.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEdit(item)} className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors" aria-label="Edit event type">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteTarget(item)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" aria-label="Delete event type">
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
              <h3 className="text-[20px] font-bold text-gray-900">{editingType ? 'Edit Event Type' : 'Add Event Type'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Event Type Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold focus:bg-white focus:border-red-400 focus:outline-none" placeholder="e.g. Product Launch" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold focus:bg-white focus:border-red-400 focus:outline-none resize-none" placeholder="Where this event type should be used" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'Active' | 'Inactive' })} className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-red-400 focus:outline-none">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-[#ECECF1] bg-gray-50 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="h-11 px-5 rounded-full border border-gray-200 bg-white text-[13px] font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="h-11 px-6 rounded-full bg-gradient-to-r from-red-700 to-orange-400 text-white text-[13px] font-bold shadow-md hover:shadow-lg">{editingType ? 'Save Changes' : 'Add Event Type'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Delete Event Type?"
        message={`This will remove ${deleteTarget?.name || 'this event type'} from the event type master.`}
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default EventTypesMaster;
