import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import Pagination from '../components/Pagination';
import { quotationService } from '../services/quotationService';
import { qtnDashboardService } from '../services/qtnDashboardService';
import { getQuotationClientInfo } from '../utils/quotationDisplay';
import { 
  Loader, CheckCircle2, TrendingUp, Search, Filter, Printer, 
  Download, FileText, MoreVertical, Eye
} from 'lucide-react';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const ApprovedQuotationsDashboard = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [allApproved, setAllApproved] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchVal, setSearchVal] = useState('');
  const limit = 5;

  useEffect(() => {
    Promise.all([
      quotationService.getQuotations({ status: 'APPROVED', limit: 100 }),
      qtnDashboardService.getStats()
    ]).then(([approvedRes, statsRes]) => {
      setAllApproved(approvedRes.data || []);
      setStats(statsRes);
    }).catch(err => console.error('Failed to load summary stats:', err));
  }, [quotes]);

  useEffect(() => {
    setLoading(true);
    quotationService.getQuotations({
      status: 'APPROVED',
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

  const totalApprovedVal = allApproved.reduce((sum, q) => sum + Number(q.total || 0), 0);
  const revenueForecast = stats ? stats.totalRevenue : 0;

  const metrics = [
    { title: 'Total Approved Value', value: formatCurrency(totalApprovedVal), trend: '+12.5%', isPositive: true },
    { title: 'Approved Count', value: String(totalItems), trend: '+5.2%', isPositive: true },
    { title: 'Approval Trend', value: '4.8 Days', trend: '-0.5 Days', isPositive: true },
    { title: 'Revenue Generated', value: formatCurrency(revenueForecast), trend: '+15.4%', isPositive: true }
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopHeader />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            <div className="mb-8">
              <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Approved Quotations</h1>
              <p className="text-[15px] text-gray-500 mt-1">Review successfully approved quotations ready for proposal generation.</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metrics.map((metric: any, idx: any) => (
                <div key={idx} className="bg-white rounded-[24px] p-6 shadow-sm border border-[#ECECF1]">
                  <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-2">{metric.title}</p>
                  <div className="flex items-end gap-3">
                    <h3 className="text-[32px] font-black text-gray-900 leading-none">{metric.value}</h3>
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp className={`w-4 h-4 ${metric.isPositive ? 'text-emerald-500' : 'text-red-500'}`} />
                      <span className={`text-[13px] font-bold ${metric.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>{metric.trend}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Approved Table */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#ECECF1] min-h-[350px] flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-[18px] font-bold text-gray-900">Approved History</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        value={searchVal}
                        onChange={e => { setSearchVal(e.target.value); setCurrentPage(1); }}
                        placeholder="Search approved quotes..." 
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
                      Failed to load approved quotations: {error}
                    </div>
                  ) : quotes.length === 0 ? (
                    <div className="p-8 text-center text-sm font-medium text-gray-400">
                      No approved quotations found.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#ECECF1]">
                          <th className="pb-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider font-sans">Quote Number</th>
                          <th className="pb-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider font-sans">Client</th>
                          <th className="pb-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider font-sans">Event</th>
                          <th className="pb-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider font-sans">Approval Date</th>
                          <th className="pb-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider font-sans">Value</th>
                          <th className="pb-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider font-sans">Status</th>
                          <th className="pb-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider font-sans text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotes.map((quote: any) => {
                          const clientInfo = getQuotationClientInfo(quote);
                          return (
                            <tr key={quote.quotation_id} className="border-b border-[#ECECF1] last:border-0 hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-4 text-[14px] font-bold text-gray-900">
                                #QTN-{String(quote.quotation_id).padStart(5, '0')}
                              </td>
                              <td className="py-4 px-4 text-[14px] font-bold text-gray-900">{clientInfo.name}</td>
                              <td className="py-4 px-4 text-[14px] text-gray-500 font-medium">{clientInfo.event}</td>
                              <td className="py-4 px-4 text-[14px] text-gray-500 font-medium">{formatDate(quote.updated_at)}</td>
                              <td className="py-4 px-4 text-[14px] font-black text-gray-900">{formatCurrency(Number(quote.total || 0))}</td>
                              <td className="py-4 px-4">
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider rounded-full flex items-center w-max gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> {quote.status}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="View" onClick={() => navigate(`/quotation-builder?id=${quote.quotation_id}`)}>
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors" title="Print" onClick={e => e.stopPropagation()}>
                                    <Printer className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => navigate(`/quotation-builder?id=${quote.quotation_id}&generate=true`)}
                                    className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-[12px] font-bold hover:bg-red-100 transition-colors ml-2"
                                  >
                                    Generate Proposal
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

export default ApprovedQuotationsDashboard;
