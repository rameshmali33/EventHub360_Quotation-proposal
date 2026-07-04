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

const formatDate = (value?: string | null) => value
  ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : 'Not specified';

const formatItemType = (value: string) => String(value || 'Service')
  .replace(/_/g, ' ')
  .toLowerCase()
  .replace(/\b\w/g, (character) => character.toUpperCase());

const FormalQuotationPage = ({ proposal }: { proposal?: any | null }) => {
  const quotation = proposal?.quotation;
  if (!quotation) return null;

  const lines = Array.isArray(quotation.lines) ? quotation.lines : [];
  const subtotal = Number(quotation.subtotal || 0);
  const taxTotal = Number(quotation.taxTotal || 0);
  const total = Number(quotation.total || subtotal + taxTotal);
  const taxRate = subtotal > 0 ? (taxTotal / subtotal) * 100 : 0;

  return (
    <article className="min-h-[1120px] bg-white px-14 py-12 text-gray-900">
      <header className="flex items-start justify-between border-b-2 border-gray-900 pb-7">
        <div>
          <h1 className="text-[26px] font-black tracking-tight"><span className="text-red-700">Event</span>Hub360</h1>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Enterprise Event Concierge</p>
          <p className="mt-4 max-w-[340px] text-[12px] font-medium leading-relaxed text-gray-500">
            Professional event quotation prepared from the approved EventHub360 scope.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[34px] font-black uppercase tracking-[0.12em] text-gray-950">Quotation</p>
          <p className="mt-2 text-[14px] font-black text-red-700">#{quotation.quoteRef}</p>
          <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
            {quotation.status || 'Approved'}
          </span>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-10 border-b border-gray-200 py-7">
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Quotation For</p>
          <h2 className="text-[20px] font-black text-gray-950">{quotation.clientName || 'Client'}</h2>
          <p className="mt-1 text-[12px] font-semibold text-gray-500">Client Account</p>
        </div>
        <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-[12px]">
          <dt className="font-bold text-gray-500">Quotation Date</dt>
          <dd className="text-right font-black text-gray-900">{formatDate(quotation.createdAt || proposal?.createdAt)}</dd>
          <dt className="font-bold text-gray-500">Valid Until</dt>
          <dd className="text-right font-black text-gray-900">{formatDate(quotation.expiresAt)}</dd>
          <dt className="font-bold text-gray-500">Currency</dt>
          <dd className="text-right font-black text-gray-900">{quotation.currency || 'INR'}</dd>
          <dt className="font-bold text-gray-500">Proposal Ref</dt>
          <dd className="text-right font-black text-gray-900">PROP-{String(proposal?.id || 0).padStart(5, '0')}</dd>
        </dl>
      </section>

      <section className="py-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-700">Commercial Schedule</p>
            <h2 className="mt-1 text-[22px] font-black text-gray-950">Scope and Pricing</h2>
          </div>
          <p className="text-[11px] font-bold text-gray-500">{lines.length} item{lines.length === 1 ? '' : 's'}</p>
        </div>

        <div className="overflow-hidden border border-gray-300">
          <table className="w-full table-fixed border-collapse text-left">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="w-[52px] px-3 py-3 text-center text-[10px] font-black uppercase tracking-wider">No.</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider">Description</th>
                <th className="w-[70px] px-3 py-3 text-center text-[10px] font-black uppercase tracking-wider">Qty</th>
                <th className="w-[125px] px-3 py-3 text-right text-[10px] font-black uppercase tracking-wider">Rate</th>
                <th className="w-[135px] px-4 py-3 text-right text-[10px] font-black uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-[13px] font-semibold text-gray-500">No active quotation line items were returned.</td></tr>
              ) : lines.map((line: any, index: number) => {
                const qty = Number(line.qty || 0);
                const rate = Number(line.rate || 0);
                const amount = Number(line.amount || 0) || qty * rate;
                return (
                  <tr key={line.lineId || `${line.description}-${index}`} className="border-b border-gray-200 last:border-b-0">
                    <td className="px-3 py-4 text-center text-[12px] font-bold text-gray-500">{index + 1}</td>
                    <td className="px-4 py-4">
                      <p className="break-words text-[13px] font-black leading-snug text-gray-950">{line.description || 'Quotation item'}</p>
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-gray-400">{formatItemType(line.itemType)}</p>
                    </td>
                    <td className="px-3 py-4 text-center text-[12px] font-bold text-gray-700">{qty}</td>
                    <td className="px-3 py-4 text-right text-[12px] font-semibold text-gray-700">{formatCurrency(rate)}</td>
                    <td className="px-4 py-4 text-right text-[12px] font-black text-gray-950">{formatCurrency(amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-[1fr_330px] gap-10 border-t border-gray-200 pt-7">
        <div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.16em] text-gray-900">Commercial Terms</h3>
          <ul className="mt-4 space-y-2 text-[11px] font-medium leading-relaxed text-gray-600">
            <li>1. This quotation remains valid until {formatDate(quotation.expiresAt)}.</li>
            <li>2. Services are confirmed after written acceptance and the agreed advance payment.</li>
            <li>3. Scope changes requested after acceptance may require a revised quotation.</li>
            <li>4. Applicable taxes are shown separately and included in the grand total.</li>
          </ul>
        </div>
        <div className="border border-gray-300">
          <div className="flex justify-between border-b border-gray-200 px-5 py-3 text-[12px] font-bold text-gray-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between border-b border-gray-200 px-5 py-3 text-[12px] font-bold text-gray-600"><span>GST ({taxRate.toFixed(2)}%)</span><span>{formatCurrency(taxTotal)}</span></div>
          <div className="flex justify-between bg-red-700 px-5 py-4 text-white"><span className="text-[13px] font-black uppercase tracking-wider">Grand Total</span><span className="text-[19px] font-black">{formatCurrency(total)}</span></div>
        </div>
      </section>

      <section className="mt-14 grid grid-cols-2 gap-16">
        <div className="border-t border-gray-400 pt-3"><p className="text-[11px] font-black uppercase tracking-wider text-gray-700">Authorized Signatory</p><p className="mt-1 text-[10px] font-medium text-gray-400">For EventHub360</p></div>
        <div className="border-t border-gray-400 pt-3"><p className="text-[11px] font-black uppercase tracking-wider text-gray-700">Client Acceptance</p><p className="mt-1 text-[10px] font-medium text-gray-400">Name, signature, and date</p></div>
      </section>

      <footer className="mt-12 flex items-center justify-between border-t border-gray-200 pt-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">
        <span>System-generated quotation</span><span>#{quotation.quoteRef}</span>
      </footer>
    </article>
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
          </>
        )}

        {activePageId === 'quotation' && (
          <FormalQuotationPage proposal={proposal} />
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