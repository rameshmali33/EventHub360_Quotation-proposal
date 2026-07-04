

const formatINR = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val);

interface QuoteSummaryCardProps {
  subtotal: number | null;
  taxTotal: number | null;
  total: number | null;
  liveSubtotal: number;
}

const QuoteSummaryCard = ({ subtotal, taxTotal, total, liveSubtotal }: QuoteSummaryCardProps) => {
  const savedSubtotal = subtotal ?? 0;
  const savedTax = taxTotal ?? 0;
  const savedTotal = total ?? 0;
  const fallbackTaxRate = savedSubtotal > 0 ? savedTax / savedSubtotal : 0;
  const fallbackTotal = liveSubtotal + (liveSubtotal * fallbackTaxRate);

  const displaySubtotal = liveSubtotal;
  const displayTax = liveSubtotal > 0 ? liveSubtotal * fallbackTaxRate : 0;
  const displayTotal = savedSubtotal > 0 || savedTotal > 0 ? fallbackTotal : liveSubtotal;

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#ECECF1] mb-6">
      <div className="mb-8">
        <h3 className="text-[20px] font-bold text-gray-900 leading-tight">Live<br/>Summary</h3>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-[15px] font-medium text-gray-500">Subtotal</span>
          <span className="text-[15px] font-bold text-gray-900">
            {formatINR(displaySubtotal)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[15px] font-medium text-gray-500">Taxes</span>
          <span className="text-[15px] font-bold text-gray-900">
            {formatINR(displayTax)}
          </span>
        </div>
      </div>

      <div className="pt-6 border-t border-[#ECECF1]">
        <div className="flex justify-between items-center">
          <span className="text-[16px] font-bold text-gray-900">Total Quote Value</span>
          <span className="text-[22px] font-bold text-[#B3262E]">
            {formatINR(displayTotal)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuoteSummaryCard;
