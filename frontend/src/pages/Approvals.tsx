import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { approvalService } from '../services/approvalService';
import { quotationService } from '../services/quotationService';
import { getQuotationClientInfo } from '../utils/quotationDisplay';
import { 
  LayoutDashboard, FileText, Files, LayoutTemplate, CheckSquare, Users, 
  Settings, HelpCircle, Search, Bell, History as ActivityIcon, Printer,
  CheckCircle, XCircle, Info, MessageSquare, Plus, Clock, Eye, Send, MapPin,
  Loader, AlertTriangle, ShieldCheck, X
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
};

const Approvals = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [approval, setApproval] = useState<any>(null);
  const [quotation, setQuotation] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [changesFeedback, setChangesFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject';
    title: string;
    description: string;
    required: boolean;
    value: string;
  } | null>(null);

  const stateId = location.state?.approvalId;
  const queryId = searchParams.get('id');
  const targetId = stateId || (queryId ? Number(queryId) : null);

  const loadApprovalDetails = (id: number) => {
    setLoading(true);
    setError('');
    Promise.all([
      approvalService.getApproval(id),
      approvalService.getHistory(id)
    ]).then(([appRes, histRes]) => {
      setApproval(appRes);
      setHistory(histRes || []);
      return quotationService.getQuotation(Number(appRes.quotation_id));
    }).then((quoteRes) => {
      setQuotation(quoteRes);
    }).catch((err) => {
      setError(err.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    if (targetId) {
      loadApprovalDetails(targetId);
    } else {
      // Fallback: fetch list and load first pending approval
      approvalService.getApprovals()
        .then(res => {
          const pending = res.filter((a: any) => a.status === 'PENDING');
          const first = pending.length > 0 ? pending[0] : (res.length > 0 ? res[0] : null);
          if (first) {
            loadApprovalDetails(first.approval_id);
          } else {
            setLoading(false);
          }
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [targetId]);

  const executeApprove = (reason: string) => {
    if (!approval) return;
    approvalService.approve(approval.approval_id, { reason: reason || undefined })
      .then(() => {
        showToast('Quotation successfully approved!', 'success');
        loadApprovalDetails(approval.approval_id);
      })
      .catch(err => showToast(`Failed to approve: ${err.message}`, 'error'));
  };

  const executeReject = (reason: string) => {
    if (!approval) return;
    approvalService.reject(approval.approval_id, { reason })
      .then(() => {
        showToast('Quotation rejected.', 'info');
        loadApprovalDetails(approval.approval_id);
      })
      .catch(err => showToast(`Failed to reject: ${err.message}`, 'error'));
  };

  const handleApprove = () => {
    if (!approval) return;
    setActionModal({
      isOpen: true,
      type: 'approve',
      title: 'Approve Quotation',
      description: 'Reviewer approval notes (optional):',
      required: false,
      value: ''
    });
  };

  const handleReject = () => {
    if (!approval) return;
    setActionModal({
      isOpen: true,
      type: 'reject',
      title: 'Reject Quotation',
      description: 'Please specify the rejection reason (required):',
      required: true,
      value: ''
    });
  };

  const handleRequestChanges = () => {
    if (!approval) return;
    if (!changesFeedback.trim()) {
      showToast('Feedback is required to request changes.', 'error');
      return;
    }
    approvalService.requestChanges(approval.approval_id, { reason: changesFeedback })
      .then(() => {
        showToast('Changes requested successfully.', 'success');
        setChangesFeedback('');
        loadApprovalDetails(approval.approval_id);
      })
      .catch(err => showToast(`Failed to request changes: ${err.message}`, 'error'));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approval || !newComment.trim()) return;
    approvalService.addComment(approval.approval_id, { comment: newComment })
      .then(() => {
        showToast('Comment added.', 'success');
        setNewComment('');
        return approvalService.getHistory(approval.approval_id);
      })
      .then(histRes => setHistory(histRes || []))
      .catch(err => showToast(`Failed to add comment: ${err.message}`, 'error'));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
        <Sidebar />
        <div className="flex-1 ml-[260px] flex items-center justify-center">
          <Loader className="w-10 h-10 text-red-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
        <Sidebar />
        <div className="flex-1 ml-[260px] p-8">
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-100">
            Failed to load approval details: {error}
          </div>
        </div>
      </div>
    );
  }

  if (!approval) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
        <Sidebar />
        <div className="flex-1 ml-[260px] p-8 flex flex-col items-center justify-center text-center">
          <CheckCircle className="w-16 h-16 text-gray-355 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Approvals Found</h3>
          <p className="text-gray-500 max-w-sm">All quotation approval requests are cleared or none are active.</p>
        </div>
      </div>
    );
  }

  const clientInfo = getQuotationClientInfo(quotation);
  const discountPercent = approval.discount_percent || 0;
  
  // Step indicator state
  const isManagerDone = approval.status !== 'PENDING' || approval.required_role === 'Company Owner';
  const isManagerActive = approval.status === 'PENDING' && approval.required_role === 'Sales Manager';
  const isDirectorDone = approval.status === 'APPROVED';
  const isDirectorActive = approval.status === 'PENDING' && approval.required_role === 'Company Owner';

  // Comment filter (actions with COMMENT_ADDED)
  const commentItems = history.filter(h => h.action === 'COMMENT_ADDED');

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopHeader />

        {/* SCROLLABLE MAIN */}
        <main className="flex-1 overflow-y-auto p-8 pb-24">
          <div className="max-w-[1200px] mx-auto space-y-6">
            
            {/* WORKFLOW PROGRESS TRACKER */}
            <div className="bg-white rounded-[28px] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ECECF1]">
              <div className="flex items-center justify-between relative">
                {/* Connecting Line Base */}
                <div className="absolute left-[10%] right-[10%] top-[24px] h-[3px] bg-gray-100 -z-10 rounded-full"></div>
                {/* Active Connecting Line */}
                <div className="absolute left-[10%] right-[10%] top-[24px] h-[3px] bg-gradient-to-r from-emerald-400 to-red-400 -z-10 rounded-full" style={{ width: approval.status === 'APPROVED' ? '80%' : isManagerDone ? '50%' : '20%' }}></div>

                {/* Step 1: Draft */}
                <div className="flex flex-col items-center gap-3 w-1/4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm ring-4 ring-white">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] font-bold text-gray-900">Draft</p>
                    <p className="text-[12px] font-medium text-gray-500">{formatDate(quotation?.created_at)}</p>
                  </div>
                </div>

                {/* Step 2: Manager Review */}
                <div className="flex flex-col items-center gap-3 w-1/4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ring-4 ring-white ${isManagerDone ? 'bg-emerald-500 text-white' : isManagerActive ? 'bg-red-50 text-red-600 border-2 border-red-200' : 'bg-gray-100 text-gray-400'}`}>
                    {isManagerDone ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div className="text-center">
                    <p className={`text-[14px] font-bold ${isManagerActive ? 'text-red-700' : 'text-gray-900'}`}>Manager Review</p>
                    <p className="text-[12px] font-medium text-gray-500">{isManagerDone ? 'Completed' : isManagerActive ? 'In Progress' : 'Awaiting'}</p>
                  </div>
                </div>

                {/* Step 3: Director Review */}
                <div className="flex flex-col items-center gap-3 w-1/4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ring-4 ring-white ${isDirectorDone ? 'bg-emerald-500 text-white' : isDirectorActive ? 'bg-red-50 text-red-600 border-2 border-red-200' : 'bg-gray-100 text-gray-400'}`}>
                    {isDirectorDone ? <CheckCircle className="w-6 h-6" /> : isDirectorActive ? <Clock className="w-6 h-6" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="text-center">
                    <p className={`text-[14px] font-bold ${isDirectorActive ? 'text-red-700' : 'text-gray-900'}`}>Director Review</p>
                    <p className="text-[12px] font-medium text-gray-500">{isDirectorDone ? 'Completed' : isDirectorActive ? 'In Progress' : 'Awaiting'}</p>
                  </div>
                </div>

                {/* Step 4: Decision */}
                <div className="flex flex-col items-center gap-3 w-1/4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ring-4 ring-white ${approval.status === 'APPROVED' ? 'bg-emerald-500 text-white' : approval.status === 'REJECTED' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] font-semibold text-gray-400">Approved</p>
                    <p className="text-[12px] font-medium text-gray-400">{approval.status}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* TWO COLUMNS LAYOUT */}
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* LEFT COLUMN (70%) */}
              <div className="flex-1 lg:w-[70%] space-y-6">
                
                {/* APPROVAL DETAILS CARD */}
                <div className="bg-white rounded-[28px] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ECECF1]">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <p className="text-[14px] font-bold text-gray-900 mb-1">Quote #QTN-{String(approval.quotation_id).padStart(5, '0')}</p>
                      <h3 className="text-[20px] font-medium text-gray-600">{clientInfo.event}</h3>
                    </div>
                    <span className={`px-4 py-1.5 text-[13px] font-bold rounded-full ${discountPercent > 15 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                      Discount: {discountPercent}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-8">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Requester</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">
                          SE
                        </div>
                        <span className="text-[15px] font-semibold text-gray-900">Sales Executive</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Value</p>
                      <p className="text-[18px] font-bold text-red-700">{formatCurrency(Number(quotation?.total || 0))}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Date Created</p>
                      <p className="text-[15px] font-semibold text-gray-900">{formatDate(quotation?.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Target Margin</p>
                      <p className="text-[15px] font-semibold text-gray-900">{approval.margin_percent}% Margin</p>
                    </div>
                  </div>

                  {/* EXECUTIVE SUMMARY PANEL */}
                  <div className="bg-[#F8F5FF] rounded-[20px] p-6 flex gap-4 border border-[#F3E8FF]">
                    <div className="mt-0.5 shrink-0">
                      <Info className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-gray-900 mb-2">Quotation Submitter Notes</h4>
                      <p className="text-[14px] font-medium text-gray-700 leading-relaxed">
                        {approval.notes || 'No notes provided by requester.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* REVIEWER DISCUSSION CARD */}
                <div className="bg-white rounded-[28px] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ECECF1]">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[18px] font-bold text-gray-900">Reviewer Discussion</h3>
                  </div>

                  <div className="space-y-6 mb-6">
                    {commentItems.length === 0 ? (
                      <p className="text-sm font-medium text-gray-400 text-center py-4">No comments added yet.</p>
                    ) : (
                      commentItems.map((comment: any) => (
                        <div key={comment.history_id} className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-red-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            U
                          </div>
                          <div className="bg-[#F3F5FC] rounded-[20px] rounded-tl-sm p-5 flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[14px] font-bold text-gray-900">{comment.performed_by || 'Reviewer'}</p>
                              <span className="text-[12px] font-medium text-gray-400">{new Date(comment.created_at).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-[14px] font-medium text-gray-700 leading-relaxed">
                              {comment.notes}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddComment} className="flex gap-3">
                    <input 
                      type="text" 
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Add public comment to discussion thread..."
                      className="flex-1 bg-[#F8F9FC] border border-[#ECECF1] rounded-[14px] px-4 text-sm font-medium text-gray-900 focus:outline-none focus:border-red-300"
                    />
                    <button type="submit" className="px-5 bg-gray-900 text-white rounded-[14px] font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2">
                      <Send className="w-4 h-4" /> Send
                    </button>
                  </form>
                </div>

                {/* WORKFLOW HISTORY CARD */}
                <div className="bg-white rounded-[28px] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ECECF1]">
                  <h3 className="text-[18px] font-bold text-gray-900 flex items-center gap-2 mb-8">
                    <ActivityIcon className="w-5 h-5 text-gray-400" />
                    Workflow Timeline
                  </h3>

                  <div className="relative pl-6 border-l-2 border-gray-100 space-y-8">
                    {history.map((item: any) => (
                      <div key={item.history_id} className="relative">
                        <div className="absolute -left-[33px] w-6 h-6 rounded-full bg-red-50 border-2 border-white flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        </div>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[14px] font-bold text-gray-900">{item.action}</p>
                            <p className="text-[13px] font-medium text-gray-500">{item.notes}</p>
                          </div>
                          <span className="text-[13px] font-medium text-gray-400">{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN (30%) */}
              <div className="lg:w-[30%]">
                <div className="sticky top-[24px] space-y-6">
                  
                  {/* TAKE ACTION CARD */}
                  <div className="bg-white rounded-[28px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#ECECF1]">
                    <h3 className="text-[16px] font-bold text-gray-900 mb-6">Take Action</h3>
                    
                    {approval.status === 'PENDING' ? (
                      <>
                        <div className="space-y-3 mb-8">
                          <button 
                            onClick={handleApprove}
                            className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-400 text-white rounded-[14px] font-bold text-[15px] shadow-sm hover:shadow-md transition-all"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Approve Request
                          </button>
                          <button 
                            onClick={handleReject}
                            className="w-full h-12 flex items-center justify-center gap-2 bg-[#F3F5F9] text-gray-600 rounded-[14px] font-bold text-[15px] hover:bg-gray-200 transition-colors"
                          >
                            <XCircle className="w-5 h-5" />
                            Reject
                          </button>
                        </div>

                        <div className="border-t border-[#ECECF1] pt-6">
                          <h4 className="text-[14px] font-semibold text-gray-700 mb-3">Request Changes</h4>
                          <textarea 
                            value={changesFeedback}
                            onChange={e => setChangesFeedback(e.target.value)}
                            className="w-full h-[120px] bg-[#F8F9FC] border border-[#E5E7EB] rounded-[16px] p-4 text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all resize-none mb-4"
                            placeholder="Add feedback for the requester..."
                          ></textarea>
                          <button 
                            onClick={handleRequestChanges}
                            className="w-full h-11 flex items-center justify-center gap-2 border border-red-200 text-red-600 rounded-[12px] font-bold text-[14px] hover:bg-red-50 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            Send Back to Draft
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded-[16px] border border-[#ECECF1]">
                        <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-900 uppercase">Approval {approval.status}</p>
                        <p className="text-[12px] text-gray-500 mt-1">Processed successfully.</p>
                      </div>
                    )}

                    {/* APPROVAL METRICS */}
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[13px] font-semibold text-gray-500">Estimated SLA</span>
                        <span className="text-[14px] font-bold text-gray-900">4 Hours</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-550 w-[85%] rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* VENUE PREVIEW CARD */}
                  <div className="relative h-[180px] rounded-[24px] overflow-hidden group cursor-pointer shadow-sm">
                    <img 
                      src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                      alt="Venue Preview" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5">
                      <p className="text-white text-[14px] font-bold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-300" />
                        Venue: Ritz-Carlton Grand Hall
                      </p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Custom Action Modal Overlay */}
      {actionModal && actionModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] w-full max-w-[480px] shadow-2xl overflow-hidden border border-[#ECECF1] animate-in zoom-in-95 duration-200">
            {/* Header */}
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

            {/* Body */}
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
                  placeholder={actionModal.type === 'approve' ? 'e.g. Approved. Margins look correct.' : 'e.g. Please specify rejection reasons...'}
                  rows={4}
                  className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium text-gray-900 focus:bg-white focus:border-red-400 focus:outline-none transition-all placeholder:text-gray-400 resize-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Footer */}
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
                    executeApprove(actionModal.value);
                  } else if (actionModal.type === 'reject') {
                    executeReject(actionModal.value);
                  }
                  setActionModal(null);
                }}
                className={`px-5 py-2.5 rounded-xl text-[14px] font-bold text-white transition-all shadow-md cursor-pointer ${
                  actionModal.type === 'approve' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 shadow-emerald-100' 
                    : 'bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 shadow-red-100'
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

export default Approvals;
