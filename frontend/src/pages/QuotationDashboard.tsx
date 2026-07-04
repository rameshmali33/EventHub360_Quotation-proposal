import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import KPICard from '../components/KPICard';
import SummaryCard from '../components/SummaryCard';
import MonthlyQuotationChart from '../components/MonthlyQuotationChart';
import QuoteStatusChart from '../components/QuoteStatusChart';
import ConversionFunnel from '../components/ConversionFunnel';
import PendingApprovalList from '../components/PendingApprovalList';
import RecentQuotationTable from '../components/RecentQuotationTable';
import TopSalesExecutives from '../components/TopSalesExecutives';
import { useNavigate } from 'react-router-dom';
import { qtnDashboardService } from '../services/qtnDashboardService';
import { Loader } from 'lucide-react';

import { FileText, Banknote, Target, FileEdit, Send, CheckCircle, Clock } from 'lucide-react';

const formatRevenue = (value: number) => {
  const symbol = '\u20b9';
  if (!value) return `${symbol}0`;
  if (value >= 10000000) {
    return `${symbol}${(value / 10000000).toFixed(1)}Cr`;
  }
  if (value >= 100000) {
    return `${symbol}${(value / 100000).toFixed(1)}L`;
  }
  if (value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(0)}K`;
  }
  return `${symbol}${value.toLocaleString()}`;
};

const QuotationDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    qtnDashboardService.getStats()
      .then(res => setStats(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopHeader />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader className="w-10 h-10 text-red-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-100">
                Failed to load dashboard metrics: {error}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <KPICard 
                    title="Pending Quotes" 
                    value={stats ? String(stats.pendingApprovals) : '0'} 
                    trend="up" 
                    trendValue={0} 
                    icon={FileText} 
                    iconBg="bg-red-50" 
                    iconColor="text-red-600"
                    onClick={() => navigate('/quotations/approval-workbench')}
                  />
                  <KPICard 
                    title="Revenue Forecast" 
                    value={stats ? formatRevenue(stats.totalRevenue) : '\u20b90'} 
                    trend="up" 
                    trendValue={0} 
                    icon={Banknote} 
                    iconBg="bg-amber-50" 
                    iconColor="text-amber-600"
                    onClick={() => navigate('/quotations/forecast')}
                  />
                  <KPICard 
                    title="Total Approved" 
                    value={stats ? String(stats.approvedQuotations || 0) : '0'} 
                    trend="up" 
                    trendValue={0} 
                    icon={CheckCircle} 
                    iconBg="bg-emerald-50" 
                    iconColor="text-emerald-600"
                    onClick={() => navigate('/quotations/approved-center')}
                  />
                  <KPICard 
                    title="Conversion Rate" 
                    value={stats ? `${stats.acceptanceRate}%` : '0%'} 
                    trend="up" 
                    trendValue={0} 
                    icon={Target} 
                    iconBg="bg-emerald-50" 
                    iconColor="text-emerald-600" 
                    onClick={() => navigate('/quotations/forecast')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <SummaryCard icon={FileEdit} value={stats ? String(stats.draftQuotations) : '0'} label="Drafts" iconBg="bg-gray-100" iconColor="text-gray-600" onClick={() => navigate('/quotations/drafts')} />
                  <SummaryCard icon={Send} value={stats ? String(stats.sentQuotations) : '0'} label="Sent" iconBg="bg-blue-50" iconColor="text-blue-600" onClick={() => navigate('/quotations/master?status=sent')} />
                  <SummaryCard icon={CheckCircle} value={stats ? String(stats.approvedQuotations || 0) : '0'} label="Approved" iconBg="bg-emerald-50" iconColor="text-emerald-600" onClick={() => navigate('/quotations/approved-center')} />
                  <SummaryCard icon={Clock} value={stats ? String(stats.expiredQuotations || 0) : '0'} label="Expired" iconBg="bg-rose-50" iconColor="text-rose-600" onClick={() => navigate('/quotations/master?status=expired')} />
                </div>
              </>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[340px]">
              <div className="lg:col-span-8 h-full">
                <MonthlyQuotationChart />
              </div>
              <div className="lg:col-span-4 h-full">
                <QuoteStatusChart />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
              <div className="h-full">
                <ConversionFunnel />
              </div>
              <div className="h-full">
                <PendingApprovalList />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[400px]">
              <div className="lg:col-span-8 h-full">
                <RecentQuotationTable />
              </div>
              <div className="lg:col-span-4 h-full">
                <TopSalesExecutives />
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default QuotationDashboard;

