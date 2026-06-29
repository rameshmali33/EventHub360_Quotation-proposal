import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Loader } from 'lucide-react';
import { qtnDashboardService } from '../services/qtnDashboardService';

const STATUS_COLORS: { [key: string]: string } = {
  ACCEPTED: '#dc2626',
  SENT: '#f97316',
  DRAFT: '#fcd34d',
  REJECTED: '#cbd5e1',
  PENDING_APPROVAL: '#818cf8',
  EXPIRED: '#bae6fd',
};

const formatStatusName = (status: string) => {
  return status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
};

const QuoteStatusChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    qtnDashboardService.getStatusSummary()
      .then(res => {
        const mapped = res.map((item: any) => ({
          name: formatStatusName(item.status),
          value: item.count,
          color: STATUS_COLORS[item.status] || '#94a3b8'
        }));
        setData(mapped);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalItems = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ECECF1] h-full flex flex-col">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Quote Status</h3>
      
      <div className="flex-1 relative flex items-center justify-center w-full min-h-[220px]">
        {loading ? (
          <Loader className="w-8 h-8 text-red-500 animate-spin" />
        ) : error ? (
          <p className="text-sm font-medium text-red-500 text-center">Failed to load: {error}</p>
        ) : data.length === 0 ? (
          <p className="text-sm font-medium text-gray-400 text-center">No status data available.</p>
        ) : (
          <>
            <ResponsiveContainer width="99%" height="99%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry: any, index: any) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-gray-900 leading-none">{totalItems}</span>
              <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Total Items</span>
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      {!loading && !error && data.length > 0 && (
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-4 px-2 overflow-y-auto max-h-[100px]">
          {data.map((item: any, index: any) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] font-medium text-gray-600 truncate">
                {item.name} <span className="text-gray-400">({item.value})</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuoteStatusChart;
