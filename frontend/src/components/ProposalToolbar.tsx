import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ZoomOut, ZoomIn, Printer, Download, Share2, Loader, Send } from 'lucide-react';
import { proposalService, Proposal } from '../services/proposalService';
import { useToast } from '../context/ToastContext';

interface ProposalToolbarProps {
  proposal?: Proposal | null;
  quotationId?: string | null;
}

const ProposalToolbar: React.FC<ProposalToolbarProps> = ({ proposal, quotationId }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSendToClient = async () => {
    if (!quotationId || !proposal) {
      showToast('Cannot send: Proposal is not loaded.', 'error');
      return;
    }
    setSending(true);
    setStatus(null);
    try {
      const updated = await proposalService.sendProposalToClient(quotationId);
      setStatus(`Sent! (Status: ${updated.status})`);
      showToast(`Proposal successfully sent to client email (client@example.com)`, 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      showToast(err.message || 'Failed to send proposal to client', 'error');
    } finally {
      setSending(false);
    }
  };

  const currentStatus = proposal?.status || 'DRAFT';

  return (
    <div className="h-[72px] bg-white border-b border-[#ECECF1] px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      
      {/* Left */}
      <div className="flex items-center gap-4 w-[350px]">
        <button 
          onClick={() => {
            if (quotationId) {
              navigate(`/quotation-builder?id=${quotationId}`);
            } else {
              navigate(-1);
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Back to Quotation Builder"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex flex-col">
          {proposal ? (
            <>
              <h2 className="text-[16px] font-bold text-[#B3262E] leading-tight">
                Proposal #{proposal.id}
              </h2>
              <p className="text-[13px] font-medium text-gray-500 leading-tight">
                Quotation #QTN-{String(proposal.quotationId).padStart(5, '0')} • <span className="font-bold">{currentStatus}</span>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-[16px] font-bold text-gray-700 leading-tight">
                Proposal Management
              </h2>
              <p className="text-[13px] font-medium text-gray-500 leading-tight">
                No active proposal loaded
              </p>
            </>
          )}
        </div>
      </div>

      {/* Center - Zoom */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center bg-[#F8F9FC] rounded-full px-2 py-1 border border-[#ECECF1]">
          <button className="p-1.5 hover:bg-white rounded-full transition-colors text-gray-500">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[13px] font-bold text-gray-700 w-14 text-center">100%</span>
          <button className="p-1.5 hover:bg-white rounded-full transition-colors text-gray-500">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center justify-end gap-6 w-[350px]">
        <div className="flex items-center gap-4 text-gray-600">
          <button className="hover:text-gray-900 transition-colors">
            <Printer className="w-5 h-5" />
          </button>
          <button className="hover:text-gray-900 transition-colors">
            <Download className="w-5 h-5" />
          </button>
          <button className="hover:text-gray-900 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
        
        {proposal && currentStatus === 'DRAFT' && (
          <button 
            onClick={handleSendToClient}
            disabled={sending}
            className="h-10 px-6 rounded-full bg-gradient-to-r from-red-600 to-orange-400 text-white text-[14px] font-bold shadow-md hover:shadow-lg hover:from-red-700 hover:to-orange-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all flex items-center gap-2"
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
        
        {proposal && currentStatus !== 'DRAFT' && (
          <div className="px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-bold flex items-center gap-1.5">
            Sent to Client
          </div>
        )}
      </div>

    </div>
  );
};

export default ProposalToolbar;
