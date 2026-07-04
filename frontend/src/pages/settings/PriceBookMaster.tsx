import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpenCheck, CalendarDays, CheckCircle2, Edit3, Loader, Plus, Search, Trash2, X } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import TopHeader from '../../components/TopHeader';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useToast } from '../../context/ToastContext';
import { catalogService } from '../../services/catalogService';

interface PriceBookItem {
  price_book_id: number;
  name: string;
  valid_from?: string | null;
  valid_to?: string | null;
  is_active: boolean;
  created_at: string;
}

const emptyForm = { name: '', validFrom: '', validTo: '', isActive: true };
const toDateInput = (value?: string | null) => value ? new Date(value).toISOString().slice(0, 10) : '';
const displayDate = (value?: string | null) => value
  ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : 'No limit';

const PriceBookMaster = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [priceBooks, setPriceBooks] = useState<PriceBookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<PriceBookItem | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<PriceBookItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadPriceBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await catalogService.getPriceBooks(true);
      setPriceBooks(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Unable to load price books.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPriceBooks(); }, []);

  const filteredPriceBooks = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return priceBooks;
    return priceBooks.filter((book) => book.name.toLowerCase().includes(term));
  }, [priceBooks, searchQuery]);

  const openCreate = () => {
    setEditingBook(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (book: PriceBookItem) => {
    setEditingBook(book);
    setForm({
      name: book.name,
      validFrom: toDateInput(book.valid_from),
      validTo: toDateInput(book.valid_to),
      isActive: book.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      showToast('Price book name is required.', 'error');
      return;
    }
    if (form.validFrom && form.validTo && form.validTo < form.validFrom) {
      showToast('Valid To date cannot be earlier than Valid From.', 'error');
      return;
    }

    const payload = {
      name,
      ...(form.validFrom ? { validFrom: new Date(`${form.validFrom}T00:00:00`).toISOString() } : {}),
      ...(form.validTo ? { validTo: new Date(`${form.validTo}T23:59:59`).toISOString() } : {}),
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (editingBook) await catalogService.updatePriceBook(editingBook.price_book_id, payload);
      else await catalogService.createPriceBook(payload);
      showToast(editingBook ? 'Price book updated.' : 'Price book created.', 'success');
      setShowModal(false);
      await loadPriceBooks();
    } catch (err: any) {
      showToast(err.message || 'Unable to save price book.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await catalogService.deletePriceBook(deactivateTarget.price_book_id);
      showToast('Price book deactivated.', 'success');
      setDeactivateTarget(null);
      await loadPriceBooks();
    } catch (err: any) {
      showToast(err.message || 'Unable to deactivate price book.', 'error');
    }
  };

  const activeCount = priceBooks.filter((book) => book.is_active).length;
  const datedCount = priceBooks.filter((book) => book.valid_from || book.valid_to).length;

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      <div className="ml-[260px] flex h-screen flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-8 pb-24">
          <div className="mx-auto max-w-[1100px] space-y-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/price-book')} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ECECF1] bg-white text-gray-600 shadow-sm hover:bg-gray-50" aria-label="Back to price book">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-[28px] font-bold tracking-tight text-gray-900">Price Book Master</h1>
                  <p className="mt-1 text-[15px] text-gray-500">Manage price book names, validity periods, and availability.</p>
                </div>
              </div>
              <button onClick={openCreate} className="flex h-11 items-center gap-2 self-start rounded-full bg-gradient-to-r from-red-700 to-orange-400 px-5 text-[14px] font-bold text-white shadow-sm hover:shadow-md md:self-auto">
                <Plus className="h-4 w-4" /> Add Price Book
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-[20px] border border-[#ECECF1] bg-white p-5 shadow-sm"><p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Total Price Books</p><p className="mt-2 text-[28px] font-black text-gray-900">{priceBooks.length}</p></div>
              <div className="rounded-[20px] border border-[#ECECF1] bg-white p-5 shadow-sm"><p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Active</p><p className="mt-2 text-[28px] font-black text-emerald-600">{activeCount}</p></div>
              <div className="rounded-[20px] border border-[#ECECF1] bg-white p-5 shadow-sm"><p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Date Controlled</p><p className="mt-2 text-[28px] font-black text-indigo-600">{datedCount}</p></div>
            </div>

            <section className="overflow-hidden rounded-[24px] border border-[#ECECF1] bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-[#ECECF1] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-red-50 text-red-600"><BookOpenCheck className="h-5 w-5" /></div>
                  <div><h2 className="text-[18px] font-bold text-gray-900">Price Book Directory</h2><p className="text-[12px] font-semibold text-gray-500">Only active price books appear in the Price Book selector.</p></div>
                </div>
                <div className="relative sm:w-[320px]"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search price books..." className="h-10 w-full rounded-full border border-[#ECECF1] bg-[#F8F9FC] pl-10 pr-4 text-[13px] font-semibold outline-none focus:border-red-300" /></div>
              </div>

              {loading ? <div className="flex justify-center py-16"><Loader className="h-8 w-8 animate-spin text-red-500" /></div> : error ? (
                <div className="p-10 text-center"><p className="text-sm font-semibold text-red-600">{error}</p><button onClick={loadPriceBooks} className="mt-4 rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-700">Retry</button></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left">
                    <thead className="bg-[#F8F9FC]"><tr><th className="px-6 py-3 text-[12px] font-bold uppercase tracking-wider text-gray-500">Price Book</th><th className="px-6 py-3 text-[12px] font-bold uppercase tracking-wider text-gray-500">Validity</th><th className="px-6 py-3 text-[12px] font-bold uppercase tracking-wider text-gray-500">Status</th><th className="px-6 py-3 text-right text-[12px] font-bold uppercase tracking-wider text-gray-500">Actions</th></tr></thead>
                    <tbody>
                      {filteredPriceBooks.length === 0 ? <tr><td colSpan={4} className="py-12 text-center text-sm font-semibold text-gray-400">No price books found.</td></tr> : filteredPriceBooks.map((book) => (
                        <tr key={book.price_book_id} className="border-b border-[#ECECF1] hover:bg-gray-50">
                          <td className="px-6 py-4"><p className="text-[14px] font-bold text-gray-900">{book.name}</p><p className="mt-1 text-[11px] font-semibold text-gray-400">ID #{book.price_book_id}</p></td>
                          <td className="px-6 py-4"><div className="flex items-center gap-2 text-[13px] font-semibold text-gray-600"><CalendarDays className="h-4 w-4 text-gray-400" />{displayDate(book.valid_from)} - {displayDate(book.valid_to)}</div></td>
                          <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${book.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}><CheckCircle2 className="h-3.5 w-3.5" />{book.is_active ? 'Active' : 'Inactive'}</span></td>
                          <td className="px-6 py-4"><div className="flex justify-end gap-2"><button onClick={() => openEdit(book)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900" aria-label={`Edit ${book.name}`}><Edit3 className="h-4 w-4" /></button>{book.is_active && <button onClick={() => setDeactivateTarget(book)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label={`Deactivate ${book.name}`}><Trash2 className="h-4 w-4" /></button>}</div></td>
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
            <div className="flex items-center justify-between border-b border-[#ECECF1] p-6"><h3 className="text-[20px] font-bold text-gray-900">{editingBook ? 'Edit Price Book' : 'Add Price Book'}</h3><button onClick={() => setShowModal(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100" aria-label="Close"><X className="h-5 w-5" /></button></div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 p-6">
                <div><label className="mb-1.5 block text-[13px] font-bold text-gray-700">Price Book Name *</label><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Premium Corporate Price Book" className="h-11 w-full rounded-xl border border-transparent bg-gray-50 px-4 text-sm font-semibold outline-none focus:border-red-400 focus:bg-white" /></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-[13px] font-bold text-gray-700">Valid From</label><input type="date" value={form.validFrom} onChange={(event) => setForm({ ...form, validFrom: event.target.value })} className="h-11 w-full rounded-xl border border-transparent bg-gray-50 px-4 text-sm font-semibold outline-none focus:border-red-400" /></div><div><label className="mb-1.5 block text-[13px] font-bold text-gray-700">Valid To</label><input type="date" value={form.validTo} onChange={(event) => setForm({ ...form, validTo: event.target.value })} className="h-11 w-full rounded-xl border border-transparent bg-gray-50 px-4 text-sm font-semibold outline-none focus:border-red-400" /></div></div>
                <div><label className="mb-1.5 block text-[13px] font-bold text-gray-700">Availability</label><select value={form.isActive ? 'active' : 'inactive'} onChange={(event) => setForm({ ...form, isActive: event.target.value === 'active' })} className="h-11 w-full rounded-xl border border-transparent bg-gray-50 px-4 text-sm font-bold outline-none focus:border-red-400"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              </div>
              <div className="flex justify-end gap-3 border-t border-[#ECECF1] bg-gray-50 p-6"><button type="button" onClick={() => setShowModal(false)} className="h-11 rounded-full border border-gray-200 bg-white px-5 text-[13px] font-bold text-gray-700">Cancel</button><button type="submit" disabled={saving} className="h-11 rounded-full bg-gradient-to-r from-red-700 to-orange-400 px-6 text-[13px] font-bold text-white shadow-md disabled:opacity-60">{saving ? 'Saving...' : editingBook ? 'Save Changes' : 'Add Price Book'}</button></div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal open={Boolean(deactivateTarget)} title="Deactivate Price Book?" message={`${deactivateTarget?.name || 'This price book'} will no longer appear in the active Price Book selector. Existing rate cards are retained.`} confirmLabel="Deactivate" onCancel={() => setDeactivateTarget(null)} onConfirm={confirmDeactivate} />
    </div>
  );
};

export default PriceBookMaster;