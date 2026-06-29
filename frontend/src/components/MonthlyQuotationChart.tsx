import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    qtnDashboardService.getMonthlyQuotations()
      .then(res => {
        const mapped = res.map((item: any) => ({
          name: item.month.toUpperCase(),
          value: item.revenue,
          highlighted: false
        }));
        
        const maxVal = Math.max(...mapped.map((d: any) => d.value), 0);
        mapped.forEach((d: any) => {
          if (d.value === maxVal && maxVal > 0) {
            d.highlighted = true;
          }
        });
        setChartData(mapped);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
        <button className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
          Last 12 Months
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
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
