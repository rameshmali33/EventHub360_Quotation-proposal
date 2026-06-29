import React from 'react';
import { Trash2, PlusCircle } from 'lucide-react';

const QuotationTableEditor = ({ items, onAdd, onDelete, onUpdate  }: any) => {
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#ECECF1]">
              <th className="py-3 pr-4 text-[12px] font-bold text-gray-500 uppercase tracking-widest w-[40%]">Description</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-widest w-[15%] text-right">Qty</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-widest w-[15%] text-right">Unit Price</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-widest w-[15%] text-right">Discount %</th>
              <th className="py-3 pl-4 text-[12px] font-bold text-gray-500 uppercase tracking-widest text-right">Total</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, index: any) => {
              const qty = Number(item.qty) || 0;
              const price = Number(item.price) || 0;
              const discount = Number(item.discount) || 0;
              const total = (qty * price) * (1 - discount / 100);
              return (
                <tr key={item.id} className="border-b border-[#ECECF1] hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 pr-4">
                    <input 
                      type="text" 
                      value={item.description}
                      onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                      className="w-full h-9 px-3 bg-transparent border border-transparent hover:border-gray-200 focus:border-red-400 focus:bg-white rounded-[8px] focus:outline-none text-[14px] font-medium text-gray-900 transition-all"
                      placeholder="Enter item description..."
                    />
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
      
      <div className="mt-4">
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 text-[14px] font-bold text-red-600 hover:text-red-700 transition-colors py-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Item
        </button>
      </div>
    </div>
  );
};

export default QuotationTableEditor;
