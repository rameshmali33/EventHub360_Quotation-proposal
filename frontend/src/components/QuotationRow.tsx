import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import CurrentUserAvatar from './CurrentUserAvatar';
import { Edit3, MoreVertical, Trash2 } from 'lucide-react';

const QuotationRow = ({ quotation, openMenuId, setOpenMenuId, onDelete  }: any) => {
  const navigate = useNavigate();
  const isMenuOpen = openMenuId === quotation.quotation_id;

  return (
    <tr 
      onClick={() => navigate(`/quotation-builder?id=${quotation.quotation_id}`)}
      className="h-[120px] border-b border-[#ECECF1] hover:bg-gray-50 cursor-pointer transition-colors group"
    >
      <td className="px-6 py-4">
        <span className="text-[15px] font-semibold text-red-600 group-hover:text-red-700 transition-colors">
          {quotation.quoteNumber}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${quotation.avatarBg} ${quotation.avatarText}`}>
            {quotation.initials}
          </div>
          <span className="text-[15px] font-semibold text-gray-900">{quotation.clientName}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-[14px] font-medium text-gray-600">{quotation.event}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-[14px] font-medium text-gray-600">{quotation.date}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-[15px] font-bold text-gray-900">{quotation.amount}</span>
      </td>
      <td className="px-6 py-4">
        <span className={`text-[15px] font-bold ${quotation.marginColor || 'text-gray-900'}`}>
          {quotation.margin}
        </span>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={quotation.status} />
      </td>
      <td className="px-6 py-4">
        <CurrentUserAvatar sizeClass="w-8 h-8" textClass="text-[11px]" />
      </td>
      <td className="px-6 py-4">
        <div className="relative flex justify-end">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setOpenMenuId(isMenuOpen ? null : quotation.quotation_id);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-10 z-30 w-44 overflow-hidden rounded-2xl border border-[#ECECF1] bg-white py-2 shadow-lg">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenMenuId(null);
                  navigate(`/quotation-builder?id=${quotation.quotation_id}`);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50"
              >
                <Edit3 className="h-4 w-4" />
                Edit Quotation
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenMenuId(null);
                  onDelete(quotation);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-bold text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete Quotation
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default QuotationRow;
