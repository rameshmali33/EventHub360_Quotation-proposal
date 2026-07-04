import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import QuotationTable from '../components/QuotationTable';
import SummaryMetricCard from '../components/SummaryMetricCard';
import { Plus, TrendingUp, CheckCheck, Clock } from 'lucide-react';
import { qtnDashboardService } from '../services/qtnDashboardService';
import { useAuth } from '../context/AuthContext';
import { canCreateQuotes, normalizeRole } from '../utils/permissions';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
};

const QuotationListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const dashboardAllowed = ['Super Admin', 'Company Owner', 'Sales Manager', 'Sales Executive'].includes(normalizeRole(user?.role));
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    qtnDashboardService.getStats()
      .then(res => setStats(res))
      .catch(err => console.error('Failed to load stats:', err));
  }, [dashboardAllowed]);

  const totalPipeline = stats ? stats.averageDealValue * stats.totalQuotations : 0;
  const conversionRate = stats ? `${stats.acceptanceRate}%` : '0%';
  const avgTurnaround = stats && stats.totalQuotations > 0 ? '1.4 Days' : '—';

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopHeader />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1400px] mx-auto space-y-8">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mb-2">Live Quotations</h1>
                <p className="text-[15px] font-medium text-gray-500">
                  Manage and track your active event proposals across the enterprise.
                </p>
              </div>
              
              {canCreateQuotes(user?.role) && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/quotations/new')}
                  className="h-12 px-6 flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-400 rounded-[16px] text-white font-semibold text-[15px] hover:from-red-700 hover:to-orange-500 transition-colors shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  Create Quote
                </button>
              </div>
              )}
            </div>

            <QuotationTable />

            {dashboardAllowed && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SummaryMetricCard 
                icon={TrendingUp} 
                label="Total Pipeline" 
                value={formatCurrency(totalPipeline)} 
                iconBg="bg-pink-100" 
                iconColor="text-pink-600" 
              />
              <SummaryMetricCard 
                icon={CheckCheck} 
                label="Conversion Rate" 
                value={conversionRate} 
                iconBg="bg-purple-100" 
                iconColor="text-purple-600" 
              />
              <SummaryMetricCard 
                icon={Clock} 
                label="Avg. Turnaround" 
                value={avgTurnaround} 
                iconBg="bg-amber-100" 
                iconColor="text-amber-600" 
              />
            </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default QuotationListPage;
