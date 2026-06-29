import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { qtnDashboardService } from '../services/qtnDashboardService';

const SALES_EXECUTIVES_KEY = 'sales_executives_master';

type SalesExecutiveMaster = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  territory?: string;
  target?: number;
  status?: 'Active' | 'Inactive';
};

const getInitials = (name: string) => (
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || 'U'
);

const readSalesExecutiveMaster = (): SalesExecutiveMaster[] => {
  try {
    const saved = localStorage.getItem(SALES_EXECUTIVES_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item.status !== 'Inactive') : [];
  } catch {
    return [];
  }
};

const resolveExecutiveForBackendRow = (row: any, activeExecutives: SalesExecutiveMaster[], index: number) => {
  if (activeExecutives.length === 0) return row;

  const backendName = String(row.name || '');
  const exactByName = activeExecutives.find((item) => item.name.toLowerCase() === backendName.toLowerCase());
  if (exactByName) return { ...row, name: exactByName.name, masterId: exactByName.id, territory: exactByName.territory };

  const ramesh = activeExecutives.find((item) => item.name.toLowerCase() === 'ramesh mali');
  const matched = Number(row.userId) === 1 && ramesh ? ramesh : activeExecutives[index % activeExecutives.length];
  return { ...row, name: matched.name, masterId: matched.id, territory: matched.territory };
};

const mergeWithSalesMaster = (backendRows: any[], activeExecutives: SalesExecutiveMaster[]) => {
  const merged = new Map<string, any>();

  backendRows.forEach((row, index) => {
    const resolved = resolveExecutiveForBackendRow(row, activeExecutives, index);
    const key = resolved.masterId || `backend-${resolved.userId || index}`;
    const existing = merged.get(key);
    if (existing) {
      merged.set(key, {
        ...existing,
        quotationsCreated: Number(existing.quotationsCreated || 0) + Number(resolved.quotationsCreated || 0),
        quotationsAccepted: Number(existing.quotationsAccepted || 0) + Number(resolved.quotationsAccepted || 0),
        revenue: Number(existing.revenue || 0) + Number(resolved.revenue || 0),
      });
    } else {
      merged.set(key, resolved);
    }
  });

  activeExecutives.forEach((item) => {
    if (!merged.has(item.id)) {
      merged.set(item.id, {
        userId: item.id,
        masterId: item.id,
        name: item.name,
        territory: item.territory,
        quotationsCreated: 0,
        quotationsAccepted: 0,
        revenue: 0,
        acceptanceRate: 0,
      });
    }
  });

  return Array.from(merged.values()).sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0) || String(a.name).localeCompare(String(b.name)));
};

const TopSalesExecutives = () => {
  const [executives, setExecutives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadExecutives = async () => {
    setLoading(true);
    setError('');
    try {
      const [backendRows] = await Promise.all([
        qtnDashboardService.getTopSalesExecutives(),
      ]);
      const activeMasterExecutives = readSalesExecutiveMaster();
      setExecutives(mergeWithSalesMaster(backendRows || [], activeMasterExecutives));
    } catch (err: any) {
      setError(err.message || 'Failed to load sales executives.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExecutives();
    const handleStorage = () => loadExecutives();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const maxRevenue = executives.length > 0 ? Math.max(...executives.map(e => Number(e.revenue || 0)), 0) : 0;

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ECECF1] h-full flex flex-col">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Top Sales Executives</h3>
      
      <div className="flex-1 flex flex-col gap-5 justify-center">
        {loading ? (
          <div className="h-full min-h-[200px] flex items-center justify-center">
            <Loader className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-sm font-medium text-red-500 text-center">Failed to load: {error}</p>
        ) : executives.length === 0 ? (
          <p className="text-sm font-medium text-gray-400 text-center">No executive performance data available.</p>
        ) : (
          executives.slice(0, 5).map((exec: any, idx: any) => {
            const revenue = Number(exec.revenue || 0);
            const progress = maxRevenue > 0 ? Math.round((revenue / maxRevenue) * 100) : 0;
            return (
              <div key={exec.masterId || exec.userId || exec.name} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-red-50 text-red-700 border border-red-100 flex items-center justify-center text-[12px] font-black">
                        {getInitials(exec.name)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-[9px] font-bold text-gray-700">{idx + 1}</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className="block text-sm font-bold text-gray-900 truncate">{exec.name}</span>
                      {exec.territory && <span className="block text-[11px] font-semibold text-gray-400 truncate">{exec.territory}</span>}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-red-600 shrink-0">
                    {formatCurrency(revenue)}
                  </span>
                </div>
                <div className="pl-[52px]">
                   <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-gradient-to-r from-red-600 to-orange-400 rounded-full" 
                       style={{ width: `${progress}%` }} 
                     />
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TopSalesExecutives;