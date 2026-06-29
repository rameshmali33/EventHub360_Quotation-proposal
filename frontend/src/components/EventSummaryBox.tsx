import React from 'react';
import { Calendar } from 'lucide-react';

interface EventSummaryBoxProps {
  proposal?: any | null;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
};

const formatDate = (value?: string | null) => {
  if (!value) return 'To be confirmed';
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const EventSummaryBox: React.FC<EventSummaryBoxProps> = ({ proposal }) => {
  const quotation = proposal?.quotation;
  const lineCount = quotation?.lines?.length || 0;

  return (
    <div className="w-[340px] bg-[#F6F7FC] rounded-[28px] p-8 shrink-0 relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="flex items-center gap-3 mb-8">
        <Calendar className="w-5 h-5 text-[#B3262E]" />
        <h3 className="text-[14px] font-bold text-gray-900 tracking-widest uppercase">
          Quote Summary
        </h3>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Client</p>
          <p className="text-[15px] font-semibold text-gray-900 leading-tight mb-1">{quotation?.clientName || 'Client'}</p>
          <p className="text-[14px] font-medium text-gray-500 leading-tight">Proposal #{proposal?.id || '--'}</p>
        </div>

        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Quotation Ref</p>
          <p className="text-[15px] font-semibold text-gray-900 leading-tight">#{quotation?.quoteRef || `QTN-${String(proposal?.quotationId || 0).padStart(5, '0')}`}</p>
        </div>

        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Created</p>
          <p className="text-[15px] font-semibold text-gray-900 leading-tight">{formatDate(quotation?.createdAt || proposal?.createdAt)}</p>
        </div>

        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Scope</p>
          <p className="text-[15px] font-semibold text-gray-900 leading-tight">{lineCount} line item{lineCount === 1 ? '' : 's'}</p>
          <p className="text-[14px] font-medium text-gray-500 leading-tight">Venue, services, catering, and add-ons</p>
        </div>

        <div className="pt-5 border-t border-gray-200">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Total Quote Value</p>
          <p className="text-[24px] font-black text-[#B3262E] leading-tight">{formatCurrency(quotation?.total || 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default EventSummaryBox;