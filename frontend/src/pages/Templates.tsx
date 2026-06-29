import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Files, LayoutTemplate, CheckSquare, Users, 
  Settings, HelpCircle, Bell, History as HistoryIcon, Printer, Plus,
  TrendingUp, Star, MoreVertical, Sparkles, Upload, Edit3, Trash2, CalendarDays
} from 'lucide-react';
import CurrentUserAvatar, { getCurrentUserProfile } from '../components/CurrentUserAvatar';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToast } from '../context/ToastContext';

const IMPORTED_TEMPLATES_KEY = 'imported_proposal_templates';

const getFileBadge = (file: File) => {
  const extension = file.name.split('.').pop()?.toUpperCase();
  return extension || 'FILE';
};

const Templates = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const currentUser = getCurrentUserProfile();
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All Templates');
  const [openTemplateMenuId, setOpenTemplateMenuId] = useState<string | null>(null);
  const [templatePendingDelete, setTemplatePendingDelete] = useState<any | null>(null);

  const sidebarNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'Quotations', path: '/quotations' },
    { icon: Files, label: 'Proposals', path: '/proposals' },
    { icon: FileText, label: 'Price Book', path: '/price-book' },
    { icon: LayoutTemplate, label: 'Templates', path: '/templates', active: true },
    { icon: CheckSquare, label: 'Approvals', path: '/quotations/approval-workbench' },
  ];

  const categories = [
    'All Templates',
    'Luxury Weddings',
    'Corporate Galas',
    'Hotel Partnerships',
    'Custom'
  ];

  useEffect(() => {
    const saved = localStorage.getItem(IMPORTED_TEMPLATES_KEY);
    if (saved) {
      setTemplates(JSON.parse(saved));
    }
  }, []);

  const saveTemplates = (nextTemplates: any[]) => {
    localStorage.setItem(IMPORTED_TEMPLATES_KEY, JSON.stringify(nextTemplates));
    setTemplates(nextTemplates);
  };

  const confirmDeleteTemplate = () => {
    if (!templatePendingDelete) return;
    saveTemplates(templates.filter((item) => item.id !== templatePendingDelete.id));
    setOpenTemplateMenuId(null);
    showToast('Template deleted successfully.', 'success');
    setTemplatePendingDelete(null);
  };

  const handleImportTemplate = (file?: File) => {
    if (!file) return;

    const allowedTypes = [
      'application/json',
      'text/html',
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/webp'
    ];

    const isAllowedExtension = /\.(json|html|txt|pdf|docx|png|jpe?g|webp)$/i.test(file.name);
    if (!allowedTypes.includes(file.type) && !isAllowedExtension) {
      showToast('Please import a JSON, HTML, TXT, PDF, DOCX, PNG, JPG, or WEBP template file.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Template file must be smaller than 5 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const isImage = file.type.startsWith('image/');
      const imported = {
        id: `imported-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        badge: `Imported ${getFileBadge(file)}`,
        image: isImage ? String(reader.result || '') : '',
        uses: 0,
        rating: 'New',
        trending: false,
        fileName: file.name,
        category: 'Custom',
        importedAt: new Date().toISOString(),
      };
      saveTemplates([imported, ...templates]);
      showToast('Template imported successfully.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const visibleTemplates = activeCategory === 'All Templates'
    ? templates
    : templates.filter((template) => template.category === activeCategory);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans relative overflow-hidden">
      
      {/* ========================================== */}
      {/* LEFT SIDEBAR */}
      {/* ========================================== */}
      <div className="w-[260px] bg-white h-screen fixed left-0 top-0 flex flex-col border-r border-[#ECECF1] z-10 shadow-[2px_0_8px_rgba(0,0,0,0.02)] hidden lg:flex">
        <div className="p-6 pb-8 border-b border-[#ECECF1]">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            <span className="text-red-700">Event</span>Hub360
          </h1>
          <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest">Enterprise Concierge</p>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarNavItems.map((item: any, index: any) => {
            const Icon = item.icon;
            const isActive = item.active;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center h-12 px-4 rounded-[14px] transition-all duration-200 group relative ${
                  isActive ? 'bg-[#F8F5FF] text-red-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-red-700' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className="text-[15px]">{item.label}</span>
                {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-700 rounded-l-full" />}
              </button>
            );
          })}
        </div>

        <div className="p-6 pt-4 border-t border-[#ECECF1] space-y-4">
          <div className="space-y-1">
            <button onClick={() => navigate('/settings')} className="w-full flex items-center h-10 px-4 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium">
              <Settings className="w-5 h-5 mr-3 text-gray-400" />
              <span className="text-[15px]">Settings</span>
            </button>
            <button onClick={() => navigate('/support')} className="w-full flex items-center h-10 px-4 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium">
              <HelpCircle className="w-5 h-5 mr-3 text-gray-400" />
              <span className="text-[15px]">Support</span>
            </button>
          </div>
          <div onClick={() => navigate('/profile')} className="mt-4 flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-[14px] transition-colors">
            <CurrentUserAvatar />
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">{currentUser.fullName}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================== */}
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        
        {/* TOP HEADER */}
        <div className="h-[72px] bg-white border-b border-[#ECECF1] px-8 flex items-center justify-between shrink-0">
          <div className="w-[200px]">
            <h2 className="text-[20px] font-bold text-red-700 tracking-tight leading-tight">
              Quotation<br/>Management
            </h2>
          </div>

          <div className="flex-1 flex items-center justify-center gap-8 h-full">
            <div className="flex items-center h-full gap-6">
              {[
                { label: 'All Quotes', path: '/quotations/master' },
                { label: 'Drafts', path: '/quotations/drafts' },
                { label: 'Pending Approval', path: '/quotations/approval-workbench' },
                { label: 'History', path: '/quotations/history-center' },
              ].map((tab: any, idx: any) => (
                <button
                  key={idx}
                  onClick={() => navigate(tab.path)}
                  className={`h-full flex items-center relative text-[15px] font-semibold transition-colors text-gray-600 hover:text-gray-900`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button onClick={() => navigate('/notifications')} className="relative text-gray-500 hover:text-gray-700 transition-colors" aria-label="Open notifications">
              <Bell className="w-[22px] h-[22px]" />
            </button>
            <button onClick={() => navigate('/activity-timeline')} className="relative text-gray-500 hover:text-gray-700 transition-colors" aria-label="Open activity timeline">
              <HistoryIcon className="w-[22px] h-[22px]" />
            </button>
            <button onClick={() => window.print()} className="relative text-gray-500 hover:text-gray-700 transition-colors" aria-label="Print page">
              <Printer className="w-[22px] h-[22px]" />
            </button>
            <div className="w-px h-8 bg-gray-200 mx-2"></div>
            <button 
              onClick={() => navigate('/quotations/new')}
              className="h-[42px] px-6 flex items-center gap-2 bg-gradient-to-r from-red-700 to-orange-400 text-white rounded-full font-bold text-[14px] shadow-sm hover:shadow-md transition-all"
            >
              Create New
            </button>
          </div>
        </div>

        {/* SCROLLABLE MAIN */}
        <main className="flex-1 overflow-y-auto p-10 pb-24">
          <div className="max-w-[1200px] mx-auto">
            
            {/* PAGE HEADER */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <h1 className="text-[36px] font-bold text-gray-900 tracking-tight leading-tight mb-2">
                  Proposal Template Library
                </h1>
                <p className="text-[16px] font-medium text-gray-600">
                  Streamline your curation process with our collection of high-conversion event proposal designs.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 self-start md:self-auto shrink-0">
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".json,.html,.txt,.pdf,.docx,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={(event) => {
                    handleImportTemplate(event.target.files?.[0]);
                    if (importInputRef.current) importInputRef.current.value = '';
                  }}
                />
                <button 
                  onClick={() => importInputRef.current?.click()}
                  className="h-[46px] px-6 flex items-center gap-2 bg-white border border-[#ECECF1] text-gray-700 rounded-full font-bold text-[14px] hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  Import Template
                </button>
                <button 
                  onClick={() => navigate('/settings/event-types')}
                  className="h-[46px] px-6 flex items-center gap-2 bg-white border border-amber-200 text-amber-700 rounded-full font-bold text-[14px] hover:bg-amber-50 transition-colors shadow-sm"
                >
                  <CalendarDays className="w-4 h-4" />
                  Event Type Master
                </button>
                <button 
                  onClick={() => navigate('/templates/new')}
                  className="h-[46px] px-6 flex items-center gap-2 bg-white border border-red-200 text-red-700 rounded-full font-bold text-[14px] hover:bg-red-50 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create New Template
                </button>
              </div>
            </div>

            {/* CATEGORY TABS */}
            <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat: string, idx: any) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-[14px] font-bold whitespace-nowrap transition-colors ${
                    activeCategory === cat 
                      ? 'bg-gradient-to-r from-red-700 to-orange-400 text-white shadow-sm' 
                      : 'bg-white border border-[#ECECF1] text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* TEMPLATE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleTemplates.length === 0 && (
                <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 rounded-[24px] border border-[#ECECF1] bg-white p-8 text-center">
                  <LayoutTemplate className="mx-auto mb-4 h-10 w-10 text-red-500" />
                  <h3 className="text-[18px] font-bold text-gray-900">No templates in {activeCategory}</h3>
                  <p className="mt-2 text-[14px] font-medium text-gray-500">
                    Imported templates appear under Custom, and all templates appear under All Templates.
                  </p>
                </div>
              )}
              
              {/* NORMAL TEMPLATES */}
              {visibleTemplates.map((template: any) => (
                <div key={template.id} className="bg-white rounded-[28px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ECECF1] hover:shadow-md transition-shadow flex flex-col">
                  {/* Image Area */}
                  <div 
                    onClick={() => navigate(`/templates/${template.id}`)}
                    className="w-full aspect-[4/5] rounded-[20px] mb-4 relative overflow-hidden bg-gray-100 cursor-pointer group"
                  >
                    {template.image ? (
                      <img src={template.image} alt={template.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-50 to-orange-50 flex flex-col items-center justify-center text-center p-6">
                        <LayoutTemplate className="w-12 h-12 text-red-500 mb-4" />
                        <p className="text-[14px] font-bold text-gray-900 line-clamp-2">{template.fileName || template.title}</p>
                        <p className="text-[11px] font-semibold text-gray-500 mt-2">Imported template file</p>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-[11px] font-bold rounded-full shadow-sm">
                        {template.badge}
                      </span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="px-2 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <h3 
                        onClick={() => navigate(`/templates/${template.id}`)}
                        className="text-[18px] font-bold text-gray-900 leading-tight cursor-pointer hover:text-red-600 transition-colors"
                      >
                        {template.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        {template.trending && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                        <div className="relative">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenTemplateMenuId(openTemplateMenuId === template.id ? null : template.id);
                            }}
                            className="text-gray-400 hover:text-gray-900 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openTemplateMenuId === template.id && (
                            <div className="absolute right-0 top-7 z-20 w-36 overflow-hidden rounded-2xl border border-[#ECECF1] bg-white py-2 shadow-lg">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenTemplateMenuId(null);
                                  navigate(`/templates/${template.id}/edit`);
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50"
                              >
                                <Edit3 className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenTemplateMenuId(null);
                                  setTemplatePendingDelete(template);
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-bold text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mb-5">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div className="leading-tight">
                          <p className="text-[12px] font-bold text-gray-900">Used {template.uses}</p>
                          <p className="text-[11px] font-semibold text-gray-500">times</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                        <div className="leading-tight">
                          <p className="text-[12px] font-bold text-gray-900">{template.rating}</p>
                          <p className="text-[11px] font-semibold text-gray-500">Rating</p>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/templates/${template.id}/use`)}
                      className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-400 text-white rounded-xl font-bold text-[14px] hover:shadow-md transition-shadow mt-auto"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              ))}

              {/* CREATE CUSTOM CARD */}
              <div 
                onClick={() => navigate('/templates/custom')}
                className="bg-white rounded-[28px] p-6 border-2 border-dashed border-[#ECECF1] hover:border-red-300 hover:bg-red-50/30 transition-colors flex flex-col items-center justify-center text-center cursor-pointer min-h-[400px]"
              >
                <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-red-600 mb-6 border border-gray-100">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-[20px] font-bold text-gray-900 mb-3">Create<br/>Custom</h3>
                <p className="text-[13px] font-medium text-gray-500 px-4">
                  Start from a blank canvas or import your own design assets.
                </p>
              </div>

            </div>
          </div>
        </main>
        
        {/* FLOATING AI BUTTON */}
        <button 
          onClick={() => navigate('/templates/ai-generator')}
          className="fixed bottom-8 right-8 h-14 px-5 rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 z-50 group"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="text-[14px] font-bold whitespace-nowrap">AI Generator</span>
        </button>

      </div>
      <ConfirmationModal
        open={Boolean(templatePendingDelete)}
        title="Delete Template?"
        message={`This will remove "${templatePendingDelete?.title || 'this template'}" from your template library. You cannot undo this action.`}
        confirmLabel="Delete Template"
        onCancel={() => setTemplatePendingDelete(null)}
        onConfirm={confirmDeleteTemplate}
      />
    </div>
  );
};

export default Templates;



