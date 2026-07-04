import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, History as ActivityIcon } from 'lucide-react';
import NotificationDrawer from './NotificationDrawer';
import { quotationService } from '../services/quotationService';
import { useAuth } from '../context/AuthContext';
import { canAccessPath } from '../utils/permissions';

interface TopHeaderProps {
  contextSearchValue?: string;
  onContextSearchChange?: (value: string) => void;
  contextSearchPlaceholder?: string;
}

const TopHeader: React.FC<TopHeaderProps> = ({
  contextSearchValue,
  onContextSearchChange,
  contextSearchPlaceholder = 'Search...',
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || 'Client';
  const [hasUnread, setHasUnread] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUnread = () => {
      try {
        const saved = localStorage.getItem('system_notifications');
        if (saved) {
          const list = JSON.parse(saved);
          setHasUnread(list.some((n: any) => n.unread));
        } else {
          setHasUnread(false);
        }
      } catch (e) {
        setHasUnread(false);
      }
    };


    checkUnread();
    window.addEventListener('storage', checkUnread);
    return () => {
      window.removeEventListener('storage', checkUnread);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmedSearch = searchTerm.trim();

    if (!trimmedSearch) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const res = await quotationService.getQuotations({
          search: trimmedSearch,
          limit: 6,
          sortBy: 'created_at',
          sortOrder: 'desc',
        });
        if (!cancelled) {
          setSearchResults(res.data || []);
          setSearchOpen(true);
        }
      } catch {
        if (!cancelled) {
          setSearchResults([]);
          setSearchOpen(true);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchTerm]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const firstResult = searchResults[0];

    if (firstResult?.quotation_id) {
      setSearchOpen(false);
      navigate(`/quotation-builder?id=${firstResult.quotation_id}`);
      return;
    }

    if (searchTerm.trim()) {
      navigate('/quotations');
    }
  };

  const tabs = [
    { label: 'All Quotes', path: '/quotations/master', active: true },
    { label: 'Drafts', path: '/quotations/drafts' },
    { label: 'Pending Approval', path: '/quotations/approval-workbench' },
    { label: 'History', path: '/quotations/history-center' },
  ];

  return (
    <div className="h-[72px] bg-white border-b border-[#ECECF1] px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
      <div className="w-[200px]">
        <h2 className="text-[20px] font-bold text-red-700 tracking-tight leading-tight cursor-pointer" onClick={() => navigate('/')}>
          Quotation<br/>Management
        </h2>
      </div>

      <div className="flex-1 flex items-center gap-8 h-full px-4">
        <div className="flex items-center h-full gap-6">
          {tabs.filter((tab) => canAccessPath(role, tab.path)).map((tab: any, idx: any) => (
            <button
              key={idx}
              onClick={() => navigate(tab.path)}
              className={`h-full flex items-center relative text-[15px] font-semibold transition-colors ${
                tab.active ? 'text-red-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.active && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {onContextSearchChange ? (
          <div className="relative ml-4 shrink-0">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={contextSearchValue || ''}
              onChange={(event) => onContextSearchChange(event.target.value)}
              placeholder={contextSearchPlaceholder}
              className="h-10 w-[280px] rounded-full border border-transparent bg-gray-50 pl-10 pr-4 text-sm transition-all placeholder:text-gray-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </div>
        ) : canAccessPath(role, '/quotations') && (
          <div ref={searchRef} className="relative ml-4">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => {
                  if (searchTerm.trim()) setSearchOpen(true);
                }}
                placeholder="Search quote or client..."
                className="w-[280px] h-10 pl-10 pr-4 bg-gray-50 border border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all placeholder:text-gray-400"
              />
            </form>

            {searchOpen && searchTerm.trim() && (
              <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-[#ECECF1] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
                {searchLoading ? (
                  <div className="px-4 py-3 text-sm font-semibold text-gray-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto py-2">
                    {searchResults.map((quote) => (
                      <button
                        key={quote.quotation_id}
                        type="button"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchTerm('');
                          navigate(`/quotation-builder?id=${quote.quotation_id}`);
                        }}
                        className="flex w-full flex-col px-4 py-3 text-left transition-colors hover:bg-gray-50"
                      >
                        <span className="text-sm font-bold text-gray-900">QTN-{String(quote.quotation_id).padStart(5, '0')}</span>
                        <span className="mt-0.5 text-xs font-semibold text-gray-500">{quote.lead?.name || `Lead #${quote.lead_id}`} - {quote.status}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm font-semibold text-gray-500">No matching quotations found.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        <button onClick={() => setNotificationDrawerOpen(true)} className="relative text-gray-500 hover:text-gray-700 transition-colors" aria-label="Open notifications">
          <Bell className="w-[22px] h-[22px]" />
          {hasUnread && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          )}
        </button>
        <button onClick={() => navigate('/activity-timeline')} className="relative text-gray-500 hover:text-gray-700 transition-colors">
          <ActivityIcon className="w-[22px] h-[22px]" />
        </button>
      </div>
      <NotificationDrawer open={notificationDrawerOpen} onClose={() => setNotificationDrawerOpen(false)} />
    </div>
  );
};

export default TopHeader;
