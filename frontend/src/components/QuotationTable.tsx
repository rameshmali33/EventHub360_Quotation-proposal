import React, { useState, useEffect } from 'react';
import QuotationRow from './QuotationRow';
import Pagination from './Pagination';
import ConfirmationModal from './ConfirmationModal';
import { quotationService } from '../services/quotationService';
import { Loader, Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const QuotationTable = () => {
  const { showToast } = useToast();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(5);

  const [searchVal, setSearchVal] = useState('');
  const [statusVal, setStatusVal] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);
  const [quotationPendingDelete, setQuotationPendingDelete] = useState<any | null>(null);
  const [deletingQuotation, setDeletingQuotation] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchVal);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchVal]);

  // Reset page when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusVal, sortBy, sortOrder]);

  const fetchQuotations = () => {
    setLoading(true);
    quotationService.getQuotations({ 
      page: currentPage, 
      limit,
      search: debouncedSearch,
      status: statusVal || undefined,
      sortBy,
      sortOrder
    })
      .then(res => {
        console.log("Loaded quotations from backend", res);
        setQuotations(res.data || []);
        setTotalItems(res.total || 0);
        if (res.limit) setLimit(res.limit);
        setTotalPages(Math.max(1, Math.ceil((res.total || 0) / (res.limit || limit))));
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuotations();
  }, [currentPage, debouncedSearch, statusVal, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1.5 text-gray-400 inline" />;
    }
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-3.5 h-3.5 ml-1.5 text-red-600 inline" /> 
      : <ChevronDown className="w-3.5 h-3.5 ml-1.5 text-red-600 inline" />;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'CL';
  };

  const handleDeleteQuotation = async () => {
    if (!quotationPendingDelete) return;

    setDeletingQuotation(true);
    try {
      await quotationService.deleteQuotation(Number(quotationPendingDelete.id));
      showToast('Quotation deleted successfully.', 'success');
      setQuotationPendingDelete(null);
      fetchQuotations();
    } catch (err: any) {
      showToast(`Failed to delete quotation: ${err.message}`, 'error');
    } finally {
      setDeletingQuotation(false);
    }
  };

  const mappedData = quotations.map((q: any) => {
    const subtotal = Number(q.subtotal) || 0;
    const margin = Number(q.margin) || 0;
    const marginPercent = subtotal > 0 ? ((margin / subtotal) * 100).toFixed(1) : '0.0';
    
    const clientName = q.lead?.name ?? "Unknown Client";
    const eventName = q.event_name || q.eventType || q.event_type || 'Quotation';
    
    return {
      id: q.quotation_id,
      quotation_id: q.quotation_id,
      quoteNumber: `#QT-${q.quotation_id}`,
      clientName: clientName,
      initials: getInitials(clientName),
      avatarBg: 'bg-red-50',
      avatarText: 'text-red-700',
      event: eventName,
      date: formatDate(q.expires_at || q.created_at),
      amount: formatCurrency(Number(q.total || 0)),
      margin: `${marginPercent}%`,
      marginColor: Number(marginPercent) >= 20 ? 'text-green-600' : 'text-gray-900',
      status: q.status,
      createdDate: q.created_at,
      eventDate: q.expires_at,
      currency: q.currency,
      lines: q.lines
    };
  });

  return (
    <div className="bg-[#F7F8FC] rounded-[28px] border border-[#ECECF1] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col min-h-[400px]">
      
      {/* Filter Toolbar */}
      <div id="quotation-filters" className="p-6 border-b border-[#ECECF1] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="quotation-search"
              type="text" 
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search by quote number or client..." 
              className="w-full pl-9 pr-4 py-2.5 bg-[#F8F9FC] border border-[#ECECF1] rounded-xl text-[14px] font-medium text-gray-900 focus:outline-none focus:border-red-300" 
            />
          </div>
          <select
            value={statusVal}
            onChange={e => setStatusVal(e.target.value)}
            className="px-4 py-2.5 bg-[#F8F9FC] border border-[#ECECF1] rounded-xl text-[14px] font-bold text-gray-700 focus:outline-none focus:border-red-300"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-10 h-10 text-red-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm font-medium text-red-500">
            Failed to load quotations: {error}
          </div>
        ) : mappedData.length === 0 ? (
          <div className="p-8 text-center text-sm font-medium text-gray-400">
            No quotations found
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#F1F3FA] h-[80px]">
                <th 
                  onClick={() => handleSort('quotation_id')}
                  className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  Quote Number {renderSortIcon('quotation_id')}
                </th>
                <th className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap">Client Name</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap">Event Type</th>
                <th 
                  onClick={() => handleSort('created_at')}
                  className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  Event Date {renderSortIcon('created_at')}
                </th>
                <th 
                  onClick={() => handleSort('total')}
                  className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  Total Amount {renderSortIcon('total')}
                </th>
                <th className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap">Margin (%)</th>
                <th 
                  onClick={() => handleSort('status')}
                  className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  Status {renderSortIcon('status')}
                </th>
                <th className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap">Owner</th>
                <th className="px-6 py-4 text-right text-[12px] font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {mappedData.map((quote: any, idx: any) => (
                <QuotationRow
                  key={quote.id}
                  quotation={quote}
                  openMenuId={openActionMenuId}
                  setOpenMenuId={setOpenActionMenuId}
                  onDelete={setQuotationPendingDelete}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={limit}
        onPageChange={setCurrentPage}
      />
      <ConfirmationModal
        open={Boolean(quotationPendingDelete)}
        title="Delete Quotation?"
        message={`This will remove ${quotationPendingDelete?.quoteNumber || 'this quotation'} from active quotations. This action cannot be undone.`}
        confirmLabel={deletingQuotation ? 'Deleting...' : 'Delete Quotation'}
        onCancel={() => setQuotationPendingDelete(null)}
        onConfirm={handleDeleteQuotation}
      />
    </div>
  );
};

export default QuotationTable;
