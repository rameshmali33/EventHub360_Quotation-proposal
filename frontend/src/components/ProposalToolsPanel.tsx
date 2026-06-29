import React, { useState } from 'react';
import { Palette, Type, Droplet, LayoutTemplate, Image as ImageIcon, ChevronRight, X, AlertCircle } from 'lucide-react';

const tools = [
  { icon: Palette, label: 'Theme' },
  { icon: Type, label: 'Typography' },
  { icon: Droplet, label: 'Colors' },
  { icon: LayoutTemplate, label: 'Layout' },
  { icon: ImageIcon, label: 'Media' },
];

const ProposalToolsPanel = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#ECECF1] mb-6 relative">
      <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">
        Design Tools
      </h3>
      <div className="space-y-1">
        {tools.map((tool: any, idx: any) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.label;
          return (
            <button 
              key={idx} 
              onClick={() => setActiveTool(tool.label)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors group ${
                isActive 
                  ? 'bg-red-50 text-red-700' 
                  : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-red-600' : 'text-gray-500 group-hover:text-red-600'}`} />
                <span className={`text-[14px] font-semibold transition-colors ${isActive ? 'text-red-700' : 'group-hover:text-gray-900'}`}>
                  {tool.label}
                </span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-colors ${isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
            </button>
          );
        })}
      </div>

      {/* Slide-over Settings Modal/Overlay */}
      {activeTool && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[28px] w-full max-w-[420px] shadow-2xl overflow-hidden border border-[#ECECF1] animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 border-b border-[#ECECF1] flex items-center justify-between">
              <h3 className="text-[20px] font-bold text-gray-950 flex items-center gap-2">
                {activeTool} Settings
              </h3>
              <button 
                onClick={() => setActiveTool(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <p className="text-[14px] font-medium text-gray-500 leading-relaxed">
                Configure global {activeTool.toLowerCase()} profiles to update the proposal's theme layer.
              </p>

              {activeTool === 'Theme' && (
                <div className="grid grid-cols-2 gap-3">
                  {['Classic Gold', 'Modern Slate', 'Blushing Pink', 'Forest Luxe'].map((themeName) => (
                    <button key={themeName} className="p-3 border border-gray-200 rounded-xl text-[13px] font-bold hover:border-red-400 hover:bg-red-50/20 text-gray-700 transition-all text-left">
                      {themeName}
                    </button>
                  ))}
                </div>
              )}

              {activeTool === 'Typography' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[12px] font-bold text-gray-400 uppercase">Primary Font</label>
                    <select className="w-full mt-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
                      <option>Playfair Display (Serif)</option>
                      <option>Inter (Sans-Serif)</option>
                      <option>Montserrat (Sans-Serif)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-gray-400 uppercase">Base Size</label>
                    <input type="range" min="12" max="20" defaultValue="16" className="w-full accent-red-600 mt-2" />
                  </div>
                </div>
              )}

              {activeTool === 'Colors' && (
                <div className="flex gap-3">
                  {['#B3262E', '#E0A96D', '#201E20', '#D1C4E9', '#81C784'].map((color) => (
                    <button key={color} className="w-10 h-10 rounded-full border border-white ring-2 ring-gray-100 cursor-pointer shadow-sm hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                  ))}
                </div>
              )}

              {activeTool === 'Layout' && (
                <div className="space-y-3">
                  {['Standard Single Column', 'Two-column Grid', 'Magazine Spread'].map((layoutOption) => (
                    <button key={layoutOption} className="w-full p-3 border border-gray-200 rounded-xl text-[13px] font-bold hover:border-red-400 text-gray-700 text-left transition-all">
                      {layoutOption}
                    </button>
                  ))}
                </div>
              )}

              {activeTool === 'Media' && (
                <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-[13px] font-bold text-gray-400">Drag and drop assets here</span>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-[13px] font-semibold text-amber-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Feature under development / Coming soon</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#ECECF1] bg-gray-50 flex justify-end">
              <button 
                onClick={() => setActiveTool(null)}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-full font-bold text-[13px] hover:bg-gray-800 transition-colors"
              >
                Apply (Demo)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalToolsPanel;
