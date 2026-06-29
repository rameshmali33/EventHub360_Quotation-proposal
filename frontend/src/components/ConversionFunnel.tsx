import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { qtnDashboardService } from '../services/qtnDashboardService';

const ConversionFunnel = () => {
  const [funnel, setFunnel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    qtnDashboardService.getConversionFunnel()
      .then(res => setFunnel(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const leads = funnel ? funnel.leads : 0;
  const created = funnel ? funnel.quotationsCreated : 0;
  const sent = funnel ? funnel.quotationsSent : 0;
  const accepted = funnel ? funnel.quotationsAccepted : 0;

  const quoteSentPercent = created > 0 ? ((sent / created) * 100).toFixed(1) : '0.0';
  const closingRate = created > 0 ? ((accepted / created) * 100).toFixed(1) : '0.0';

  const leadPercent = 100;
  const createdPercent = leads > 0 ? Math.max(45, Math.min(100, Math.round((created / leads) * 100))) : 85;
  const sentPercent = created > 0 ? Math.max(35, Math.min(100, Math.round((sent / created) * createdPercent))) : 65;
  const acceptedPercent = sent > 0 ? Math.max(30, Math.min(100, Math.round((accepted / sent) * sentPercent))) : 45;

  const steps = [
    { label: 'Leads Qualified', value: leads.toLocaleString(), color: 'bg-red-100 text-red-900', percent: leadPercent },
    { label: 'Quotes Created', value: created.toLocaleString(), color: 'bg-red-300 text-red-900', percent: createdPercent },
    { label: 'Quotes Sent', value: sent.toLocaleString(), color: 'bg-red-500 text-white', percent: sentPercent },
    { label: 'Contracts Signed', value: accepted.toLocaleString(), color: 'bg-red-700 text-white', percent: acceptedPercent },
  ];

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ECECF1] h-full flex flex-col">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Conversion Funnel</h3>
      
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        {loading ? (
          <Loader className="w-8 h-8 text-red-500 animate-spin" />
        ) : error ? (
          <p className="text-sm font-medium text-red-500 text-center">Failed to load: {error}</p>
        ) : (
          steps.map((step: any, index: any) => (
            <div 
              key={index} 
              className={`h-12 rounded-[14px] ${step.color} flex items-center justify-between px-6 transition-all`}
              style={{ width: `${step.percent}%` }}
            >
              <span className="text-sm font-medium">{step.label}</span>
              <span className="text-sm font-bold">{step.value}</span>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8 bg-gray-50 p-4 rounded-[16px] shrink-0">
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600 mb-1">{quoteSentPercent}%</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quote Sent %</p>
        </div>
        <div className="text-center border-l border-gray-200">
          <p className="text-2xl font-bold text-gray-900 mb-1">{closingRate}%</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Closing Rate</p>
        </div>
      </div>
    </div>
  );
};

export default ConversionFunnel;
