import React from 'react';

interface CoverPageProps {
  proposal?: any | null;
}

const CoverPage: React.FC<CoverPageProps> = ({ proposal }) => {
  const quotation = proposal?.quotation;
  const clientName = quotation?.clientName || 'Client Proposal';
  const quoteRef = quotation?.quoteRef || (proposal ? `QTN-${String(proposal.quotationId).padStart(5, '0')}` : 'QTN');
  const status = proposal?.status || 'DRAFT';

  return (
    <div className="w-full h-[500px] relative overflow-hidden group">
      <img
        src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        alt="Event proposal cover"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      <div className="absolute bottom-0 left-0 p-16 w-full">
        <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-white/75 mb-4">EventHub360 Proposal</p>
        <h1 className="text-[56px] font-bold text-white leading-tight mb-3 tracking-tight">
          {clientName}
        </h1>
        <p className="text-[20px] font-medium text-white/90 tracking-wide">
          Quote #{quoteRef} - Proposal #{proposal?.id || '--'} - {status}
        </p>
      </div>
    </div>
  );
};

export default CoverPage;