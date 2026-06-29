import React from 'react';
import CoverPage from './CoverPage';
import WelcomeSection from './WelcomeSection';


interface ProposalCanvasProps {
  proposal?: any | null;
  activePageId?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
};

const ProposalLineItems = ({ proposal }: { proposal?: any | null }) => {
  const quotation = proposal?.quotation;
  const lines = quotation?.lines || [];

  if (!quotation) return null;

  return (
    <div className="px-16 pb-16">
      <div className="border-t border-gray-200 pt-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#B3262E] mb-2">Commercial Scope</p>
            <h3 className="text-[30px] font-black text-gray-950">Selected Items</h3>
          </div>
          <div className="text-right">
            <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Total</p>
            <p className="text-[28px] font-black text-[#B3262E]">{formatCurrency(quotation.total)}</p>
          </div>
        </div>

        {lines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm font-semibold text-gray-500">
            No quotation line items were found for this proposal.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-[11px] font-black uppercase tracking-widest text-gray-500">Description</th>
                  <th className="px-5 py-4 text-[11px] font-black uppercase tracking-widest text-gray-500 text-center">Qty</th>
                  <th className="px-5 py-4 text-[11px] font-black uppercase tracking-widest text-gray-500 text-right">Rate</th>
                  <th className="px-5 py-4 text-[11px] font-black uppercase tracking-widest text-gray-500 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {lines.map((line: any) => (
                  <tr key={line.lineId}>
                    <td className="px-5 py-4">
                      <p className="text-[14px] font-bold text-gray-950">{line.description}</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{line.itemType}</p>
                    </td>
                    <td className="px-5 py-4 text-center text-[14px] font-semibold text-gray-700">{line.qty}</td>
                    <td className="px-5 py-4 text-right text-[14px] font-semibold text-gray-700">{formatCurrency(line.rate)}</td>
                    <td className="px-5 py-4 text-right text-[14px] font-black text-gray-950">{formatCurrency(line.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 ml-auto w-full max-w-[360px] space-y-3 rounded-2xl bg-gray-50 p-6 border border-gray-100">
          <div className="flex justify-between text-[14px] font-semibold text-gray-600"><span>Subtotal</span><span>{formatCurrency(quotation.subtotal)}</span></div>
          <div className="flex justify-between text-[14px] font-semibold text-gray-600"><span>Taxes</span><span>{formatCurrency(quotation.taxTotal)}</span></div>
          <div className="flex justify-between border-t border-gray-200 pt-4 text-[18px] font-black text-gray-950"><span>Total Quote Value</span><span>{formatCurrency(quotation.total)}</span></div>
        </div>
      </div>
    </div>
  );
};


const getMoodboardItems = (lines: any[]) => {
  const palette = [
    { name: 'Signature Red', color: '#B3262E' },
    { name: 'Champagne Gold', color: '#C7A15A' },
    { name: 'Ivory Linen', color: '#F7F1E7' },
    { name: 'Charcoal Detail', color: '#1F2937' },
  ];
  const highlights = lines.slice(0, 6).map((line) => ({
    title: line.description,
    category: String(line.itemType || 'Service').replace(/_/g, ' '),
  }));
  return { palette, highlights };
};

const getTimelineItems = (lines: any[]) => {
  const order = ['VENUE', 'FLORAL', 'CATERING', 'SERVICE', 'PACKAGE'];
  const sorted = [...lines].sort((a, b) => order.indexOf(a.itemType) - order.indexOf(b.itemType));
  const fallback = [
    { title: 'Proposal Review', detail: 'Client reviews the event scope and commercials.' },
    { title: 'Confirmation', detail: 'Approval, signature, and booking confirmation.' },
    { title: 'Execution Planning', detail: 'Operations team prepares the final event plan.' },
  ];
  return (sorted.length ? sorted : fallback).slice(0, 6).map((line: any, index: number) => ({
    time: index === 0 ? 'T-30 Days' : index === 1 ? 'T-21 Days' : index === 2 ? 'T-14 Days' : index === 3 ? 'T-7 Days' : index === 4 ? 'T-2 Days' : 'Event Day',
    title: line.title || line.description,
    detail: line.detail || `${String(line.itemType || 'Service').replace(/_/g, ' ')} coordination and vendor confirmation.`,
  }));
};

const MoodboardPage = ({ proposal }: { proposal?: any | null }) => {
  const lines = proposal?.quotation?.lines || [];
  const { palette, highlights } = getMoodboardItems(lines);

  return (
    <div className="p-16 min-h-[700px]">
      <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#B3262E] mb-3">Visual Direction</p>
      <h2 className="text-[38px] font-black text-gray-950 mb-3">Moodboard & Styling</h2>
      <p className="text-[16px] font-medium text-gray-500 max-w-2xl mb-10">A proposal moodboard generated from the selected quotation scope, ready for client review and design refinement.</p>

      <div className="grid grid-cols-4 gap-4 mb-12">
        {palette.map((item) => (
          <div key={item.name} className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
            <div className="h-24" style={{ backgroundColor: item.color }} />
            <div className="p-4 text-[12px] font-black uppercase tracking-wider text-gray-700">{item.name}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {(highlights.length ? highlights : [{ title: 'No selected styling items yet', category: 'Quotation Scope' }]).map((item) => (
          <div key={`${item.title}-${item.category}`} className="rounded-3xl border border-gray-100 bg-[#F8F9FC] p-6">
            <p className="text-[11px] font-black uppercase tracking-widest text-[#B3262E] mb-2">{item.category}</p>
            <h3 className="text-[20px] font-black text-gray-950 leading-tight">{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

const TimelinePage = ({ proposal }: { proposal?: any | null }) => {
  const timeline = getTimelineItems(proposal?.quotation?.lines || []);

  return (
    <div className="p-16 min-h-[700px]">
      <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#B3262E] mb-3">Planning Flow</p>
      <h2 className="text-[38px] font-black text-gray-950 mb-3">Execution Timeline</h2>
      <p className="text-[16px] font-medium text-gray-500 max-w-2xl mb-10">A practical milestone timeline derived from the selected quotation items.</p>

      <div className="space-y-5">
        {timeline.map((item, index) => (
          <div key={`${item.time}-${item.title}`} className="flex gap-5">
            <div className="w-[90px] shrink-0 text-right pt-1 text-[12px] font-black uppercase tracking-wider text-[#B3262E]">{item.time}</div>
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#B3262E] text-white flex items-center justify-center text-[13px] font-black">{index + 1}</div>
              {index !== timeline.length - 1 && <div className="w-px flex-1 min-h-[48px] bg-red-100" />}
            </div>
            <div className="flex-1 rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
              <h3 className="text-[18px] font-black text-gray-950 mb-1">{item.title}</h3>
              <p className="text-[14px] font-medium text-gray-500">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
const ProposalCanvas: React.FC<ProposalCanvasProps> = ({ proposal, activePageId = 'cover' }) => {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-10 flex justify-center bg-[#F7F8FC] h-full custom-scrollbar">
      <div className="w-full max-w-[900px] bg-white rounded-[16px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col shrink-0 min-h-[800px] mb-20 relative">
        {activePageId === 'cover' && (
          <>
            <CoverPage proposal={proposal} />
            <div className="p-16 flex gap-16">
              <WelcomeSection proposal={proposal} />
            </div>
            <ProposalLineItems proposal={proposal} />
          </>
        )}

        {activePageId === 'moodboard' && (
          <MoodboardPage proposal={proposal} />
        )}

        {activePageId === 'agenda' && (
          <TimelinePage proposal={proposal} />
        )}
      </div>
    </div>
  );
};

export default ProposalCanvas;