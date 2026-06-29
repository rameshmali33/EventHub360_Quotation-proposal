import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Download, Loader } from 'lucide-react';
import { qtnDashboardService } from '../services/qtnDashboardService';

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-orange-100 text-orange-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
];

const getAvatarColor = (name: string) => {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

const getStatusStyle = (status: string) => {
  switch (status.toUpperCase()) {
    case 'ACCEPTED': return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
    case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
    case 'SENT': return 'bg-amber-50 text-amber-600 border border-amber-200';
    case 'DRAFT': return 'bg-purple-50 text-purple-600 border border-purple-200';
    case 'PENDING_APPROVAL': return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
    default: return 'bg-gray-50 text-gray-600 border border-gray-200';
  }
};

const formatStatusName = (status: string) => {
  if (status === 'PENDING_APPROVAL') return 'Pending Approval';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const RecentQuotationTable = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    qtnDashboardService.getRecentQuotations()
      .then(res => setQuotations(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-white rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ECECF1] overflow-hidden flex flex-col h-full">
      <div className="p-6 flex items-center justify-between border-b border-[#ECECF1] shrink-0">
        <h3 className="text-lg font-bold text-gray-900">Recent Quotations</h3>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        {loading ? (
          <div className="h-full min-h-[200px] flex items-center justify-center">
            <Loader className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm font-medium text-red-500">Failed to load: {error}</div>
        ) : quotations.length === 0 ? (
          <div className="p-6 text-center text-sm font-medium text-gray-400">No quotations available.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Quote ID</th>
                <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotations.map((quote: any, idx: any) => (
                <tr 
                  key={idx} 
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/quotation-builder?id=${quote.quotationId}`)}
                >
                  <td className="py-4 px-6 text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                    {quote.quoteRef}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${getAvatarColor(quote.clientName)}`}>
                        {(quote.clientName || 'C').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{quote.clientName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">
                    {formatCurrency(quote.total)}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold ${getStatusStyle(quote.status)}`}>
                      {formatStatusName(quote.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RecentQuotationTable;
