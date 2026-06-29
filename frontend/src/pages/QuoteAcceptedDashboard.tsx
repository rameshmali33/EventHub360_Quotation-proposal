import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { quotationService } from '../services/quotationService';
import { getQuotationClientInfo } from '../utils/quotationDisplay';
import { 
  LayoutDashboard, FileText, Files, LayoutTemplate, CheckSquare, Users, 
  Settings, HelpCircle, Bell, History as HistoryIcon, PlusCircle, 
  CheckCircle, Download, Wallet, ChevronRight, Calendar, MapPin, 
  ChefHat, Speaker, Flower2, Phone, Mail, FileSignature, Loader
} from 'lucide-react';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
};

const QuoteAcceptedDashboard = () => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  const [acceptedQuote, setAcceptedQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Auto-hide confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setLoading(true);
    quotationService.getQuotations({ status: 'ACCEPTED', limit: 1 })
      .then(res => {
        if (res.data && res.data.length > 0) {
          setAcceptedQuote(res.data[0]);
        }
      })
      .catch(err => console.error('Failed to load accepted quotation:', err))
      .finally(() => setLoading(false));
  }, []);

  const clientInfo = getQuotationClientInfo(acceptedQuote);
  const quoteTotal = acceptedQuote ? Number(acceptedQuote.total || 0) : 0;
  const quoteRef = acceptedQuote ? `QTN-${String(acceptedQuote.quotation_id).padStart(5, '0')}` : 'No accepted quote';
  const eventDate = acceptedQuote ? formatDate(acceptedQuote.expires_at || acceptedQuote.updated_at) : 'No event date';

  // Lightweight CSS Confetti logic
  const confettiColors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7'];
  const confettiPieces = Array.from({ length: 50 }).map((_: any, i: any) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${2 + Math.random() * 2}s`,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    size: `${6 + Math.random() * 6}px`
  }));

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans relative overflow-hidden">
      
      {/* CSS CONFETTI OVERLAY */}
      {showConfetti && (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
          {confettiPieces.map((p: any) => (
            <div
              key={p.id}
              className="absolute top-[-10px] rounded-sm opacity-80"
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                animation: `fall ${p.animationDuration} linear ${p.animationDelay} forwards`
              }}
            />
          ))}
          <style>{`
            @keyframes fall {
              0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopHeader />

        {/* Scrollable Main */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-10 pb-24">
          <div className="max-w-[1400px] mx-auto space-y-8">
            
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader className="w-10 h-10 text-red-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* MILESTONE BANNER HERO */}
                <div className="relative h-auto md:h-[240px] rounded-[32px] overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-[0_8px_30px_rgba(16,185,129,0.2)]">
                  {/* Background Accent Rings */}
                  <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] rounded-full border-[40px] border-white/10 pointer-events-none"></div>
                  <div className="absolute bottom-[-50%] right-[10%] w-[300px] h-[300px] rounded-full border-[20px] border-white/10 pointer-events-none"></div>

                  <div className="relative z-10 md:w-[60%] mb-8 md:mb-0">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[12px] font-bold uppercase tracking-widest mb-6 border border-white/30">
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                      </div>
                      MILESTONE REACHED
                    </div>
                    <h1 className="text-[32px] md:text-[42px] font-bold text-white tracking-tight leading-tight mb-4 drop-shadow-sm">
                      Quotation Accepted by Client!
                    </h1>
                    <p className="text-[16px] font-medium text-emerald-550 leading-relaxed max-w-xl">
                      The client has digitally signed Proposal <span className="font-bold underline decoration-emerald-300 underline-offset-4">#{quoteRef}</span>. You are now ready to finalize the booking and initialize the event operations workflow.
                    </p>
                  </div>

                  <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-[28px] p-6 text-center shadow-inner min-w-[240px]">
                    <p className="text-[12px] font-bold text-emerald-100 uppercase tracking-widest mb-2">REFERENCE ID</p>
                    <div className="text-[28px] font-black text-white tracking-wider font-mono">
                      {quoteRef}-2026
                    </div>
                  </div>
                </div>

                {/* DASHBOARD GRID - 3 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* CARD 1: TOTAL QUOTE VALUE */}
                  <div className="bg-white rounded-[28px] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ECECF1] flex flex-col justify-center">
                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3">Total Quote Value</p>
                    <p className="text-[36px] font-black text-gray-900 tracking-tight leading-none mb-4">{formatCurrency(quoteTotal)}</p>
                    <div className="flex items-center gap-2 text-[14px] font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-[12px] self-start">
                      <CheckCircle className="w-4 h-4" />
                      10% Deposit Received
                    </div>
                  </div>

                  {/* CARD 2: EVENT DATE */}
                  <div className="bg-white rounded-[28px] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ECECF1] flex flex-col justify-center">
                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3">Event Date</p>
                    <p className="text-[24px] font-bold text-gray-900 tracking-tight leading-none mb-3">{eventDate}</p>
                    <div className="flex items-center gap-2 text-[14px] font-medium text-gray-500 mb-4">
                      <MapPin className="w-4 h-4 text-orange-400" />
                      Venue: Lakeside Pavilion & Resort
                    </div>
                    <div className="flex items-center gap-2 text-[14px] font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-[12px] self-start">
                      <Calendar className="w-4 h-4" />
                      154 Days Remaining
                    </div>
                  </div>

                  {/* CARD 3: WORKFLOW ACTIVATION */}
                  <div className="bg-white rounded-[28px] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ECECF1] flex flex-col justify-center items-center text-center">
                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4">Workflow Activation</p>
                    <button className="w-full h-[64px] bg-gradient-to-r from-red-600 to-orange-400 hover:from-red-700 hover:to-orange-500 text-white rounded-[20px] font-bold text-[18px] shadow-[0_8px_20px_rgba(220,38,38,0.2)] hover:shadow-[0_10px_25px_rgba(220,38,38,0.3)] transition-all flex flex-col items-center justify-center transform hover:-translate-y-1">
                      Generate Final Booking
                      <span className="text-[11px] font-medium text-white/80 uppercase tracking-wider mt-0.5">and Create Operational Event</span>
                    </button>
                  </div>

                </div>

                {/* TWO COLUMNS LAYOUT FOR BOTTOM SECTION */}
                <div className="flex flex-col xl:flex-row gap-6">
                  
                  {/* LEFT COLUMN - VENDORS & SECONDARY ACTIONS */}
                  <div className="flex-1 space-y-6 xl:w-[70%]">
                    
                    {/* SECONDARY ACTIONS ROW */}
                    <div>
                      <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4">Secondary Actions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="group bg-white border border-[#ECECF1] rounded-[20px] p-5 flex items-center justify-between shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-left">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Users className="w-5 h-5" />
                            </div>
                            <span className="text-[15px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Assign Project Team</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </button>

                        <button className="group bg-white border border-[#ECECF1] rounded-[20px] p-5 flex items-center justify-between shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-left">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Wallet className="w-5 h-5" />
                            </div>
                            <span className="text-[15px] font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Notify Finance Department</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                        </button>

                        <button className="group bg-white border border-[#ECECF1] rounded-[20px] p-5 flex items-center justify-between shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-left">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Download className="w-5 h-5" />
                            </div>
                            <span className="text-[15px] font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Download Signed Contract</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                        </button>
                      </div>
                    </div>

                    {/* PRIMARY VENDOR LIST */}
                    <div className="bg-white rounded-[28px] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ECECF1]">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-[20px] font-bold text-gray-900">Primary Vendor List</h2>
                        <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-[13px] font-bold rounded-full">
                          6 Vendors Total
                        </span>
                      </div>

                      <div className="space-y-4">
                        {/* Vendor 1 */}
                        <div className="group border border-[#ECECF1] rounded-[20px] p-5 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-5 mb-4 md:mb-0">
                            <div className="w-12 h-12 rounded-[14px] bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
                              <ChefHat className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[16px] font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">{clientInfo.name} Caterers</p>
                              <p className="text-[13px] font-medium text-gray-500 uppercase tracking-wider">Gastronomy & Beverage Services</p>
                            </div>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-[18px] font-black text-gray-900">{formatCurrency(quoteTotal * 0.3)}</p>
                          </div>
                        </div>

                        {/* Vendor 2 */}
                        <div className="group border border-[#ECECF1] rounded-[20px] p-5 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-5 mb-4 md:mb-0">
                            <div className="w-12 h-12 rounded-[14px] bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                              <Speaker className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[16px] font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">Audio-Visual Vendor</p>
                              <p className="text-[13px] font-medium text-gray-500 uppercase tracking-wider">Audio-Visual Production</p>
                            </div>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-[18px] font-black text-gray-900">{formatCurrency(quoteTotal * 0.2)}</p>
                          </div>
                        </div>

                        {/* Vendor 3 */}
                        <div className="group border border-[#ECECF1] rounded-[20px] p-5 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-5 mb-4 md:mb-0">
                            <div className="w-12 h-12 rounded-[14px] bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100 shrink-0">
                              <Flower2 className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[16px] font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">Bloom & Stem Artistry</p>
                              <p className="text-[13px] font-medium text-gray-500 uppercase tracking-wider">Floral Design & Decor</p>
                            </div>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-[18px] font-black text-gray-900">{formatCurrency(quoteTotal * 0.12)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-[#ECECF1]">
                        <button className="text-[14px] font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-2">
                          View All Vendors
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT COLUMN - CLIENT ACCOUNT PANEL */}
                  <div className="xl:w-[30%]">
                    <div className="bg-white rounded-[28px] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ECECF1] sticky top-6">
                      <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-6">Client Account</h3>
                      
                      <div className="mb-8">
                        <h4 className="text-[22px] font-bold text-gray-900 mb-2">{clientInfo.name}</h4>
                        <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-[12px] font-bold rounded-full border border-purple-100">
                          Key Account: {clientInfo.event}
                        </span>
                      </div>

                      <div className="bg-[#F8F9FC] rounded-[20px] p-6 border border-[#ECECF1]">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Primary Contact</p>
                        
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 rounded-full bg-red-50 text-red-700 border-2 border-white shadow-sm flex items-center justify-center text-[15px] font-black">
                            RM
                          </div>
                          <div>
                            <p className="text-[16px] font-bold text-gray-900">Ramesh Mali</p>
                            <p className="text-[13px] font-medium text-gray-500">Lead Event Coordinator</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <button className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-[12px] border border-[#ECECF1] hover:border-gray-300 transition-colors group text-left">
                            <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                              <span className="text-[14px] font-semibold text-gray-700 group-hover:text-gray-900">Call Client</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </button>
                          
                          <button className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-[12px] border border-[#ECECF1] hover:border-gray-300 transition-colors group text-left">
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                              <span className="text-[14px] font-semibold text-gray-700 group-hover:text-gray-900">Email Client</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </button>

                          <button className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-[12px] border border-[#ECECF1] hover:border-gray-300 transition-colors group text-left">
                            <div className="flex items-center gap-3">
                              <FileSignature className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                              <span className="text-[14px] font-semibold text-gray-700 group-hover:text-gray-900">View Signatures</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </button>
                        </div>

                      </div>
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

export default QuoteAcceptedDashboard;
