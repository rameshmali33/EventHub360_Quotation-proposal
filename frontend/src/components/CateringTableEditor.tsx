import React, { useState } from 'react';
import { Trash2, PlusCircle, Check } from 'lucide-react';

interface CateringTableEditorProps {
  items: any[];
  onAdd: (defaultVals?: { description: string; qty: number; price: number }) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, field: string, value: any) => void;
  onPackageSelect: (pkgName: string) => void;
  activePackage: string;
}

const CATERING_SUGGESTIONS = [
  'Welcome Drink',
  'Breakfast Buffet',
  'Lunch Buffet',
  'Dinner Buffet',
  'High Tea',
  'Paneer Tikka',
  'Veg Starter',
  'Non-Veg Starter',
  'Soup',
  'Main Course',
  'Dessert',
  'Ice Cream',
  'Mocktail Counter',
  'Live Pasta Counter',
  'Live Pizza Counter',
  'Chocolate Fountain',
  'Coffee Station'
];

const QUICK_ADD_ITEMS = [
  'Live Counter',
  'Extra Dessert',
  'Extra Snacks',
  'Welcome Drink',
  'Staff Meals',
  'VIP Menu',
  'Special Requests'
];

const CateringTableEditor: React.FC<CateringTableEditorProps> = ({
  items,
  onAdd,
  onDelete,
  onUpdate,
  onPackageSelect,
  activePackage
}) => {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  const getEditorGuestCount = () => {
    const item = items.find((i: any) => Number(i.qty) > 1);
    return item ? Number(item.qty) : 150;
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-red-50/10 p-5 rounded-[20px] border border-red-100">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Catering Package:</span>
          <select 
            value={activePackage}
            onChange={(e) => onPackageSelect(e.target.value)}
            className="h-10 px-4 bg-white border border-gray-200 rounded-[12px] text-[14px] font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all cursor-pointer"
          >
            <option value="custom">Custom (No Package)</option>
            <option value="silver">Silver Package (₹600/Guest)</option>
            <option value="gold">Gold Package (₹1,200/Guest)</option>
            <option value="platinum">Platinum Package (₹2,000/Guest)</option>
          </select>
        </div>
        
        {activePackage !== 'custom' ? (
          <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            ✓ {activePackage.toUpperCase()} items applied to table
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-gray-400">
            Select a package to populate buffet and drink lines automatically.
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#ECECF1]">
              <th className="py-3 pr-4 text-[12px] font-bold text-gray-500 uppercase tracking-widest w-[40%]">Catering Item</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-widest w-[15%] text-right">Guests/Qty</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-widest w-[15%] text-right">Price per Guest (₹)</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-widest w-[15%] text-right">Discount (%)</th>
              <th className="py-3 pl-4 text-[12px] font-bold text-gray-500 uppercase tracking-widest text-right">Total</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => {
              const qty = Number(item.qty) || 0;
              const price = Number(item.price) || 0;
              const discount = Number(item.discount) || 0;
              const total = (qty * price) * (1 - discount / 100);

              // Filter autocomplete list based on text input
              const filteredSuggestions = CATERING_SUGGESTIONS.filter(name =>
                name.toLowerCase().includes(filterText.toLowerCase())
              );

              return (
                <tr key={item.id} className="border-b border-[#ECECF1] hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 pr-4 relative">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={(e) => {
                          onUpdate(item.id, 'description', e.target.value);
                          setFilterText(e.target.value);
                        }}
                        onFocus={() => {
                          setActiveDropdownId(item.id);
                          setFilterText(item.description || '');
                        }}
                        className="w-full h-9 px-3 bg-transparent border border-transparent hover:border-gray-200 focus:border-red-400 focus:bg-white rounded-[8px] focus:outline-none text-[14px] font-medium text-gray-900 transition-all"
                        placeholder="Select or enter catering item..."
                      />
                      
                      {activeDropdownId === item.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-20 cursor-default" 
                            onClick={() => setActiveDropdownId(null)}
                          />
                          <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-30 py-1 border border-[#ECECF1]">
                            {filteredSuggestions.map((name) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => {
                                  onUpdate(item.id, 'description', name);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-red-50/50 text-[13px] font-semibold text-gray-700 hover:text-red-700 transition-colors flex items-center justify-between"
                              >
                                <span>{name}</span>
                                {item.description === name && <Check className="w-4 h-4 text-red-600" />}
                              </button>
                            ))}
                            {filteredSuggestions.length === 0 && filterText.trim() !== '' && (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdate(item.id, 'description', filterText);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-red-50/50 text-[13px] font-bold text-red-600 italic transition-colors"
                              >
                                Use custom: "{filterText}"
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex justify-end">
                      <input 
                        type="number" 
                        min="0"
                        value={item.qty}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          onUpdate(item.id, 'qty', val);
                        }}
                        className="w-[75px] h-9 text-right px-2 bg-gray-50 border border-gray-200 rounded-[8px] text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all"
                      />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-gray-500 font-medium">₹</span>
                      <input 
                        type="number" 
                        min="0"
                        value={item.price}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          onUpdate(item.id, 'price', val);
                        }}
                        className="w-[90px] h-9 text-right px-2 bg-gray-50 border border-gray-200 rounded-[8px] text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all"
                      />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end">
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={item.discount}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.min(100, Math.max(0, Number(e.target.value)));
                          onUpdate(item.id, 'discount', val);
                        }}
                        className="w-[60px] h-9 text-right px-2 bg-gray-50 border border-gray-200 rounded-[8px] text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all"
                      />
                    </div>
                  </td>
                  
                  <td className="py-4 pl-4 text-right">
                    <span className="text-[15px] font-bold text-gray-900">
                      ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4 mb-2 bg-[#F8F9FC] p-3.5 rounded-[16px] border border-dashed border-gray-200">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-2">Quick Add Catering Service:</span>
        {QUICK_ADD_ITEMS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => {
              onAdd({ description: name, qty: getEditorGuestCount(), price: 0 });
            }}
            className="text-[11px] font-bold text-gray-600 hover:text-red-700 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-full transition-colors shadow-sm"
          >
            + {name}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <button 
          onClick={() => onAdd()}
          className="flex items-center gap-2 text-[14px] font-bold text-red-600 hover:text-red-700 transition-colors py-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Custom Line Item
        </button>
      </div>
    </div>
  );
};

export default CateringTableEditor;
