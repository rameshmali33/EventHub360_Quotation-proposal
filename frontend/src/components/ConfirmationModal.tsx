import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

type ConfirmationModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmationModal = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  if (!open) return null;

  const isDanger = tone === 'danger';

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[420px] overflow-hidden rounded-[28px] border border-[#ECECF1] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4 border-b border-[#ECECF1] p-6">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              isDanger ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
            }`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold leading-tight text-gray-900">{title}</h2>
              <p className="mt-2 text-[14px] font-medium leading-6 text-gray-500">{message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 bg-gray-50 px-6 py-5">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-full border border-gray-200 bg-white px-5 text-[14px] font-bold text-gray-700 transition-colors hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-11 rounded-full px-6 text-[14px] font-bold text-white shadow-md transition-colors ${
              isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
