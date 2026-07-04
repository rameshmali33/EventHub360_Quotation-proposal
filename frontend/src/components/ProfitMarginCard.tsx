

interface ProfitMarginCardProps {
  subtotal: number;
  margin: number;
}

const ProfitMarginCard = ({ subtotal, margin }: ProfitMarginCardProps) => {
  const marginPercent = subtotal > 0 ? (margin / subtotal) * 100 : 0;
  const clampedProgress = Math.max(0, Math.min(100, marginPercent));
  const displayMargin = `${marginPercent.toFixed(1)}%`;

  return (
    <div className="bg-[#F8F5FF] rounded-[24px] p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[14px] font-bold text-gray-500 uppercase tracking-widest">Net Profit Margin</h4>
        <span className="text-[24px] font-bold text-[#6D4C41]">{displayMargin}</span>
      </div>
      
      <div className="h-2 w-full bg-indigo-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-red-600 to-orange-400 rounded-full"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      
      <p className="text-[11px] font-medium text-gray-500 leading-relaxed italic">
        Margin is calculated from the saved quote subtotal and cost total.
      </p>
    </div>
  );
};

export default ProfitMarginCard;
