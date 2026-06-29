import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ProposalToolbar from '../components/ProposalToolbar';
import DocumentMap from '../components/DocumentMap';
import ProposalCanvas from '../components/ProposalCanvas';
import ProposalToolsPanel from '../components/ProposalToolsPanel';
import ProposalSettingsCard from '../components/ProposalSettingsCard';
import { CollaborationCard, SendStatusCard } from '../components/CollaborationCard';
import { proposalService, Proposal } from '../services/proposalService';
import { quotationService } from '../services/quotationService';
import { Files, FileText, Loader, Search, ArrowRight, Send, CheckCircle2 } from 'lucide-react';

const initialPages = [
  { id: 'cover', title: 'Cover Page', type: 'cover' },
  { id: 'moodboard', title: 'Moodboard', type: 'moodboard' },
  { id: 'agenda', title: 'Event Timeline', type: 'agenda' },
];

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
const formatDate = (value?: string | null) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not dated';

const ProposalLibrary = ({ proposals, loading, error, onOpen }: { proposals: Proposal[]; loading: boolean; error: string; onOpen: (proposal: Proposal) => void }) => {
  const [search, setSearch] = useState('');
  const filtered = proposals.filter((proposal) => {
    const haystack = `${proposal.id} ${proposal.status} ${proposal.quotation?.clientName || ''} ${proposal.quotation?.quoteRef || ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F8FC] p-8">
      <div className="max-w-[1180px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-black text-gray-950 tracking-tight">Proposal Studio</h1>
            <p className="text-[15px] text-gray-500 mt-1">Open generated proposals, review scope, and continue client-ready proposal work.</p>
          </div>
          <div className="relative w-full md:w-[360px]">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search proposal, client, quote..."
              className="w-full h-12 rounded-2xl border border-[#ECECF1] bg-white pl-11 pr-4 text-[14px] font-semibold text-gray-800 focus:outline-none focus:border-red-300"
            />
          </div>
        </div>

        {loading ? (
          <div className="h-[420px] flex items-center justify-center">
            <Loader className="w-9 h-9 text-red-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-sm font-semibold text-red-700">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="h-[420px] rounded-3xl border border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-center p-8">
            <Files className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No proposals found</h3>
            <p className="text-sm text-gray-500 max-w-md">Generate a proposal from an approved quotation, then it will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {filtered.map((proposal) => (
              <button
                key={proposal.id}
                onClick={() => onOpen(proposal)}
                className="bg-white rounded-[24px] border border-[#ECECF1] p-6 text-left shadow-sm hover:border-red-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[16px] font-black text-gray-950 truncate">{proposal.quotation?.clientName || 'Client Proposal'}</p>
                      <p className="text-[13px] font-semibold text-gray-500 mt-1">#{proposal.quotation?.quoteRef || `QTN-${String(proposal.quotationId).padStart(5, '0')}`} - Proposal #{proposal.id}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${proposal.status === 'DRAFT' ? 'bg-amber-50 text-amber-700' : proposal.status === 'SENT' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {proposal.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">Total</p>
                    <p className="text-[16px] font-black text-gray-950">{formatCurrency(proposal.quotation?.total || 0)}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">Items</p>
                    <p className="text-[16px] font-black text-gray-950">{proposal.quotation?.lines?.length || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">Created</p>
                    <p className="text-[14px] font-black text-gray-950">{formatDate(proposal.createdAt)}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between text-[13px] font-bold text-red-600">
                  Open proposal document
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProposalStudio = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quotationId = searchParams.get('id');
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [error, setError] = useState('');
  const [libraryError, setLibraryError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState<string>('');
  const [pages, setPages] = useState(initialPages);
  const [activePageId, setActivePageId] = useState(pages[0].id);

  useEffect(() => {
    async function loadProposal() {
      if (!quotationId) return;
      setLoading(true);
      try {
        setError('');
        const p = await proposalService.getProposalByQuotationId(quotationId);
        setProposal(p);
        setQuoteStatus(p.quotation?.status || '');
      } catch (err: any) {
        setError(err.message || 'No proposal generated for this quotation yet.');
        setProposal(null);
        try {
          const quote = await quotationService.getQuotation(Number(quotationId));
          setQuoteStatus(quote.status || '');
        } catch {
          setQuoteStatus('');
        }
      } finally {
        setLoading(false);
      }
    }
    loadProposal();
  }, [quotationId]);

  useEffect(() => {
    async function loadProposals() {
      if (quotationId) return;
      setLibraryLoading(true);
      try {
        setLibraryError('');
        const list = await proposalService.getProposals();
        setProposals(list || []);
      } catch (err: any) {
        setLibraryError(err.message || 'Failed to load generated proposals.');
      } finally {
        setLibraryLoading(false);
      }
    }
    loadProposals();
  }, [quotationId]);

  const handleGenerateProposal = async () => {
    if (!quotationId) return;
    if (String(quoteStatus || '').toUpperCase() !== 'APPROVED') {
      setError('Proposal can be generated only after this quotation is approved.');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const created = await proposalService.generateProposal(quotationId);
      setProposal(created);
    } catch (err: any) {
      setError(err.message || 'Failed to generate proposal.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8FC] font-sans overflow-hidden h-screen">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col h-full overflow-hidden">
        <ProposalToolbar proposal={proposal} quotationId={quotationId} />
        <main className="flex-1 flex overflow-hidden">
          {!quotationId ? (
            <ProposalLibrary proposals={proposals} loading={libraryLoading} error={libraryError} onOpen={(item) => navigate(`/proposals?id=${item.quotationId}`)} />
          ) : (
            <>
              <DocumentMap pages={pages} setPages={setPages} activePageId={activePageId} onPageSelect={setActivePageId} />
              {loading ? (
                <div className="flex-1 flex items-center justify-center bg-[#F7F8FC]">
                  <div className="text-center space-y-2">
                    <Loader className="w-8 h-8 text-red-600 animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-gray-500">Loading proposal details...</p>
                  </div>
                </div>
              ) : !proposal ? (
                <div className="flex-1 flex items-center justify-center bg-[#F7F8FC]">
                  <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-[#ECECF1] max-w-md">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Proposal Generated</h3>
                    <p className="text-sm text-gray-500 mb-5">{error || 'Generate a proposal from this quotation to open the studio document.'}</p>
                    <button onClick={handleGenerateProposal} disabled={generating || String(quoteStatus || '').toUpperCase() !== 'APPROVED'} className="h-11 px-6 rounded-full bg-gradient-to-r from-red-600 to-orange-400 text-white text-[14px] font-bold shadow-md hover:from-red-700 hover:to-orange-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2">
                      {generating && <Loader className="w-4 h-4 animate-spin" />}
                      {String(quoteStatus || '').toUpperCase() === 'APPROVED' ? 'Generate Proposal' : 'Approval Required'}
                    </button>
                  </div>
                </div>
              ) : (
                <ProposalCanvas proposal={proposal} activePageId={activePageId} />
              )}
              <div className="w-[20%] min-w-[280px] max-w-[320px] bg-[#F7F8FC] border-l border-[#ECECF1] h-full overflow-y-auto custom-scrollbar shrink-0">
                <div className="p-6">
                  <ProposalToolsPanel />
                  <ProposalSettingsCard />
                  <CollaborationCard />
                  <SendStatusCard />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProposalStudio;