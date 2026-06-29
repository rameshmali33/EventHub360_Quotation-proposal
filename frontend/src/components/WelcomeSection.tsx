import React from 'react';
import EventSummaryBox from './EventSummaryBox';

interface WelcomeSectionProps {
  proposal?: any | null;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ proposal }) => {
  const quotation = proposal?.quotation;
  const clientName = quotation?.clientName || 'client';

  return (
    <>
      <div className="flex-1">
        <div className="mb-6">
          <span className="text-[13px] font-bold text-[#B3262E] uppercase tracking-widest">
            Welcome Message
          </span>
        </div>

        <h2 className="text-[42px] font-semibold text-gray-900 leading-[1.1] mb-8 tracking-tight">
          Curated Event<br />Proposal.
        </h2>

        <div className="space-y-6 text-[16px] font-medium text-gray-600 leading-relaxed">
          <p>
            Dear {clientName}, thank you for giving EventHub360 the opportunity to curate your event experience.
          </p>
          <p>
            This proposal is generated from quotation #{quotation?.quoteRef || String(proposal?.quotationId || '').padStart(5, '0')} and includes the selected venue, services, pricing, taxes, and total investment for your review.
          </p>
          <p>
            Once approved, our team can move this proposal into client sharing, signature, and booking confirmation.
          </p>
        </div>
      </div>

      <EventSummaryBox proposal={proposal} />
    </>
  );
};

export default WelcomeSection;