import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Loader, AlertCircle, CheckCircle2, Send, Sparkles } from 'lucide-react';
import { proposalService, Proposal } from '../services/proposalService';

interface ProposalGeneratorCardProps {
  quotationId?: string | null;
  quoteStatus?: string | null;
}

const ProposalGeneratorCard: React.FC<ProposalGeneratorCardProps> = ({ quotationId: propQuotationId, quoteStatus }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get quotationId from props or URL query parameters
  const quotationId = propQuotationId || searchParams.get('id');
  const autoGenerate = searchParams.get('generate') === 'true';
  const normalizedQuoteStatus = String(quoteStatus || '').toUpperCase();
  const canGenerateProposal = normalizedQuoteStatus === 'APPROVED';

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check if proposal already exists or automatically generate on mount/load if requested
  useEffect(() => {
    let active = true;

    async function checkOrGenerate() {
      if (!quotationId) return;

      // Handle auto-generation from query param
      if (autoGenerate) {
        // Clean URL parameter
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('generate');
        setSearchParams(newParams, { replace: true });

        if (!canGenerateProposal) {
          setError('Proposal can be generated only after this quotation is approved.');
          return;
        }
        
        await handleGenerate();
        return;
      }

      // Check if there is already a proposal associated with this quotation
      try {
        const existing = await proposalService.getProposalByQuotationId(quotationId);
        if (active && existing) {
          setProposal(existing);
          setAlreadyExists(true);
        }
      } catch (err) {
        // Silent error, means proposal does not exist yet (normal state)
      }
    }

    checkOrGenerate();
    return () => {
      active = false;
    };
  }, [quotationId, autoGenerate]);

  const handleGenerate = async () => {
    if (!quotationId) {
      setError('Quotation ID is missing. Cannot generate proposal.');
      return;
    }

    if (!canGenerateProposal) {
      setError('Proposal can be generated only after this quotation is approved.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setAlreadyExists(false);

    try {
      // 1. Check if proposal already exists
      let existingProposal: Proposal | null = null;
      try {
        existingProposal = await proposalService.getProposalByQuotationId(quotationId);
      } catch (e) {
        // 404/not found, ignore
      }

      if (existingProposal) {
        setProposal(existingProposal);
        setAlreadyExists(true);
        setSuccessMsg('Proposal already exists for this quotation.');
        navigate(`/proposals?id=${quotationId}`);
      } else {
        // 2. Call generateProposal API
        const newProposal = await proposalService.generateProposal(quotationId);
        setProposal(newProposal);
        setAlreadyExists(false);
        setSuccessMsg('Proposal generated successfully!');
        navigate(`/proposals?id=${quotationId}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToClient = async () => {
    if (!quotationId || !proposal) return;
    setSending(true);
    setError(null);
    try {
      const updated = await proposalService.sendProposalToClient(quotationId);
      setProposal(updated);
      setSuccessMsg('Proposal successfully sent to client!');
    } catch (err: any) {
      setError(err.message || 'Failed to send proposal');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-[28px] border-2 border-red-100 shadow-[0_8px_30px_rgba(220,38,38,0.08)] p-6 relative overflow-hidden mb-6">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <div className="relative z-10">
        {!proposal ? (
          <>
            <button
              onClick={handleGenerate}
              disabled={loading || !canGenerateProposal}
              className="w-full h-14 rounded-full bg-gradient-to-r from-red-600 to-orange-400 text-white text-[16px] font-bold flex items-center justify-center gap-2 hover:from-red-700 hover:to-orange-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg mb-6"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  {canGenerateProposal ? 'Generate Proposal' : 'Approval Required'}
                  {canGenerateProposal && <ArrowRight className="w-5 h-5 ml-1" />}
                </>
              )}
            </button>
            {!canGenerateProposal && !error && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 text-[13px] font-semibold rounded-xl mb-4 border border-amber-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Approve this quotation before generating a proposal.</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-[13px] font-semibold rounded-xl mb-4 border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Proposal Status</span>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                proposal.status === 'SENT' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                proposal.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                proposal.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-100' :
                'bg-amber-50 text-amber-700 border border-amber-100'
              }`}>
                {proposal.status}
              </span>
            </div>

            {successMsg && (
              <div className="flex items-start gap-2 p-3 bg-emerald-50 text-emerald-800 text-[13px] font-medium rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-950">{alreadyExists ? 'Already Generated' : 'Success'}</p>
                  <p className="text-[12px] leading-tight mt-0.5">{successMsg}</p>
                </div>
              </div>
            )}

            {!canGenerateProposal && !error && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 text-[13px] font-semibold rounded-xl mb-4 border border-amber-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Approve this quotation before generating a proposal.</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-[13px] font-semibold rounded-xl border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}


            <div className="space-y-2 pt-2">
              <button
                onClick={() => navigate(`/proposals?id=${quotationId}`)}
                className="w-full h-11 rounded-xl bg-gray-900 text-white text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-sm"
              >
                Open Studio
                <ArrowRight className="w-4 h-4" />
              </button>

              {proposal.status === 'DRAFT' && (
                <button
                  onClick={handleSendToClient}
                  disabled={sending}
                  className="w-full h-11 rounded-xl border border-red-200 bg-white text-red-600 text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-red-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {sending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send to Client
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="text-center relative z-10 mt-6 border-t border-gray-100 pt-6">
          <div className="flex items-center justify-center gap-1.5 text-red-600 mb-1">
            <Sparkles className="w-4 h-4 shrink-0" />
            <h5 className="text-[14px] font-bold text-gray-900">Premium Concierge</h5>
          </div>
          <p className="text-[12px] font-medium text-gray-500 leading-relaxed mb-3 px-2">
            Unlock luxury inventory and priority venue booking features.
          </p>
          <button className="text-[13px] font-bold text-red-600 hover:text-red-700 transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalGeneratorCard;
