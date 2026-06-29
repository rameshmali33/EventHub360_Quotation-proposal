import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../components/ConfirmationModal';
import { quotationService } from '../services/quotationService';
import { proposalService } from '../services/proposalService';
import { useToast } from '../context/ToastContext';
import { Loader, Search, Filter, Download, MoreVertical, ChevronRight, Eye, FileText, Trash2, X } from 'lucide-react';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const tabIds = ['active', 'draft', 'sent', 'pending_approval', 'approved', 'accepted', 'rejected', 'expired'];

const normalizeTabFromStatus = (status: string | null) => {
  const normalized = (status || 'active').toLowerCase();
  return tabIds.includes(normalized) ? normalized : 'active';
};

const QuotationsMasterList = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => normalizeTabFromStatus(searchParams.get('status')));
  const [searchVal, setSearchVal] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(7);
  const [exporting, setExporting] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minTotal, setMinTotal] = useState('');
  const [maxTotal, setMaxTotal] = useState('');
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const tabs = [
    { id: 'active', label: 'Active' },
    { id: 'draft', label: 'Draft' },
    { id: 'sent', label: 'Sent' },
    { id: 'pending_approval', label: 'Pending Approval' },
    { id: 'approved', label: 'Approved' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'expired', label: 'Expired' },
  ];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchVal);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchVal]);

  useEffect(() => {
    setCurrentPage(1);
    setActionMenuId(null);
  }, [activeTab]);

  useEffect(() => {
    const nextTab = normalizeTabFromStatus(searchParams.get('status'));
    if (nextTab !== activeTab) setActiveTab(nextTab);
  }, [activeTab, searchParams]);

  const fetchQuotes = () => {
    setLoading(true);
    const queryStatus = activeTab === 'active' ? undefined : activeTab;
    quotationService.getQuotations({ 
      page: currentPage, 
      limit, 
      search: debouncedSearch, 
      status: queryStatus 
    })
      .then(res => {
        console.log("Loaded quotations from backend", res);
        
        // Map backend fields exactly
        const mapped = (res.data || []).map((q: any) => {
          const subtotal = Number(q.subtotal) || 0;
          const margin = Number(q.margin) || 0;
          const marginPercent = subtotal > 0 ? ((margin / subtotal) * 100).toFixed(1) : '0.0';
          
          return {
            id: q.quotation_id,
            quotation_id: q.quotation_id,
            quoteNumber: `#QT-${q.quotation_id}`,
            clientName: q.lead?.name ?? "Unknown Client",
            status: q.status,
            currency: q.currency,
            amount: Number(q.total || 0),
            subtotal: subtotal,
            tax: Number(q.tax_total) || 0,
            margin: margin,
            marginPercent: `${marginPercent}%`,
            createdDate: q.created_at,
            eventDate: q.expires_at,
            lines: q.lines || [],
            event: q.event_name || q.eventType || q.event_type || 'Quotation'
          };
        });

        setQuotes(mapped);
        setTotalItems(res.total || 0);
        if (res.limit) setLimit(res.limit);
        setTotalPages(Math.max(1, Math.ceil((res.total || 0) / (res.limit || limit))));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuotes();
  }, [currentPage, activeTab, debouncedSearch]);

  const filteredQuotes = quotes.filter((quote: any) => {
    const total = Number(quote.amount || 0);
    const min = minTotal ? Number(minTotal) : null;
    const max = maxTotal ? Number(maxTotal) : null;
    if (min !== null && total < min) return false;
    if (max !== null && total > max) return false;
    return true;
  });

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const nextParams = new URLSearchParams(searchParams);
    if (tabId === 'active') nextParams.delete('status');
    else nextParams.set('status', tabId);
    setSearchParams(nextParams);
  };

  const buildCsv = (items: any[]) => {
    const header = ['Quote Number', 'Client Name', 'Event', 'Status', 'Subtotal', 'Tax', 'Total', 'Margin', 'Created At'];
    const rows = items.map((quote: any) => {
      return [
        quote.quoteNumber,
        quote.clientName,
        quote.event,
        quote.status || '',
        Number(quote.subtotal || 0),
        Number(quote.tax || 0),
        Number(quote.amount || 0),
        Number(quote.margin || 0),
        quote.createdDate || '',
      ];
    });
    return [header, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  };

  const downloadCsv = (filename: string, items: any[]) => {
    if (items.length === 0) {
      showToast('No quotations available to export.', 'info');
      return;
    }
    const blob = new Blob([buildCsv(items)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast(`Exported ${items.length} quotation(s).`, 'success');
  };

  const handleExportAll = async () => {
    setExporting(true);
    try {
      const queryStatus = activeTab === 'active' ? undefined : activeTab;
      const res = await quotationService.getQuotations({ page: 1, limit: 10000, search: debouncedSearch, status: queryStatus });
      const items = (res.data || []).map((q: any) => {
        const subtotal = Number(q.subtotal) || 0;
        const margin = Number(q.margin) || 0;
        const marginPercent = subtotal > 0 ? ((margin / subtotal) * 100).toFixed(1) : '0.0';
        
        return {
          id: q.quotation_id,
          quotation_id: q.quotation_id,
          quoteNumber: `#QT-${q.quotation_id}`,
          clientName: q.lead?.name ?? "Unknown Client",
          status: q.status,
          currency: q.currency,
          amount: Number(q.total || 0),
          subtotal: subtotal,
          tax: Number(q.tax_total) || 0,
          margin: margin,
          marginPercent: `${marginPercent}%`,
          createdDate: q.created_at,
          eventDate: q.expires_at,
          lines: q.lines || [],
          event: q.event_name || q.eventType || q.event_type || 'Quotation'
        };
      }).filter((quote: any) => {
        const total = Number(quote.amount || 0);
        const min = minTotal ? Number(minTotal) : null;
        const max = maxTotal ? Number(maxTotal) : null;
        if (min !== null && total < min) return false;
        if (max !== null && total > max) return false;
        return true;
      });
      downloadCsv(`${activeTab}_quotations_export.csv`, items);
    } catch (err: any) {
      showToast(`Export failed: ${err.message}`, 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleGenerateProposal = async (quote: any) => {
    setActionMenuId(null);
    if (String(quote.status || '').toUpperCase() !== 'APPROVED') {
      showToast('Approve this quotation before generating a proposal.', 'error');
      return;
    }

    try {
      await proposalService.generateProposal(Number(quote.quotation_id));
      showToast('Proposal generated.', 'success');
      navigate(`/proposals?id=${quote.quotation_id}`);
    } catch (err: any) {
      showToast(`Failed to generate proposal: ${err.message}`, 'error');
    }
  };

  const handleDeleteQuotation = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await quotationService.deleteQuotation(Number(deleteTarget.id));
      showToast('Quotation deleted.', 'success');
      setDeleteTarget(null);
      fetchQuotes();
    } catch (err: any) {
      showToast(`Failed to delete quotation: ${err.message}`, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setMinTotal('');
    setMaxTotal('');
    setFiltersOpen(false);
    showToast('Filters cleared.', 'info');
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Quotations Master List</h1>
                <p className="text-[15px] text-gray-500 mt-1">Comprehensive view of all quotes across the entire lifecycle.</p>
              </div>
              <div className="flex gap-3 relative">
                <button type="button" onClick={handleExportAll} disabled={exporting} className="px-5 py-2.5 bg-gray-900 text-white rounded-full font-bold text-[14px] hover:bg-gray-800 disabled:bg-gray-400 transition-colors shadow-sm flex items-center gap-2">
                  {exporting ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export All
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-[#ECECF1] overflow-hidden flex flex-col h-[700px]">
              <div className="p-6 border-b border-[#ECECF1] space-y-6 shrink-0">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {tabs.map((tab: any) => (
                    <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`px-5 py-2 rounded-full text-[14px] font-bold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-[#F8F9FC] text-gray-600 border border-[#ECECF1] hover:bg-gray-50'}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 max-w-2xl">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={searchVal} onChange={e => setSearchVal(e.target.value)} placeholder="Global search quotes by ID..." className="w-full pl-9 pr-4 py-2.5 bg-[#F8F9FC] border border-[#ECECF1] rounded-xl text-[14px] focus:outline-none focus:border-red-300" />
                      </div>
                      <button type="button" onClick={() => setFiltersOpen(open => !open)} className={`p-2.5 border rounded-xl flex items-center gap-2 font-semibold text-[14px] transition-colors ${filtersOpen || minTotal || maxTotal ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#ECECF1] text-gray-600 hover:bg-gray-50'}`}>
                        <Filter className="w-4 h-4" /> Filters
                      </button>
                    </div>
                  </div>
                  {filtersOpen && (
                    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-[#ECECF1] bg-[#F8F9FC] p-4">
                      <label className="text-[12px] font-bold uppercase tracking-widest text-gray-500">Min Total<input value={minTotal} onChange={e => setMinTotal(e.target.value)} type="number" min="0" className="mt-1 block h-10 w-40 rounded-xl border border-gray-200 bg-white px-3 text-[14px] font-semibold text-gray-900 focus:outline-none focus:border-red-300" /></label>
                      <label className="text-[12px] font-bold uppercase tracking-widest text-gray-500">Max Total<input value={maxTotal} onChange={e => setMaxTotal(e.target.value)} type="number" min="0" className="mt-1 block h-10 w-40 rounded-xl border border-gray-200 bg-white px-3 text-[14px] font-semibold text-gray-900 focus:outline-none focus:border-red-300" /></label>
                      <button type="button" onClick={clearFilters} className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-[13px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"><X className="w-4 h-4" /> Clear</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                {loading ? <div className="flex items-center justify-center py-20"><Loader className="w-10 h-10 text-red-500 animate-spin" /></div>
                : error ? <div className="p-8 text-center text-sm font-medium text-red-500">Failed to load master list: {error}</div>
                : filteredQuotes.length === 0 ? <div className="p-8 text-center text-sm font-medium text-gray-400">No quotations found</div>
                : (
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="sticky top-0 bg-[#F8F9FC] border-b border-[#ECECF1] z-10"><tr>
                      <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Quote ID</th>
                      <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Client & Event</th>
                      <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Executive</th>
                      <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr></thead>
                    <tbody>{filteredQuotes.map((quote: any) => {
                      const quoteId = Number(quote.quotation_id);
                      return (
                        <tr key={quote.quotation_id} className="border-b border-[#ECECF1] hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/quotation-builder?id=${quote.quotation_id}`)}>
                          <td className="py-4 px-6 text-[14px] font-bold text-gray-900">{quote.quoteNumber}</td>
                          <td className="py-4 px-6"><p className="text-[14px] font-bold text-gray-900">{quote.clientName}</p><p className="text-[12px] text-gray-500">{quote.event}</p></td>
                          <td className="py-4 px-6 text-[14px] font-bold text-gray-900">{formatCurrency(quote.amount)}</td>
                          <td className="py-4 px-6 text-[13px] font-semibold text-gray-700">Sales Executive</td>
                          <td className="py-4 px-6 text-[13px] text-gray-500">{formatDate(quote.createdDate)}</td>
                          <td className="py-4 px-6 text-right" onClick={e => e.stopPropagation()}>
                            <div className="relative flex items-center justify-end gap-2">
                              <button type="button" title="Open quotation" className="p-2 text-gray-400 hover:text-red-600 transition-colors" onClick={() => navigate(`/quotation-builder?id=${quote.quotation_id}`)}><ChevronRight className="w-5 h-5" /></button>
                              <button type="button" title="More actions" className="p-2 text-gray-400 hover:text-gray-900 transition-colors" onClick={() => setActionMenuId(actionMenuId === quoteId ? null : quoteId)}><MoreVertical className="w-5 h-5" /></button>
                              {actionMenuId === quoteId && (
                                <div className="absolute right-0 top-10 z-30 w-52 rounded-2xl border border-[#ECECF1] bg-white p-2 text-left shadow-xl">
                                  <button type="button" onClick={() => navigate(`/quotation-builder?id=${quote.quotation_id}`)} className="w-full rounded-xl px-4 py-3 text-[13px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Eye className="w-4 h-4" /> View / Edit</button>
                                  <button type="button" onClick={() => handleGenerateProposal(quote)} disabled={String(quote.status || '').toUpperCase() !== 'APPROVED'} className="w-full rounded-xl px-4 py-3 text-[13px] font-bold text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-white flex items-center gap-2"><FileText className="w-4 h-4" /> {String(quote.status || '').toUpperCase() === 'APPROVED' ? 'Generate Proposal' : 'Approval Required'}</button>
                                  <button type="button" onClick={() => downloadCsv(`${quote.quoteNumber}.csv`, [quote])} className="w-full rounded-xl px-4 py-3 text-[13px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Download className="w-4 h-4" /> Export Quote</button>
                                  <button type="button" onClick={() => { setDeleteTarget(quote); setActionMenuId(null); }} className="w-full rounded-xl px-4 py-3 text-[13px] font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete</button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                )}
              </div>

              <div className="shrink-0"><Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={limit} onPageChange={setCurrentPage} /></div>
            </div>
          </div>
        </main>
      </div>

      <ConfirmationModal open={Boolean(deleteTarget)} title="Delete Quotation?" message={`This will remove ${deleteTarget ? deleteTarget.quoteNumber : 'this quotation'} from active records.`} confirmLabel={deleting ? 'Deleting...' : 'Delete Quotation'} onConfirm={handleDeleteQuotation} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
};

export default QuotationsMasterList;
