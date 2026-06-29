import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { useToast } from '../context/ToastContext';
import { 
  HelpCircle, BookOpen, MessageCircle, FileText, Search, ArrowRight,
  Send, User, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Plus, X, Phone, Mail
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface TicketMessage {
  id: string;
  sender: 'user' | 'agent';
  senderName: string;
  text: string;
  timestamp: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  lastUpdated: string;
  messages: TicketMessage[];
}

const FAQS_DATABASE: FAQItem[] = [
  {
    category: 'Quotation Builder',
    question: 'How do I create a new quotation?',
    answer: 'Go to the "Quotations" tab in the sidebar, click the "+ Create Quotation" button in the upper-right corner, select a client lead from the list, set any initial settings, and click submit. You will then enter the interactive Quotation Builder where you can add line items and configure pricing.'
  },
  {
    category: 'Pricing & Currency',
    question: 'How do I change the base currency to Indian Rupees (INR)?',
    answer: 'Navigate to Settings -> System Settings -> Currency. Select "INR - Indian Rupee (₹)" in the dropdown menu and save. All default quotations and calculation sheets will be set to Indian Rupees by default.'
  },
  {
    category: 'Approvals & Workflows',
    question: 'How are approval rules triggered?',
    answer: 'Approval rules are triggered automatically based on thresholds configured in the System Settings (e.g. Standard Manager Review flags quotes above ₹10,000, and Discount Threshold flags manual discounts above 15%). When a quotation meets these conditions, its status changes to "Pending Approval" and notifications are sent to designated reviewers.'
  },
  {
    category: 'Proposals',
    question: 'Can I export a proposal as a PDF document?',
    answer: 'Yes! Open the proposal in the Proposal Studio or click "View Proposal". On the editing toolbar or header, click the "Export PDF" button. A print-optimized PDF containing your cover page, tables, and terms will download immediately.'
  },
  {
    category: 'Taxation & Charges',
    question: 'How do I configure VAT/GST tax rates?',
    answer: 'Go to Settings -> Tax Configuration. Here you can edit existing tax rules or add new ones. Specify the tax label (e.g. GST or VAT), the percentage rate, and whether it applies to service charges.'
  }
];

const INITIAL_TICKETS: SupportTicket[] = [];

const SupportCenter = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'faq' | 'tickets' | 'contact'>('faq');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  
  // New Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Quotation Builder');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [ticketDescription, setTicketDescription] = useState('');
  
  // Chat Reply State
  const [replyText, setReplyText] = useState('');
  
  // Contact Us Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // Load and Seed Tickets from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('support_tickets');
    if (saved) {
      setTickets(JSON.parse(saved));
    } else {
      setTickets(INITIAL_TICKETS);
    }
  }, []);

  const saveTickets = (updated: SupportTicket[]) => {
    localStorage.setItem('support_tickets', JSON.stringify(updated));
    setTickets(updated);
  };

  // Filter FAQs based on search
  const filteredFAQs = FAQS_DATABASE.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Create Ticket
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;

    const newTicket: SupportTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: ticketSubject,
      description: ticketDescription,
      category: ticketCategory,
      priority: ticketPriority,
      status: 'Open',
      lastUpdated: 'Just now',
      messages: [
        {
          id: `m-${Date.now()}`,
          sender: 'user',
          senderName: 'Admin',
          text: ticketDescription,
          timestamp: 'Just now'
        }
      ]
    };

    const updated = [newTicket, ...tickets];
    saveTickets(updated);

    // Reset Form
    setTicketSubject('');
    setTicketDescription('');
    setTicketPriority('Medium');
    setTicketCategory('Quotation Builder');
    setShowCreateTicketModal(false);

    showToast('Support ticket created.', 'success');
  };

  // Handle Send Chat Message inside Ticket
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const userMessage: TicketMessage = {
      id: `m-user-${Date.now()}`,
      sender: 'user',
      senderName: 'Admin',
      text: replyText,
      timestamp: 'Just now'
    };

    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        const messages = [...t.messages, userMessage];
        return {
          ...t,
          messages,
          lastUpdated: 'Just now',
          status: 'Open' as const
        };
      }
      return t;
    });

    const targetTicket = updatedTickets.find(t => t.id === selectedTicket.id);
    setSelectedTicket(targetTicket || null);
    saveTickets(updatedTickets);
    setReplyText('');

    showToast('Reply added to ticket.', 'success');
  };

  // Handle Contact Submit
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

    setContactSuccess(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setContactSuccess(false);
    }, 4000);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopHeader />
        
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-[1200px] mx-auto space-y-8">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-red-700 to-orange-400 rounded-[32px] p-12 text-white relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <HelpCircle className="w-48 h-48" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-[12px] font-bold rounded-full uppercase tracking-wider mb-4">
                  Help Center
                </span>
                <h1 className="text-[36px] font-bold tracking-tight mb-3">How can we help you today?</h1>
                <p className="text-[16px] text-red-50 mb-8 font-medium">Search our knowledge base or get in touch with our enterprise support team.</p>
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (activeTab !== 'faq') setActiveTab('faq');
                    }}
                    placeholder="Search FAQs, guides, or categories..." 
                    className="w-full pl-12 pr-4 py-4 bg-white rounded-full text-[15px] text-gray-900 focus:outline-none focus:ring-4 focus:ring-red-400/35 shadow-lg" 
                  />
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-[#ECECF1] gap-6">
              <button 
                onClick={() => setActiveTab('faq')}
                className={`pb-4 text-[15px] font-bold transition-all relative ${activeTab === 'faq' ? 'text-red-700' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Knowledge Base (FAQs)
                {activeTab === 'faq' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700 rounded-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('tickets')}
                className={`pb-4 text-[15px] font-bold transition-all relative ${activeTab === 'tickets' ? 'text-red-700' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Support Tickets
                {activeTab === 'tickets' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700 rounded-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('contact')}
                className={`pb-4 text-[15px] font-bold transition-all relative ${activeTab === 'contact' ? 'text-red-700' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Contact Support & Docs
                {activeTab === 'contact' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700 rounded-full" />}
              </button>
            </div>

            {/* Tab Contents */}
            <div>
              {/* TAB 1: FAQ / KNOWLEDGE BASE */}
              {activeTab === 'faq' && (
                <div className="space-y-6">
                  <h2 className="text-[20px] font-bold text-gray-900">Frequently Asked Questions</h2>
                  
                  {filteredFAQs.length === 0 ? (
                    <div className="bg-white rounded-[24px] p-12 text-center border border-[#ECECF1]">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-[16px] font-bold text-gray-900">No matches found</p>
                      <p className="text-gray-500 mt-1">Try search with other terms like "currency", "tax", or "rules".</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredFAQs.map((faq, index) => {
                        const isExpanded = expandedFAQ === index;
                        return (
                          <div 
                            key={index} 
                            className="bg-white rounded-[20px] border border-[#ECECF1] overflow-hidden transition-all shadow-sm"
                          >
                            <button
                              onClick={() => setExpandedFAQ(isExpanded ? null : index)}
                              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                            >
                              <div>
                                <span className="inline-block px-2.5 py-0.5 bg-red-50 text-red-700 text-[11px] font-bold rounded-md mb-2">
                                  {faq.category}
                                </span>
                                <h3 className="text-[16px] font-bold text-gray-900">{faq.question}</h3>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              )}
                            </button>
                            {isExpanded && (
                              <div className="px-6 pb-6 pt-2 border-t border-gray-50 text-[14px] leading-relaxed text-gray-600">
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SUPPORT TICKETS */}
              {activeTab === 'tickets' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-[20px] font-bold text-gray-900">Active Support Tickets</h2>
                      <p className="text-sm text-gray-500 mt-1">Track and manage your system queries directly with our desk.</p>
                    </div>
                    <button 
                      onClick={() => setShowCreateTicketModal(true)}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-700 to-orange-400 text-white rounded-full font-bold text-[14px] shadow-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Create Ticket
                    </button>
                  </div>

                  <div className="bg-white rounded-[24px] shadow-sm border border-[#ECECF1] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F8F9FC] border-b border-[#ECECF1]">
                          <tr>
                            <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Ticket ID</th>
                            <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Subject & Category</th>
                            <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Priority</th>
                            <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Updated</th>
                            <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ECECF1]">
                          {tickets.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-sm font-semibold text-gray-400">
                                No support tickets currently active. Click "Create Ticket" to open one.
                              </td>
                            </tr>
                          ) : (
                            tickets.map((t) => (
                              <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-6 font-bold text-gray-900 text-sm">{t.id}</td>
                                <td className="py-4 px-6">
                                  <div>
                                    <p className="text-sm font-bold text-gray-900">{t.subject}</p>
                                    <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded mt-1 inline-block">{t.category}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                    t.priority === 'High' ? 'bg-red-50 text-red-700' :
                                    t.priority === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {t.priority}
                                  </span>
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                    t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' :
                                    t.status === 'In Progress' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'
                                  }`}>
                                    {t.status}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-500">{t.lastUpdated}</td>
                                <td className="py-4 px-6 text-right">
                                  <button 
                                    onClick={() => setSelectedTicket(t)}
                                    className="px-3.5 py-1.5 bg-[#F8F9FC] border border-[#ECECF1] text-gray-700 hover:bg-red-700 hover:text-white transition-colors rounded-lg font-bold text-xs"
                                  >
                                    Open Chat
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CONTACT SUPPORT & DOCS */}
              {activeTab === 'contact' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left panel: Form */}
                  <div className="lg:col-span-2 bg-white rounded-[24px] p-8 border border-[#ECECF1] shadow-sm">
                    <h2 className="text-[20px] font-bold text-gray-900 mb-2">Send Message to Agent</h2>
                    <p className="text-sm text-gray-500 mb-6">Can't find what you need in the FAQs? Submit a custom inquiry below.</p>
                    
                    {contactSuccess ? (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-[20px] p-8 text-center text-emerald-800">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold">Inquiry Sent Successfully!</h3>
                        <p className="text-sm text-emerald-600 mt-1">Our support desk is handling your request and will email you updates soon.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-700 block mb-2">Your Name</label>
                            <input 
                              type="text" 
                              required
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#ECECF1] rounded-xl text-[14px] focus:outline-none focus:border-red-300"
                              placeholder="John Doe" 
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-700 block mb-2">Email Address</label>
                            <input 
                              type="email" 
                              required
                              value={contactEmail}
                              onChange={(e) => setContactEmail(e.target.value)}
                              className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#ECECF1] rounded-xl text-[14px] focus:outline-none focus:border-red-300"
                              placeholder="john@eventhub360.com" 
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-2">Message</label>
                          <textarea 
                            rows={5}
                            required
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#ECECF1] rounded-xl text-[14px] focus:outline-none focus:border-red-300 resize-none"
                            placeholder="Explain details of what you need help with..."
                          />
                        </div>
                        <button 
                          type="submit" 
                          className="w-full py-3.5 bg-gradient-to-r from-red-700 to-orange-400 text-white rounded-xl font-bold text-[14px] shadow-sm hover:shadow-md transition-all"
                        >
                          Submit Inquiry
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Right panel: Downloads & Contact Details */}
                  <div className="space-y-6">
                    {/* Downloads Card */}
                    <div className="bg-white rounded-[24px] p-6 border border-[#ECECF1] shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-600" />
                        Resources
                      </h3>
                      <div className="space-y-3">
                        <a 
                          href="#"
                          onClick={(e) => { e.preventDefault(); showToast('Downloading EventHub360 User Manual PDF...', 'info'); }}
                          className="flex items-center justify-between p-3 bg-[#F8F9FC] hover:bg-red-50/50 rounded-xl transition-all border border-[#ECECF1]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center font-bold text-[10px] text-red-700">PDF</div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">User Manual v1.0</p>
                              <p className="text-[10px] text-gray-400">12.4 MB • Complete Guide</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </a>
                        <a 
                          href="#"
                          onClick={(e) => { e.preventDefault(); showToast('Downloading Developer Integration APIs Document...', 'info'); }}
                          className="flex items-center justify-between p-3 bg-[#F8F9FC] hover:bg-red-50/50 rounded-xl transition-all border border-[#ECECF1]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center font-bold text-[10px] text-purple-700">DOC</div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">API Documentation</p>
                              <p className="text-[10px] text-gray-400">4.1 MB • SDK Integration</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </a>
                      </div>
                    </div>

                    {/* Direct Contact Card */}
                    <div className="bg-[#FFF5F5] rounded-[24px] p-6 border border-red-100 shadow-sm space-y-4">
                      <h3 className="text-lg font-bold text-red-900">Immediate Escalation</h3>
                      <p className="text-xs leading-relaxed text-red-700/80">Need to speak with an engineer immediately? Contact our emergency system operations desk.</p>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 text-red-900">
                          <Phone className="w-4.5 h-4.5 text-red-600" />
                          <span className="text-xs font-bold">+91 1800-419-3600</span>
                        </div>
                        <div className="flex items-center gap-3 text-red-900">
                          <Mail className="w-4.5 h-4.5 text-red-600" />
                          <span className="text-xs font-bold">ops-support@eventhub360.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* CREATE TICKET MODAL */}
          {showCreateTicketModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
              <div className="bg-white rounded-[24px] w-full max-w-[550px] p-8 shadow-2xl border border-[#ECECF1] relative animate-in fade-in zoom-in-95 duration-200">
                <button 
                  onClick={() => setShowCreateTicketModal(false)}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-[20px] font-bold text-gray-900 mb-6">Open Support Ticket</h3>

                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">Subject</label>
                    <input 
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="Summary of the issue..."
                      className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#ECECF1] rounded-xl text-[14px] focus:outline-none focus:border-red-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-2">Category</label>
                      <select 
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#ECECF1] rounded-xl text-[14px] focus:outline-none focus:border-red-300"
                      >
                        <option>Quotation Builder</option>
                        <option>Price Book</option>
                        <option>Settings</option>
                        <option>Proposal Canvas</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-2">Priority</label>
                      <select 
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value as any)}
                        className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#ECECF1] rounded-xl text-[14px] focus:outline-none focus:border-red-300"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">Detailed Description</label>
                    <textarea 
                      rows={4}
                      required
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      placeholder="Step-by-step detail of error..."
                      className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#ECECF1] rounded-xl text-[14px] focus:outline-none focus:border-red-300 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowCreateTicketModal(false)}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-[14px] transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-red-700 to-orange-400 text-white font-bold rounded-xl text-[14px] shadow-sm hover:shadow-md transition-all"
                    >
                      Submit Ticket
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CHAT DRAWER FOR TICKET */}
          {selectedTicket && (
            <div className="fixed inset-y-0 right-0 z-50 w-[450px] bg-white shadow-2xl border-l border-[#ECECF1] flex flex-col animate-in slide-in-from-right duration-300">
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#ECECF1] flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 font-bold tracking-widest">{selectedTicket.id}</span>
                  <h3 className="text-md font-bold text-gray-900 mt-1 max-w-[320px] truncate">{selectedTicket.subject}</h3>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                {selectedTicket.messages.map((m, idx) => {
                  const isUser = m.sender === 'user';
                  return (
                    <div key={idx} className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-red-700 text-white' : 'bg-purple-100 text-purple-700'}`}>
                        {isUser ? <User className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-800">{m.senderName}</span>
                          <span className="text-[10px] text-gray-400">{m.timestamp}</span>
                        </div>
                        <div className={`p-3.5 rounded-[18px] text-[13px] leading-relaxed shadow-sm ${
                          isUser ? 'bg-red-700 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-[#ECECF1]'
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-[#ECECF1] bg-white">
                <div className="relative">
                  <input 
                    type="text" 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type reply to support agent..."
                    className="w-full pl-4 pr-12 py-3.5 bg-[#F8F9FC] border border-[#ECECF1] rounded-full text-[13px] text-gray-900 focus:outline-none focus:border-red-300"
                  />
                  <button 
                    type="submit"
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-red-700 to-orange-400 flex items-center justify-center text-white absolute right-2 top-1/2 -translate-y-1/2 shadow-sm hover:shadow-md hover:scale-105 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default SupportCenter;
