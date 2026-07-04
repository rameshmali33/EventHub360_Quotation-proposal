import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { qtnDashboardService } from '../services/qtnDashboardService';

const getInitials = (name: string) => (
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || 'U'
);

const getStatusColor = (tier: string) => {
  if (tier === 'Company Owner') return 'bg-red-100 text-red-700';
  if (tier === 'Sales Manager') return 'bg-yellow-100 text-yellow-700';
  return 'bg-blue-100 text-blue-700';
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return 'Just now';
  if (hrs < 24) return `${hrs}h ago`;
  return date.toLocaleDateString();
};

const PendingApprovalList = () => {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    qtnDashboardService.getPendingApprovals()
      .then(res => setApprovals(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ECECF1] h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h3 className="text-lg font-bold text-gray-900">Pending Approvals</h3>
        <button 
          onClick={() => navigate('/quotations/approval-workbench')}
          className="text-sm font-semibold text-red-600 hover:text-red-700"
        >
          View All
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-sm font-medium text-red-500 text-center">Failed to load: {error}</p>
        ) : approvals.length === 0 ? (
          <p className="text-sm font-medium text-gray-400 text-center">No pending approvals.</p>
        ) : (
          approvals.map((approval: any) => (
            <div key={approval.approvalId} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-700 border border-red-100 flex items-center justify-center text-[12px] font-black shrink-0">
                  {getInitials(approval.requestedBy)}
                </div>
                <div>
                  <h4 
                    onClick={() => navigate(`/approvals?id=${approval.approvalId}`)}
                    className="text-[15px] font-bold text-gray-900 group-hover:text-red-600 transition-colors cursor-pointer"
                  >
                    {approval.quoteRef} - {approval.clientName}
                  </h4>
                  <p className="text-[13px] text-gray-500 mt-0.5">
                    Created by {approval.requestedBy} <span className="mx-1">•</span> {formatTime(approval.requestedAt)}
                  </p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-[15px] font-bold text-red-600">
                  {formatCurrency(approval.total)}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getStatusColor(approval.requiredTier)}`}>
                  {approval.requiredTier}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PendingApprovalList;
