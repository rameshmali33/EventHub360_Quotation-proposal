import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, IndianRupee, Percent } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { quotationService } from '../services/quotationService';
import { formatCurrency } from '../utils/currency';

const MarginAnalysis = () => {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quotationService.getQuotations({ limit: 100, sortBy: 'created_at', sortOrder: 'desc' })
      .then((response) => setQuotes(response.data || []))
      .catch((caught) => setError(caught instanceof Error ? caught.message : 'Failed to load margin data'))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => quotes.reduce((acc, quote) => {
    acc.revenue += Number(quote.subtotal || 0);
    acc.cost += Number(quote.cost_total || 0);
    acc.margin += Number(quote.margin || 0);
    return acc;
  }, { revenue: 0, cost: 0, margin: 0 }), [quotes]);

  const marginPercent = totals.revenue > 0 ? (totals.margin / totals.revenue) * 100 : 0;

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      <div className="ml-[260px] flex h-screen flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-7">
              <h2 className="text-[28px] font-extrabold text-gray-950">Quotation profitability</h2>
              <p className="mt-1 text-[14px] font-medium text-gray-500">Read-only financial view of saved quotation revenue and costs.</p>
            </div>
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              {[
                { label: 'Subtotal Revenue', value: formatCurrency(totals.revenue), icon: IndianRupee },
                { label: 'Total Cost', value: formatCurrency(totals.cost), icon: IndianRupee },
                { label: 'Net Margin', value: `${marginPercent.toFixed(1)}%`, icon: Percent },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-lg border border-[#E5E7EC] bg-white p-5 shadow-sm">
                  <Icon className="h-5 w-5 text-red-600" />
                  <p className="mt-4 text-[12px] font-bold text-gray-500">{label}</p>
                  <p className="mt-1 text-[24px] font-extrabold text-gray-950">{value}</p>
                </div>
              ))}
            </div>
            <div className="overflow-hidden rounded-lg border border-[#E5E7EC] bg-white shadow-sm">
              {error ? (
                <div className="flex items-center gap-3 p-6 text-sm font-semibold text-red-700"><AlertCircle className="h-5 w-5" />{error}</div>
              ) : loading ? (
                <div className="p-8 text-sm font-semibold text-gray-500">Loading margin analysis...</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-[#F8F9FC] text-left text-[11px] font-extrabold uppercase text-gray-500">
                    <tr><th className="px-6 py-4">Quote</th><th className="px-6 py-4">Client</th><th className="px-6 py-4">Subtotal</th><th className="px-6 py-4">Cost</th><th className="px-6 py-4">Margin</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECECF1]">
                    {quotes.map((quote) => {
                      const subtotal = Number(quote.subtotal || 0);
                      const margin = Number(quote.margin || 0);
                      const percent = subtotal > 0 ? (margin / subtotal) * 100 : 0;
                      return (
                        <tr key={quote.quotation_id} className="text-[13px] font-semibold text-gray-700">
                          <td className="px-6 py-4 font-extrabold text-gray-950">#QT-{quote.quotation_id}</td>
                          <td className="px-6 py-4">{quote.lead?.name || 'Unknown Client'}</td>
                          <td className="px-6 py-4">{formatCurrency(subtotal)}</td>
                          <td className="px-6 py-4">{formatCurrency(Number(quote.cost_total || 0))}</td>
                          <td className="px-6 py-4"><span className={percent >= 20 ? 'text-emerald-600' : 'text-amber-600'}>{formatCurrency(margin)} ({percent.toFixed(1)}%)</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MarginAnalysis;