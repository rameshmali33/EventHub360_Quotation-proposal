import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../components/ConfirmationModal';
import { quotationService } from '../services/quotationService';
import { getQuotationClientInfo } from '../utils/quotationDisplay';
import { 
  Loader, History, Play, Filter, MoreHorizontal, ChevronLeft, ChevronRight,
  Edit2, Copy, Edit3, Archive, Trash2, Download, Share2
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const formatTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const DraftManagementCenter = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeDropdown, setActiveDropdown] = useState<any>(null);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [recentDraft, setRecentDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [draftPendingDelete, setDraftPendingDelete] = useState<any | null>(null);
  const limit = 5;

  useEffect(() => {
    setLoading(true);
    quotationService.getQuotations({ status: 'DRAFT', page: currentPage, limit })
      .then(res => {
        setDrafts(res.data || []);
        setTotalItems(res.total || 0);
        setTotalPages(Math.ceil((res.total || 0) / limit));
        if (res.data && res.data.length > 0 && currentPage === 1) {
          setRecentDraft(res.data[0]);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [currentPage]);

  const toggleDropdown = (id: any, e: any) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const confirmDeleteDraft = () => {
    if (!draftPendingDelete) return;

    quotationService.deleteQuotation(draftPendingDelete.quotation_id)
      .then(() => {
        showToast('Draft successfully deleted!', 'success');
        setDrafts(prev => prev.filter(draft => draft.quotation_id !== draftPendingDelete.quotation_id));
        setCurrentPage(prev => (drafts.length === 1 && prev > 1 ? prev - 1 : prev));
        if (recentDraft?.quotation_id === draftPendingDelete.quotation_id) {
          setRecentDraft(null);
        }
        setDraftPendingDelete(null);
      })
      .catch(err => showToast(`Failed to delete: ${err.message}`, 'error'));
  };

  const deleteDraft = (id: number) => {
    const draft = drafts.find(item => item.quotation_id === id) || { quotation_id: id };
    setDraftPendingDelete(draft);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopHeader />
        
        <main className="flex-1 overflow-y-auto p-8 pb-32" onClick={() => setActiveDropdown(null)}>
          <div className="max-w-[1200px] mx-auto space-y-8">
            
            {/* Resume Most Recent Card */}
            {recentDraft && (
              <div className="bg-white rounded-[24px] shadow-sm border border-[#ECECF1] overflow-hidden flex flex-col md:flex-row relative">
                <div className="p-8 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-red-600 font-bold text-[12px] tracking-widest uppercase mb-4">
                      <History className="w-4 h-4" /> Resume Most Recent
                    </div>
                    <h2 
                      className="text-[32px] font-bold text-gray-900 leading-tight mb-8 cursor-pointer hover:text-red-600 transition-colors"
                      onClick={() => navigate(`/quotation-builder?id=${recentDraft.quotation_id}`)}
                    >
                      {getQuotationClientInfo(recentDraft).event} Draft
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Client</p>
                        <p 
                          className="text-[14px] font-bold text-gray-900 cursor-pointer hover:text-red-600"
                          onClick={() => navigate(`/quotation-builder?id=${recentDraft.quotation_id}`)}
                        >
                          {getQuotationClientInfo(recentDraft).name}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Est. Value</p>
                        <p className="text-[16px] font-bold text-gray-900">{formatCurrency(Number(recentDraft.total || 0))}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Progress</p>
                        <div 
                          className="cursor-pointer group"
                          onClick={() => navigate(`/quotation-builder?id=${recentDraft.quotation_id}`)}
                        >
                          <p className="text-[14px] font-bold text-gray-900 group-hover:text-red-600 mb-1.5">
                            Step {Math.min(8, Math.max(1, (recentDraft.lines?.length || 0) + 1))} of 8
                          </p>
                          <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-600 rounded-full" 
                              style={{ width: `${(Math.min(8, Math.max(1, (recentDraft.lines?.length || 0) + 1)) / 8) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Last Edited</p>
                        <p className="text-[14px] font-bold text-gray-900">{formatTime(recentDraft.updated_at)}</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate(`/quotation-builder?id=${recentDraft.quotation_id}`)}
                    className="w-max px-8 py-3.5 bg-gradient-to-r from-red-700 to-orange-400 text-white rounded-full font-bold text-[15px] shadow-[0_4px_14px_rgba(220,38,38,0.3)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.4)] transition-all flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" /> Continue Editing
                  </button>
                </div>
                
                <div className="hidden md:block w-1/3 bg-gray-900 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                    alt="Event Venue"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent w-32 left-0 z-10"></div>
                </div>
              </div>
            )}

            {/* List Section Header */}
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-[24px] font-bold text-gray-900">Your Drafts</h2>
                <p className="text-[14px] text-gray-500 mt-1">Showing {totalItems} incomplete quotations requiring your attention.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {}}
                  className="px-4 py-2 bg-white border border-[#ECECF1] text-gray-700 rounded-full font-bold text-[13px] hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" /> Sort by
                </button>
              </div>
            </div>

            {/* Drafts Table */}
            <div className="bg-white rounded-[24px] shadow-sm border border-[#ECECF1] overflow-hidden min-h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader className="w-10 h-10 text-red-500 animate-spin" />
                </div>
              ) : error ? (
                <div className="p-8 text-center text-sm font-medium text-red-500">
                  Failed to load drafts: {error}
                </div>
              ) : drafts.length === 0 ? (
                <div className="p-8 text-center text-sm font-medium text-gray-400">
                  No drafts found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F8F9FC]">
                      <tr>
                        <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-widest w-[120px]">Quote #</th>
                        <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-widest">Client</th>
                        <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-widest">Last Edited</th>
                        <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-widest w-[200px]">Progress</th>
                        <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-widest">Est. Value</th>
                        <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-widest text-center w-[100px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drafts.map((draft: any) => {
                        const clientInfo = getQuotationClientInfo(draft);
                        const progressStep = Math.min(8, Math.max(1, (draft.lines?.length || 0) + 1));
                        
                        return (
                          <tr 
                            key={draft.quotation_id} 
                            className="border-b border-[#ECECF1] hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/quotation-builder?id=${draft.quotation_id}`)}
                          >
                            <td className="py-4 px-6">
                              <span className="text-[14px] font-bold text-gray-900">
                                #QTN-{String(draft.quotation_id).padStart(5, '0')}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${clientInfo.avatarBg} ${clientInfo.avatarText}`}>
                                  {clientInfo.initials}
                                </div>
                                <span className="text-[14px] font-semibold text-gray-900">{clientInfo.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-[13px] text-gray-600">{formatTime(draft.updated_at)}</span>
                            </td>
                            <td className="py-4 px-6">
                              <div 
                                className="group"
                                onClick={(e) => { e.stopPropagation(); navigate(`/quotation-builder?id=${draft.quotation_id}`); }}
                              >
                                <p className="text-[13px] font-bold text-gray-900 mb-1.5 group-hover:text-red-600 transition-colors">Step {progressStep} of 8</p>
                                <div className="h-1.5 w-full max-w-[120px] bg-gray-200 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${progressStep > 4 ? 'bg-emerald-500' : progressStep < 3 ? 'bg-red-600' : 'bg-orange-400'}`} style={{ width: `${(progressStep / 8) * 100}%` }}></div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-[14px] font-bold text-gray-900">{formatCurrency(Number(draft.total || 0))}</span>
                            </td>
                            <td className="py-4 px-6 text-center relative">
                              <button 
                                onClick={(e) => toggleDropdown(draft.quotation_id, e)}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                              >
                                <MoreHorizontal className="w-5 h-5" />
                              </button>
                              
                              {/* Actions Dropdown */}
                              {activeDropdown === draft.quotation_id && (
                                <div className="absolute right-8 top-10 w-[200px] bg-white rounded-[16px] shadow-lg border border-[#ECECF1] py-2 z-10 animate-in fade-in zoom-in-95 duration-200">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); navigate(`/quotation-builder?id=${draft.quotation_id}`); }}
                                    className="w-full flex items-center px-4 py-2 text-[13px] font-bold text-gray-700 hover:bg-gray-50"
                                  >
                                    <Edit2 className="w-4 h-4 mr-3 text-gray-400" /> Continue Editing
                                  </button>
                                  <div className="h-px bg-[#ECECF1] my-1"></div>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); deleteDraft(draft.quotation_id); }}
                                    className="w-full flex items-center px-4 py-2 text-[13px] font-bold text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4 mr-3 text-red-400" /> Delete Draft
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="shrink-0">
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
      <ConfirmationModal
        open={Boolean(draftPendingDelete)}
        title="Delete Draft?"
        message="This draft will be removed from your draft queue. Any submitted or approved quotations are not affected."
        confirmLabel="Delete Draft"
        onCancel={() => setDraftPendingDelete(null)}
        onConfirm={confirmDeleteDraft}
      />
    </div>
  );
};

export default DraftManagementCenter;

