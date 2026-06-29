import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { quotationService } from '../services/quotationService';
import { getQuotationClientInfo } from '../utils/quotationDisplay';
import {
  History, Download, Search, Filter, SplitSquareHorizontal,
  FileText, User, CheckCircle2, FileEdit, Send
} from 'lucide-react';

const QuotationHistoryCenter = () => {
  const navigate = useNavigate();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    quotationService.getQuotations({ limit: 100, sortBy: 'updated_at', sortOrder: 'desc' })
      .then((res) => {
        const logs = (res.data || []).flatMap((quote: any) => {
          const client = getQuotationClientInfo(quote).name;
          const quoteNo = `QTN-${String(quote.quotation_id).padStart(5, '0')}`;
          const status = String(quote.status || 'DRAFT').replace(/_/g, ' ');
          const updatedAt = quote.updated_at || quote.created_at;

          return [
            {
              id: `updated-${quote.quotation_id}`,
              action: `${status} quotation updated`,
              quote: quoteNo,
              quoteId: quote.quotation_id,
              user: client,
              time: updatedAt ? new Date(updatedAt).toLocaleString() : 'Unknown time',
              color: quote.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : quote.status === 'PENDING_APPROVAL' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600',
              icon: quote.status === 'APPROVED' ? CheckCircle2 : quote.status === 'PENDING_APPROVAL' ? Send : FileEdit,
            },
            {
              id: `created-${quote.quotation_id}`,
              action: 'Quotation created',
              quote: quoteNo,
              quoteId: quote.quotation_id,
              user: client,
              time: quote.created_at ? new Date(quote.created_at).toLocaleString() : 'Unknown time',
              color: 'bg-gray-100 text-gray-600',
              icon: FileText,
            },
          ];
        });
        setAuditLogs(logs);
      })
      .catch(() => setAuditLogs([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return auditLogs;
    return auditLogs.filter((log) => `${log.action} ${log.quote} ${log.user}`.toLowerCase().includes(term));
  }, [auditLogs, searchQuery]);

  const exportHistory = () => {
    const rows = filteredLogs.map((log) => [log.time, log.quote, log.action, log.user]);
    const csv = [['Time', 'Quote', 'Action', 'User'], ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quotation-history.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">History & Audit Center</h1>
                <p className="text-[15px] text-gray-500 mt-1">Track quotation versions, audit user actions, and compare historical data.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigate('/quotations/history')} className="px-5 py-2.5 bg-white border border-[#ECECF1] text-gray-700 rounded-full font-bold text-[14px] hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
                  <SplitSquareHorizontal className="w-4 h-4" /> Compare Versions
                </button>
                <button onClick={exportHistory} className="px-5 py-2.5 bg-gray-900 text-white rounded-full font-bold text-[14px] hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2">
                  <Download className="w-4 h-4" /> Export History
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-[24px] shadow-sm border border-[#ECECF1] overflow-hidden flex flex-col h-[700px]">
                <div className="p-6 border-b border-[#ECECF1] flex items-center justify-between bg-gray-50">
                  <h3 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-400" /> Global Audit Log
                  </h3>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search logs..." className="pl-9 pr-4 py-2 bg-white border border-[#ECECF1] rounded-full text-[13px] focus:outline-none focus:border-red-300 w-[220px]" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="relative border-l-2 border-[#ECECF1] ml-4 space-y-8 pb-8">
                    {loading ? (
                      <div className="pl-8 py-8 text-[14px] font-semibold text-gray-400">Loading quotation history...</div>
                    ) : filteredLogs.length === 0 ? (
                      <div className="pl-8 py-8 text-[14px] font-semibold text-gray-400">No quotation history found.</div>
                    ) : filteredLogs.map((log: any) => (
                      <div key={log.id} className="relative pl-8">
                        <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${log.color}`}>
                          <log.icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="bg-[#F8F9FC] rounded-[16px] p-4 border border-[#ECECF1]">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-[14px] font-bold text-gray-900">{log.action}</p>
                              <p className="text-[12px] font-medium text-gray-500">Quote: <button onClick={() => navigate(`/quotation-builder?id=${log.quoteId}`)} className="text-red-600 font-bold cursor-pointer hover:underline">{log.quote}</button></p>
                            </div>
                            <span className="text-[12px] text-gray-400 font-semibold">{log.time}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#ECECF1]">
                            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                              <User className="w-3 h-3 text-gray-500" />
                            </div>
                            <span className="text-[12px] font-semibold text-gray-700">{log.user}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[24px] shadow-sm border border-[#ECECF1] p-6 h-max">
                <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold">
                  <Filter className="w-5 h-5" /> Filters
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest block mb-2">User</label>
                    <select className="w-full px-4 py-2.5 bg-[#F8F9FC] border border-[#ECECF1] rounded-xl text-[14px] focus:outline-none focus:border-red-300">
                      <option>All Users</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Action Type</label>
                    <div className="space-y-2">
                      {['Creation', 'Edits', 'Approvals'].map((type: any, idx: any) => (
                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" className="w-4 h-4 rounded text-red-600 border-gray-300 focus:ring-red-500" defaultChecked />
                          <span className="text-[14px] font-semibold text-gray-700 group-hover:text-gray-900">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSearchQuery('')} className="w-full mt-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-[14px] hover:bg-gray-200 transition-colors">
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuotationHistoryCenter;
