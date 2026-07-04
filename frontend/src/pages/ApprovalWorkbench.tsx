import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { approvalService } from '../services/approvalService';
import { quotationService } from '../services/quotationService';
import { getQuotationClientInfo } from '../utils/quotationDisplay';
import { CheckCircle2, XCircle, MessageSquare, Clock, AlertTriangle, ShieldCheck, Activity, Loader, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
};

const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return 'Just now';
  if (hrs < 24) return `${hrs}h ago`;
  return date.toLocaleDateString();
};

const getStatusLabel = (status: string) => {
  if (status === 'APPROVED') return 'Approved';
  if (status === 'REJECTED') return 'Rejected';
  if (status === 'CHANGES_REQUESTED') return 'Changes Requested';
  return 'On Track';
};

const getStatusClass = (status: string) => {
  if (status === 'APPROVED') return 'text-emerald-600 bg-emerald-50';
  if (status === 'REJECTED') return 'text-red-600 bg-red-50';
  if (status === 'CHANGES_REQUESTED') return 'text-orange-600 bg-orange-50';
  return 'text-emerald-600 bg-emerald-50';
};

const getStatusTimeLabel = (approval: any) => {
  if (approval.status === 'APPROVED') return 'Approved';
  if (approval.status === 'REJECTED') return 'Rejected';
  if (approval.status === 'CHANGES_REQUESTED') return 'Changes requested';
  return 'Submitted for review';
};

