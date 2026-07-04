import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChevronDown, Loader } from 'lucide-react';
import { qtnDashboardService } from '../services/qtnDashboardService';

const formatCompactInr = (value: number) => {
  const symbol = '\u20b9';
  if (!value) return `${symbol}0`;
  if (value >= 10000000) return `${symbol}${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${symbol}${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${symbol}${(value / 1000).toFixed(0)}K`;
  return `${symbol}${value.toLocaleString('en-IN')}`;
};
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-md shadow-lg font-medium">
        {formatCompactInr(Number(val || 0))}
      </div>
    );
  }
  return null;
};

const MonthlyQuotationChart = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [months, setMonths] = useState(12);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    qtnDashboardService.getMonthlyQuotations(months)
      .then((res: any) => {
        if (cancelled) return;
        const currentMonth = new Date()
          .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          .toUpperCase();
        const mapped = res.map((item: any) => ({
          name: item.month.toUpperCase(),
          value: Number(item.revenue || 0),
          highlighted: item.month.toUpperCase() === currentMonth,
        }));
        setChartData(mapped);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [months]);

  const CustomBarLabel = (props: any) => {
    const { x, y, width, index, value } = props;
    if (chartData[index]?.highlighted) {
      const label = formatCompactInr(Number(value || 0));
      return (
        <g>
          <rect x={x + width / 2 - 24} y={y - 28} width="48" height="20" fill="#111827" rx="4" />
          <text x={x + width / 2} y={y - 14} fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">
            {label}
          </text>
        </g>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ECECF1] h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-bold text-gray-900">Monthly Quotations</h3>
        <div className="relative shrink-0">
          <select
            value={months}
            onChange={(event) => setMonths(Number(event.target.value))}
            className="h-9 appearance-none rounded-lg border border-gray-100 bg-gray-50 pl-3 pr-9 text-sm font-semibold text-gray-600 outline-none transition-colors hover:bg-gray-100 focus:border-red-300 focus:ring-2 focus:ring-red-100"
            aria-label="Monthly quotation chart range"
          >
            <option value={3}>Last 3 Months</option>
            <option value={6}>Last 6 Months</option>
            <option value={12}>Last 12 Months</option>
            <option value={24}>Last 24 Months</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[240px] flex items-center justify-center">
        {loading ? (
          <Loader className="w-8 h-8 text-red-500 animate-spin" />
        ) : error ? (
          <p className="text-sm font-medium text-red-500">Failed to load chart data: {error}</p>
        ) : chartData.length === 0 ? (
          <p className="text-sm font-medium text-gray-400">No monthly revenue data available.</p>
        ) : (
          <ResponsiveContainer width="99%" height="99%">
            <BarChart data={chartData} margin={{ top: 30, right: 0, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name"
                interval={months === 24 ? 2 : months === 12 ? 1 : 0}
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar 
                dataKey="value" 
                radius={[6, 6, 6, 6]}
                barSize={32}
                label={<CustomBarLabel />}
              >
                {chartData.map((entry: any, index: any) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.highlighted ? '#dc2626' : '#eff2f6'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default MonthlyQuotationChart;
