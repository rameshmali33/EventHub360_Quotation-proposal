import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import Pagination from '../components/Pagination';
import { quotationService } from '../services/quotationService';
import { getQuotationClientInfo } from '../utils/quotationDisplay';
import { 
  Loader, Search, Filter, ArrowUpDown, MoreVertical, 
  CheckCircle2, ChevronRight
} from 'lucide-react';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const formatActivityTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return 'Just now';
  if (hrs < 24) return `${hrs}h ago`;
  return date.toLocaleDateString();
};

const PendingQuotationsCenter = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [allPending, setAllPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchVal, setSearchVal] = useState('');
  const limit = 5;

  const followUps: any[] = [];

  // Fetch all pending quotes to calculate aging report accurately
  useEffect(() => {
    quotationService.getQuotations({ status: 'PENDING_APPROVAL', limit: 100 })
      .then(res => setAllPending(res.data || []))
      .catch(err => console.error('Failed to load aging data:', err));
  }, []);

  useEffect(() => {
    setLoading(true);
    quotationService.getQuotations({ 
      status: 'PENDING_APPROVAL', 
      page: currentPage, 
      limit,
      search: searchVal
    })
      .then(res => {
        setQuotes(res.data || []);
        setTotalItems(res.total || 0);
        setTotalPages(Math.ceil((res.total || 0) / limit));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [currentPage, searchVal]);

  const calculateAging = (items: any[]) => {
    const aging = [
      { label: '0–7 Days', count: 0, value: 0, risk: 'Low', color: 'bg-emerald-100 text-emerald-700' },
      { label: '8–15 Days', count: 0, value: 0, risk: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
      { label: '16–30 Days', count: 0, value: 0, risk: 'High', color: 'bg-orange-100 text-orange-700' },
      { label: '30+ Days', count: 0, value: 0, risk: 'Critical', color: 'bg-red-100 text-red-700' }
    ];

    items.forEach(q => {
      const ageDays = (Date.now() - new Date(q.created_at).getTime()) / (1000 * 3600 * 24);
      const val = Number(q.total || 0);
      if (ageDays <= 7) {
        aging[0].count++;
        aging[0].value += val;
      } else if (ageDays <= 15) {
        aging[1].count++;
        aging[1].value += val;
      } else if (ageDays <= 30) {
        aging[2].count++;
        aging[2].value += val;
      } else {
        aging[3].count++;
        aging[3].value += val;
      }
    });

    return aging.map(item => ({
      ...item,
      value: formatCurrency(item.value)
    }));
  };

  const agingData = calculateAging(allPending);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopHeader />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Pending Quotations Center</h1>
                <p className="text-[15px] text-gray-500 mt-1">Manage, track, and follow up on all active quotations.</p>
              </div>
              <button 
                onClick={() => navigate('/quotations/new')}
                className="px-6 py-2.5 bg-gradient-to-r from-red-700 to-orange-400 text-white rounded-full font-bold text-[14px] shadow-sm hover:shadow-md transition-all"
              >
                Create New Quote
              </button>
            </div>

            {/* Quote Aging Report & Follow-Up Queue */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Aging Report */}
              <div className="xl:col-span-2 bg-white rounded-[24px] p-6 shadow-sm border border-[#ECECF1]">
                <h3 className="text-[16px] font-bold text-gray-900 mb-6">Quote Aging Report</h3>
                <div className="grid grid-cols-4 gap-4">
                  {agingData.map((item: any, idx: any) => (
                    <div key={idx} className="p-4 rounded-[16px] bg-[#F8F9FC] border border-[#ECECF1]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[13px] font-bold text-gray-500">{item.label}</span>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${item.color}`}>{item.risk}</span>
                      </div>
                      <p className="text-[24px] font-black text-gray-900 mb-1">{item.count} <span className="text-[14px] font-medium text-gray-400">quotes</span></p>
                      <p className="text-[14px] font-bold text-red-700">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-Up Queue */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#ECECF1] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[16px] font-bold text-gray-900">Follow-Up Queue</h3>
                  <button className="text-[13px] font-bold text-red-600 hover:text-red-700">View All</button>
                </div>
                <div className="space-y-4 flex-1">
                  {followUps.length === 0 ? (
                    <div className="h-full min-h-[150px] flex items-center justify-center text-center text-[13px] font-semibold text-gray-400">
                      No scheduled follow-ups found.
                    </div>
                  ) : followUps.map((task: any) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-[12px] hover:bg-gray-50 border border-transparent hover:border-[#ECECF1] transition-colors cursor-pointer">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${task.status === 'overdue' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        <task.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-gray-900 truncate">{task.client}</p>
                        <p className={`text-[12px] font-medium ${task.status === 'overdue' ? 'text-red-600' : 'text-gray-500'}`}>{task.time}</p>
                      </div>
                      <button className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-400 transition-colors">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Active Quotations Table */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#ECECF1] min-h-[350px] flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-[16px] font-bold text-gray-900">Active Quotations</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        value={searchVal}
                        onChange={e => { setSearchVal(e.target.value); setCurrentPage(1); }}
                        placeholder="Search quotes by ID..." 
                        className="pl-9 pr-4 py-2 bg-[#F8F9FC] border border-[#ECECF1] rounded-full text-[13px] focus:outline-none focus:border-red-300 w-[250px]" 
                      />
                    </div>
                    <button className="p-2 border border-[#ECECF1] rounded-full text-gray-600 hover:bg-gray-50">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader className="w-10 h-10 text-red-500 animate-spin" />
                    </div>
                  ) : error ? (
                    <div className="p-8 text-center text-sm font-medium text-red-500">
                      Failed to load active quotations: {error}
                    </div>
                  ) : quotes.length === 0 ? (
                    <div className="p-8 text-center text-sm font-medium text-gray-400">
                      No pending approval quotations found.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#ECECF1]">
                          <th className="pb-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider font-sans">Quote ID</th>
                          <th className="pb-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider font-sans">Client & Event</th>
                          <th className="pb-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider font-sans">Value</th>
                          <th className="pb-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider font-sans">Stage</th>
                          <th className="pb-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider font-sans">Executive</th>
                          <th className="pb-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider font-sans">Last Activity</th>
                          <th className="pb-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider font-sans text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotes.map((quote: any) => {
                          const clientInfo = getQuotationClientInfo(quote);
                          return (
                            <tr 
                              key={quote.quotation_id} 
                              className="border-b border-[#ECECF1] last:border-0 hover:bg-gray-50 transition-colors group cursor-pointer" 
                              onClick={() => navigate(`/quotation-builder?id=${quote.quotation_id}`)}
                            >
                              <td className="py-4 px-4 text-[14px] font-bold text-gray-900">
                                #QTN-{String(quote.quotation_id).padStart(5, '0')}
                              </td>
                              <td className="py-4 px-4">
                                <p className="text-[14px] font-bold text-gray-900">{clientInfo.name}</p>
                                <p className="text-[12px] text-gray-500">{clientInfo.event}</p>
                              </td>
                              <td className="py-4 px-4 text-[14px] font-bold text-gray-900">
                                {formatCurrency(Number(quote.total || 0))}
                              </td>
                              <td className="py-4 px-4">
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider rounded-full">{quote.status}</span>
                              </td>
                              <td className="py-4 px-4 text-[13px] font-semibold text-gray-700">Sales Executive</td>
                              <td className="py-4 px-4 text-[13px] text-gray-500">{formatActivityTime(quote.updated_at)}</td>
                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" onClick={(e) => { e.stopPropagation(); navigate(`/quotation-builder?id=${quote.quotation_id}`); }}>
                                    <ChevronRight className="w-5 h-5" />
                                  </button>
                                  <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors" onClick={(e) => e.stopPropagation()}>
                                    <MoreVertical className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="shrink-0 mt-4">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={limit}
                  onPageChange={setCurrentPage}
                />
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default PendingQuotationsCenter;