const ApprovalWorkbench = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('manager');
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | 'changes';
    title: string;
    description: string;
    required: boolean;
    value: string;
    approvalId: number;
  } | null>(null);

  const fetchApprovals = () => {
    setLoading(true);
    Promise.all([
      approvalService.getApprovals(),
      quotationService.getQuotations({ limit: 100 })
    ]).then(([appsRes, quotesRes]) => {
      const quotesMap = new Map((quotesRes.data || []).map((q: any) => [q.quotation_id, q]));
      
      const mapped = (appsRes || []).map((app: any) => {
        const quote: any = quotesMap.get(app.quotation_id) || {};
        return {
          ...app,
          total: quote.total || 0,
          lead_id: quote.lead_id,
          lead: quote.lead,
          event_name: quote.event_name,
          event_type: quote.event_type,
        };
      }).sort((a: any, b: any) => {
        const aDate = new Date(a.decided_at || a.updated_at || a.created_at).getTime();
        const bDate = new Date(b.decided_at || b.updated_at || b.created_at).getTime();
        return bDate - aDate;
      });
      setApprovals(mapped);
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const executeApprove = (id: number, reason: string) => {
    approvalService.approve(id, { reason: reason || undefined })
      .then(() => {
        showToast('Quotation successfully approved!', 'success');
        fetchApprovals();
      })
      .catch(err => showToast(`Failed to approve: ${err.message}`, 'error'));
  };

  const executeReject = (id: number, reason: string) => {
    approvalService.reject(id, { reason })
      .then(() => {
        showToast('Quotation rejected.', 'info');
        fetchApprovals();
      })
      .catch(err => showToast(`Failed to reject: ${err.message}`, 'error'));
  };

  const executeRequestChanges = (id: number, reason: string) => {
    approvalService.requestChanges(id, { reason })
      .then(() => {
        showToast('Changes requested.', 'info');
        fetchApprovals();
      })
      .catch(err => showToast(`Failed to request changes: ${err.message}`, 'error'));
  };

  const handleApprove = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionModal({
      isOpen: true,
      type: 'approve',
      title: 'Approve Quotation',
      description: 'Reviewer approval notes (optional):',
      required: false,
      value: '',
      approvalId: id
    });
  };

  const handleReject = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionModal({
      isOpen: true,
      type: 'reject',
      title: 'Reject Quotation',
      description: 'Please specify the rejection reason (required):',
      required: true,
      value: '',
      approvalId: id
    });
  };

  const handleRequestChanges = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionModal({
      isOpen: true,
      type: 'changes',
      title: 'Request Changes',
      description: 'Please detail the modifications required by the requester (required):',
      required: true,
      value: '',
      approvalId: id
    });
  };

  // Group and count approvals
  const managerPending = approvals.filter(a => a.required_role === 'Sales Manager' && a.status === 'PENDING');
  const directorPending = approvals.filter(a => a.required_role === 'Company Owner' && a.status === 'PENDING');
  const financePending = approvals.filter(a => a.required_role === 'AUTO_APPROVED' && a.status === 'PENDING');
  const escalatedRequests = approvals.filter(a => a.status === 'CHANGES_REQUESTED');
  const approvedHistory = approvals.filter(a => a.status === 'APPROVED');
  const rejectedHistory = approvals.filter(a => a.status === 'REJECTED');

  const tabs = [
    { id: 'manager', label: 'Manager Review', count: managerPending.length, data: managerPending },
    { id: 'director', label: 'Director Review', count: directorPending.length, data: directorPending },
    { id: 'finance', label: 'Finance Review', count: financePending.length, data: financePending },
    { id: 'escalated', label: 'Changes Requested', count: escalatedRequests.length, data: escalatedRequests },
    { id: 'approved', label: 'Past Approved', count: approvedHistory.length, data: approvedHistory },
    { id: 'rejected', label: 'Past Rejected', count: rejectedHistory.length, data: rejectedHistory }
  ];

  const currentTabData = tabs.find(t => t.id === activeTab)?.data || [];

  // Overall SLA health calculations
  const totalRequests = approvals.length;
  const onTimeRequests = approvals.filter(a => a.status !== 'REJECTED').length;
  const healthPercent = totalRequests > 0 ? Math.round((onTimeRequests / totalRequests) * 100) : 100;

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopHeader />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            <div className="mb-8">
              <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Approval Workbench</h1>
              <p className="text-[15px] text-gray-500 mt-1">Review pending quotation approvals and audit previous approval decisions.</p>
            </div>

            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#ECECF1] mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[16px] font-bold text-gray-900 flex items-center gap-2"><Activity className="w-5 h-5 text-gray-400" /> SLA Tracking</h3>
                <span className="text-[13px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Overall Health: {healthPercent}%</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[#F8F9FC] rounded-[16px] border border-[#ECECF1]">
                  <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1">Avg Turnaround</p>
                  <p className="text-[24px] font-black text-gray-900">4.2 Hrs</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-[16px]">
                  <p className="text-[12px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Requests</p>
                  <p className="text-[24px] font-black text-emerald-700">{totalRequests}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-[16px]">
                  <p className="text-[12px] font-bold text-orange-600 uppercase tracking-widest mb-1">Pending Review</p>
                  <p className="text-[24px] font-black text-orange-700">{managerPending.length + directorPending.length + financePending.length}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-[16px]">
                  <p className="text-[12px] font-bold text-red-600 uppercase tracking-widest mb-1">Escalated Requests</p>
                  <p className="text-[24px] font-black text-red-700">{escalatedRequests.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-[#ECECF1] overflow-hidden flex flex-col min-h-[600px]">
              
              <div className="p-6 border-b border-[#ECECF1]">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {tabs.map((tab: any) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-5 py-2.5 rounded-full text-[14px] font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                        activeTab === tab.id 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-[#F8F9FC] text-gray-600 border border-[#ECECF1] hover:bg-gray-50'
                      }`}
                    >
                      {tab.label}
                      <span className={`px-2 py-0.5 rounded-full text-[11px] ${activeTab === tab.id ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 flex-1 bg-[#F8F9FC]">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader className="w-10 h-10 text-red-500 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-100">
                    Failed to load approvals: {error}
                  </div>
                ) : currentTabData.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 font-semibold">
                    No requests found in this queue.
                  </div>
                ) : (
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {currentTabData.map((req: any) => {
                      const clientInfo = getQuotationClientInfo(req);
                      return (
                        <div 
                          key={req.approval_id} 
                          className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ECECF1] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-red-200 transition-all cursor-pointer"
                          onClick={() => navigate('/approvals', { state: { approvalId: req.approval_id } })}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-[16px] font-bold text-gray-900">{clientInfo.name}</h4>
                              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] font-bold uppercase rounded-md">
                                #QTN-{String(req.quotation_id).padStart(5, '0')}
                              </span>
                              <span className={`flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-1 rounded-md ${getStatusClass(req.status)}`}>
                                <Clock className="w-3 h-3" /> {getStatusLabel(req.status)}
                              </span>
                            </div>
                            <p className="text-[13px] text-gray-500 mb-3">
                              {getStatusTimeLabel(req)} - {formatTimeAgo(req.decided_at || req.updated_at || req.created_at)}
                            </p>
                            
                            <div className="flex items-center gap-4">
                              <div className="bg-red-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <span className="text-[13px] font-bold text-red-700">
                                  {req.discount_percent > 0 ? `${req.discount_percent}% Discount` : 'Special Pricing'}
                                </span>
                              </div>
                              <div className="bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span className="text-[13px] font-bold text-emerald-700">{formatCurrency(req.total)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 shrink-0 md:w-[180px]">
                            {req.status === 'PENDING' && (
                              <>
                                <button 
                                  onClick={(e) => handleApprove(req.approval_id, e)}
                                  className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold text-[13px] hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4" /> Approve
                                </button>
                                <button 
                                  onClick={(e) => handleRequestChanges(req.approval_id, e)}
                                  className="w-full py-2 bg-white border border-[#ECECF1] text-orange-600 rounded-xl font-bold text-[13px] hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                                >
                                  <MessageSquare className="w-4 h-4" /> Request Changes
                                </button>
                                <button 
                                  onClick={(e) => handleReject(req.approval_id, e)}
                                  className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-xl font-bold text-[13px] hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                >
                                  <XCircle className="w-4 h-4" /> Reject
                                </button>
                              </>
                            )}
                            {req.status !== 'PENDING' && (
                              <div className="text-center py-2">
                                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">
                                  {req.status}
                                </span>
                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
        </main>
      </div>

      {actionModal && actionModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] w-full max-w-[480px] shadow-2xl overflow-hidden border border-[#ECECF1] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#ECECF1] flex items-center justify-between bg-gray-50/50">
              <h3 className="text-[18px] font-bold text-gray-900">
                {actionModal.title}
              </h3>
              <button 
                onClick={() => setActionModal(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm font-medium text-gray-500">
                {actionModal.description}
              </p>
              
              <div>
                <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Notes / Reason {actionModal.required && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={actionModal.value}
                  onChange={e => setActionModal({ ...actionModal, value: e.target.value })}
                  placeholder={actionModal.type === 'approve' ? 'e.g. Approved. Margins look correct.' : 'e.g. Please revise line items...'}
                  rows={4}
                  className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium text-gray-900 focus:bg-white focus:border-red-400 focus:outline-none transition-all placeholder:text-gray-400 resize-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50/50 border-t border-[#ECECF1] flex justify-end gap-3">
              <button
                onClick={() => setActionModal(null)}
                className="px-5 py-2.5 rounded-xl border border-[#ECECF1] text-[14px] font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (actionModal.required && !actionModal.value.trim()) {
                    showToast('Reason is required for this action.', 'error');
                    return;
                  }
                  if (actionModal.type === 'approve') {
                    executeApprove(actionModal.approvalId, actionModal.value);
                  } else if (actionModal.type === 'reject') {
                    executeReject(actionModal.approvalId, actionModal.value);
                  } else if (actionModal.type === 'changes') {
                    executeRequestChanges(actionModal.approvalId, actionModal.value);
                  }
                  setActionModal(null);
                }}
                className={`px-5 py-2.5 rounded-xl text-[14px] font-bold text-white transition-all shadow-md cursor-pointer ${
                  actionModal.type === 'approve' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 shadow-emerald-100' 
                    : actionModal.type === 'reject'
                    ? 'bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 shadow-red-100'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 shadow-blue-100'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ApprovalWorkbench;

