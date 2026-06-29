import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { 
  Bell, MessageSquare, AlertCircle, ExternalLink, 
  Check, CheckSquare, Trash2, Plus, Inbox
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'approval' | 'mention' | 'client' | 'system';
  unread: boolean;
  color: string;
}

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'approval' | 'mention'>('all');

  // Load from local storage
  useEffect(() => {
    const loadNotifications = () => {
      const saved = localStorage.getItem('system_notifications');
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        localStorage.setItem('system_notifications', JSON.stringify([]));
        setNotifications([]);
      }
    };

    loadNotifications();
    window.addEventListener('storage', loadNotifications);
    window.addEventListener('system-notification-created', loadNotifications as EventListener);
    return () => {
      window.removeEventListener('storage', loadNotifications);
      window.removeEventListener('system-notification-created', loadNotifications as EventListener);
    };
  }, []);

  const saveNotifications = (updated: Notification[]) => {
    localStorage.setItem('system_notifications', JSON.stringify(updated));
    setNotifications(updated);
    // Dispatch a storage event to update the TopHeader immediately
    window.dispatchEvent(new Event('storage'));
  };

  // Mark all as read
  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    saveNotifications(updated);
  };

  // Clear all
  const handleClearAll = () => {
    saveNotifications([]);
  };

  // Toggle read status
  const handleToggleRead = (id: string) => {
    const updated = notifications.map(n => {
      if (n.id === id) {
        return { ...n, unread: !n.unread };
      }
      return n;
    });
    saveNotifications(updated);
  };

  // Dismiss notification (delete)
  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  // Filter computations
  const unreadCount = notifications.filter(n => n.unread).length;
  
  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return n.unread;
    if (activeFilter === 'approval') return n.type === 'approval';
    if (activeFilter === 'mention') return n.type === 'mention';
    return true; // 'all'
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'approval': return CheckSquare;
      case 'mention': return MessageSquare;
      case 'client': return ExternalLink;
      default: return AlertCircle;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopHeader />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[800px] mx-auto space-y-6">
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Notifications</h1>
                  <p className="text-[15px] text-gray-500 mt-1">Stay updated on approvals, mentions, and client activity.</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <>
                    <button 
                      onClick={handleMarkAllRead}
                      className="px-4 py-2 bg-white border border-[#ECECF1] text-gray-700 hover:bg-gray-50 rounded-full font-bold text-[13px] transition-colors shadow-sm flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Mark All Read
                    </button>
                    <button 
                      onClick={handleClearAll}
                      className="px-4 py-2 bg-white border border-[#ECECF1] text-red-600 hover:bg-red-50 rounded-full font-bold text-[13px] transition-colors shadow-sm flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Clear All
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-[#ECECF1] overflow-hidden">
              {/* Filter Tabs */}
              <div className="p-4 border-b border-[#ECECF1] flex gap-2 overflow-x-auto scrollbar-hide bg-[#F8F9FC]">
                <button 
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-1.5 font-bold text-[13px] rounded-full transition-all ${
                    activeFilter === 'all' ? 'bg-white border border-[#ECECF1] text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-950'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button 
                  onClick={() => setActiveFilter('unread')}
                  className={`px-4 py-1.5 font-bold text-[13px] rounded-full transition-all ${
                    activeFilter === 'unread' ? 'bg-white border border-[#ECECF1] text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-950'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button 
                  onClick={() => setActiveFilter('approval')}
                  className={`px-4 py-1.5 font-bold text-[13px] rounded-full transition-all ${
                    activeFilter === 'approval' ? 'bg-white border border-[#ECECF1] text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-950'
                  }`}
                >
                  Approvals
                </button>
                <button 
                  onClick={() => setActiveFilter('mention')}
                  className={`px-4 py-1.5 font-bold text-[13px] rounded-full transition-all ${
                    activeFilter === 'mention' ? 'bg-white border border-[#ECECF1] text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-950'
                  }`}
                >
                  Mentions
                </button>
              </div>

              {/* Notification List */}
              <div className="divide-y divide-[#ECECF1]">
                {filteredNotifications.length === 0 ? (
                  <div className="p-16 text-center">
                    <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-[16px] font-bold text-gray-900">All caught up!</p>
                    <p className="text-gray-500 mt-1">There are no notifications matching this filter.</p>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => {
                    const IconComponent = getIcon(notif.type);
                    return (
                      <div 
                        key={notif.id} 
                        onClick={() => handleToggleRead(notif.id)}
                        className={`p-6 flex gap-4 transition-colors hover:bg-gray-50/50 cursor-pointer ${
                          notif.unread ? 'bg-[#F8F5FF]' : 'bg-white'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-[15px] ${notif.unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                              {notif.title}
                            </h4>
                            <span className="text-[12px] font-semibold text-gray-400">{notif.time}</span>
                          </div>
                          <p className={`text-[14px] ${notif.unread ? 'text-gray-700' : 'text-gray-500'}`}>{notif.desc}</p>
                          
                          {notif.type === 'approval' && (
                            <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => navigate('/quotations/approval-workbench')}
                                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-[12px] font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                              >
                                Review
                              </button>
                              <button 
                                onClick={(e) => handleDismiss(notif.id, e)}
                                className="px-4 py-1.5 bg-white border border-[#ECECF1] text-gray-700 rounded-lg text-[12px] font-bold hover:bg-gray-50 transition-colors"
                              >
                                Dismiss
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-center justify-between shrink-0 gap-2">
                          {notif.unread ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-red-600 mt-1"></div>
                          ) : (
                            <div className="w-2.5 h-2.5"></div>
                          )}
                          <button 
                            onClick={(e) => handleDismiss(notif.id, e)}
                            className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationCenter;

