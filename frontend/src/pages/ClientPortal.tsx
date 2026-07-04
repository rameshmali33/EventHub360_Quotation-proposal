
import { FileCheck2, ShieldCheck } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const ClientPortal = () => (
  <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
    <Sidebar />
    <main className="ml-[260px] flex min-h-screen flex-1 flex-col">
      <header className="h-[72px] border-b border-[#ECECF1] bg-white px-8 flex items-center">
        <h1 className="text-[20px] font-bold text-red-700">Client Portal</h1>
      </header>
      <div className="flex-1 p-8">
        <div className="mx-auto max-w-[960px]">
          <div className="mb-8">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-red-600">EventHub360</p>
            <h2 className="mt-2 text-[30px] font-extrabold text-gray-950">Your proposals</h2>
            <p className="mt-2 text-[14px] font-medium text-gray-500">Secure event proposals assigned to your account appear here.</p>
          </div>
          <div className="rounded-lg border border-[#E5E7EC] bg-white px-8 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <FileCheck2 className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-[18px] font-extrabold text-gray-900">No proposals assigned</h3>
            <p className="mx-auto mt-2 max-w-md text-[13px] font-medium text-gray-500">
              Your event manager will send a secure proposal link when the quotation is approved and ready.
            </p>
            <div className="mt-7 flex items-center justify-center gap-2 text-[12px] font-bold text-emerald-700">
              <ShieldCheck className="h-4 w-4" /> Secure client access
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default ClientPortal;