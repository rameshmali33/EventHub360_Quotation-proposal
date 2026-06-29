import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Sparkles, Send, Settings, CheckCircle2, Loader2, ArrowRight
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const IMPORTED_TEMPLATES_KEY = 'imported_proposal_templates';

const quickPrompts = [
  {
    label: 'Luxury Wedding',
    category: 'Luxury Weddings',
    prompt: 'Create a premium proposal template for a luxury wedding with venue styling, floral decor, hospitality, food experience, pricing, and signature approval.'
  },
  {
    label: 'Corporate Gala',
    category: 'Corporate Galas',
    prompt: 'Create a polished proposal template for a corporate gala with event objectives, stage setup, branding, entertainment, catering, logistics, pricing, and approvals.'
  },
  {
    label: 'Hotel Partnership',
    category: 'Hotel Partnerships',
    prompt: 'Create a refined proposal template for a hotel partnership event with venue benefits, package inclusions, service levels, seasonal pricing, and agreement terms.'
  }
];

const buildGeneratedTemplate = (prompt: string, tone: string, length: string, category: string) => {
  const normalizedPrompt = prompt.trim();
  const titleSource = normalizedPrompt
    .replace(/^create\s+(a|an)\s+/i, '')
    .replace(/\s+/g, ' ')
    .slice(0, 72);
  const title = titleSource
    ? titleSource.charAt(0).toUpperCase() + titleSource.slice(1)
    : `${category.replace(/s$/, '')} Proposal Template`;

  const sections = [
    'Cover Page',
    'Client Welcome',
    'Event Vision',
    'Experience Highlights',
    'Scope of Services',
    'Pricing Breakdown',
    'Terms & Conditions',
    'Digital Signature'
  ];

  if (length.includes('3-4')) sections.splice(3, 2);
  if (length.includes('8-10')) sections.splice(5, 0, 'Moodboard & Styling', 'Execution Timeline');

  return {
    id: `ai-${Date.now()}`,
    title,
    badge: 'AI Generated',
    image: '',
    uses: 0,
    rating: 'New',
    trending: true,
    category,
    prompt: normalizedPrompt,
    tone,
    length,
    sections,
    fileName: `${title}.ai-template`,
    importedAt: new Date().toISOString(),
  };
};

const AITemplateGenerator = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('Professional & Elegant');
  const [length, setLength] = useState('Comprehensive (8-10 pgs)');
  const [category, setCategory] = useState('Custom');
  const [generatedTemplateId, setGeneratedTemplateId] = useState('');

  const handleGenerate = () => {
    if (!prompt.trim()) {
      showToast('Please describe the template you want to generate.', 'error');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const generatedTemplate = buildGeneratedTemplate(prompt, tone, length, category);
      const saved = localStorage.getItem(IMPORTED_TEMPLATES_KEY);
      const existingTemplates = saved ? JSON.parse(saved) : [];
      localStorage.setItem(IMPORTED_TEMPLATES_KEY, JSON.stringify([generatedTemplate, ...existingTemplates]));

      setGeneratedTemplateId(generatedTemplate.id);
      setIsGenerating(false);
      setIsDone(true);
    }, 900);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={() => navigate(-1)}></div>
      
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[600px]">
        
        {/* HEADER */}
        <div className="p-6 border-b border-[#ECECF1] flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-orange-400 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 leading-tight">AI Template Generator</h2>
              <p className="text-[12px] text-gray-600 font-medium">Instantly build a custom template using AI</p>
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-900 transition-colors w-8 h-8 rounded-full flex items-center justify-center bg-white border border-[#ECECF1] shadow-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {isDone ? (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-[28px] font-bold text-gray-900 mb-2">Template Generated!</h3>
              <p className="text-gray-500 mb-8 max-w-sm">The AI has successfully built a custom template based on your prompt.</p>
              
              <button 
                onClick={() => navigate(`/templates/${generatedTemplateId}/edit`)}
                className="px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-[15px] hover:shadow-lg transition-shadow flex items-center gap-2"
              >
                Open in Builder <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-red-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-red-500">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <h3 className="text-[24px] font-bold text-gray-900 mb-2">Generating Template...</h3>
              <p className="text-gray-500 max-w-sm">Crafting custom layouts, sections, and brand copy based on your prompt.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <label className="text-[13px] font-bold text-gray-900 block mb-3 uppercase tracking-widest">Describe your need</label>
                <div className="relative">
                  <textarea 
                    rows={4} 
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="e.g., Create a premium proposal template for a high-end destination wedding in Santorini, focused on luxury gastronomy and exclusive decor..."
                    className="w-full bg-[#F8F9FC] border border-[#ECECF1] rounded-[20px] p-5 text-[15px] focus:outline-none focus:border-red-300 resize-none text-gray-900 leading-relaxed"
                  ></textarea>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[13px] font-bold text-gray-900 uppercase tracking-widest">Quick Prompts</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setPrompt(item.prompt);
                        setCategory(item.category);
                      }}
                      className="px-4 py-2 bg-white border border-[#ECECF1] rounded-full text-[13px] font-semibold text-gray-600 hover:border-red-300 hover:text-red-700 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#ECECF1]">
                <div>
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Category</label>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="w-full bg-white border border-[#ECECF1] rounded-[12px] p-3 text-[14px] font-semibold text-gray-700 focus:outline-none"
                  >
                    <option>Custom</option>
                    <option>Luxury Weddings</option>
                    <option>Corporate Galas</option>
                    <option>Hotel Partnerships</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Tone</label>
                  <select
                    value={tone}
                    onChange={(event) => setTone(event.target.value)}
                    className="w-full bg-white border border-[#ECECF1] rounded-[12px] p-3 text-[14px] font-semibold text-gray-700 focus:outline-none"
                  >
                    <option>Professional & Elegant</option>
                    <option>Modern & Edgy</option>
                    <option>Warm & Welcoming</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Length</label>
                  <select
                    value={length}
                    onChange={(event) => setLength(event.target.value)}
                    className="w-full bg-white border border-[#ECECF1] rounded-[12px] p-3 text-[14px] font-semibold text-gray-700 focus:outline-none"
                  >
                    <option>Comprehensive (8-10 pgs)</option>
                    <option>Standard (5-7 pgs)</option>
                    <option>Brief (3-4 pgs)</option>
                  </select>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* FOOTER */}
        {!isDone && !isGenerating && (
          <div className="p-6 border-t border-[#ECECF1] bg-white shrink-0 flex items-center justify-between">
            <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold text-[14px] transition-colors">
              <Settings className="w-4 h-4" /> Advanced Settings
            </button>
            <button 
              onClick={handleGenerate}
              className="px-8 py-3.5 bg-gradient-to-r from-red-700 to-orange-400 text-white rounded-full font-bold text-[15px] hover:shadow-lg transition-shadow flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate Template
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AITemplateGenerator;
