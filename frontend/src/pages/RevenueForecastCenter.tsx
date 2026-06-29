import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { qtnDashboardService } from '../services/qtnDashboardService';
import { 
  TrendingUp, BarChart3, PieChart, Activity, Target, ArrowRight, Loader
} from 'lucide-react';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
};

const RevenueForecastCenter = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [funnel, setFunnel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      qtnDashboardService.getStats(),
      qtnDashboardService.getConversionFunnel()
    ]).then(([statsRes, funnelRes]) => {
      setStats(statsRes);
      setFunnel(funnelRes);
    }).catch(err => console.error('Failed to load forecast data:', err))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = stats ? Number(stats.totalRevenue || 0) : 0;
  const pendingVal = stats ? Number(stats.pendingApprovals || 0) * 45000 : 0;
  const sentVal = stats ? Number(stats.sentQuotations || 0) * 65000 : 0;
  const draftVal = stats ? Number(stats.draftQuotations || 0) * 15000 : 0;

  const projections = [
    { label: 'Monthly Projection', value: formatCurrency(totalRevenue), target: formatCurrency(0), status: totalRevenue > 0 ? 'On Track' : 'No Data' },
    { label: 'Quarterly Projection', value: formatCurrency(totalRevenue * 3), target: formatCurrency(0), status: totalRevenue > 0 ? 'On Track' : 'No Data' },
    { label: 'Yearly Projection', value: formatCurrency(totalRevenue * 12), target: formatCurrency(0), status: totalRevenue > 0 ? 'On Track' : 'No Data' }
  ];

  const pipeline = [
    { stage: 'Initial Inquiry', count: funnel ? funnel.leads : 0, value: formatCurrency(funnel ? funnel.leads * 35000 : 0) },
    { stage: 'Draft Quotes', count: stats ? stats.draftQuotations : 0, value: formatCurrency(draftVal) },
    { stage: 'Quotes Sent', count: stats ? stats.sentQuotations : 0, value: formatCurrency(sentVal) },
    { stage: 'Pending Approval', count: stats ? stats.pendingApprovals : 0, value: formatCurrency(pendingVal) }
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopHeader />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Revenue Forecast Center</h1>
                <p className="text-[15px] text-gray-500 mt-1">Analyze pipeline velocity, conversion impact, and projected revenue.</p>
              </div>
              <button className="px-5 py-2.5 bg-white border border-[#ECECF1] text-gray-700 rounded-full font-bold text-[14px] hover:bg-gray-50 transition-colors shadow-sm">
                Download Report
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader className="w-10 h-10 text-red-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* Forecast Summary & Projections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {projections.map((proj: any, idx: any) => (
                    <div key={idx} className="bg-white rounded-[24px] p-6 shadow-sm border border-[#ECECF1] relative overflow-hidden">
                      <div className={`absolute top-0 right-0 w-2 h-full ${proj.status === 'On Track' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                      <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-2">{proj.label}</p>
                      <h3 className="text-[36px] font-black text-gray-900 mb-2">{proj.value}</h3>
                      <div className="flex items-center justify-between mt-4 border-t border-[#ECECF1] pt-4">
                        <div>
                          <p className="text-[11px] text-gray-400 font-bold uppercase">Target</p>
                          <p className="text-[14px] font-bold text-gray-700">{proj.target}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${proj.status === 'On Track' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                          {proj.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  
                  {/* Opportunity Pipeline */}
                  <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#ECECF1]">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[18px] font-bold text-gray-900">Opportunity Pipeline</h3>
                      <Target className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                      {pipeline.map((item: any, idx: any) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-[#F8F9FC] rounded-[16px] border border-[#ECECF1]">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-[12px]">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-[14px] font-bold text-gray-900">{item.stage}</p>
                              <p className="text-[12px] text-gray-500">{item.count} Active Quotes</p>
                            </div>
                          </div>
                          <p className="text-[16px] font-black text-gray-900">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conversion Impact Analysis */}
                  <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#ECECF1]">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[18px] font-bold text-gray-900">Conversion Impact Analysis</h3>
                      <Activity className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="h-[310px] flex flex-col justify-center items-center bg-[#F8F9FC] rounded-[16px] border border-dashed border-[#ECECF1]">
                      <PieChart className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-[14px] font-semibold text-gray-500">Conversion chart visualization here</p>
                      <p className="text-[12px] text-gray-400 max-w-xs text-center mt-2">Win rate impacts projected revenue by +/- 15%</p>
                    </div>
                  </div>

                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default RevenueForecastCenter;
