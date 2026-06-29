import React, { useEffect, useState } from 'react';
import { AlertCircle, Bell, Check, CheckSquare, ExternalLink, Inbox, MessageSquare, Trash2, X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'approval' | 'mention' | 'client' | 'system';
  unread: boolean;
  color: string;
}

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

const getNotifications = (): Notification[] => {
  try {
    const saved = localStorage.getItem('system_notifications');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const getIcon = (type: Notification['type']) => {
  switch (type) {
    case 'approval':
      return CheckSquare;
    case 'mention':
      return MessageSquare;
    case 'client':
      return ExternalLink;
    default:
      return AlertCircle;
  }
};

const NotificationDrawer = ({ open, onClose }: NotificationDrawerProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const refreshNotifications = () => setNotifications(getNotifications());

    refreshNotifications();
    window.addEventListener('storage', refreshNotifications);
    return () => window.removeEventListener('storage', refreshNotifications);
  }, []);

  useEffect(() => {
    if (open) {
      setNotifications(getNotifications());
    }
  }, [open]);

  const saveNotifications = (updated: Notification[]) => {
    localStorage.setItem('system_notifications', JSON.stringify(updated));
    setNotifications(updated);
    window.dispatchEvent(new Event('storage'));
  };

  const unreadCount = notifications.filter(notification => notification.unread).length;

  const handleMarkAllRead = () => {
    saveNotifications(notifications.map(notification => ({ ...notification, unread: false })));
  };

  const handleDismiss = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    saveNotifications(notifications.filter(notification => notification.id !== id));
  };

  const handleToggleRead = (id: string) => {
    saveNotifications(notifications.map(notification => (
      notification.id === id
        ? { ...notification, unread: !notification.unread }
        : notification
    )));
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <button
        type="button"
        aria-label="Close notifications"
        onClick={onClose}
        className={`absolute inset-0 bg-gray-950/20 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-[420px] bg-white shadow-[-18px_0_45px_rgba(15,23,42,0.16)] transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-[72px] items-center justify-between border-b border-[#ECECF1] px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-700">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                <p className="text-xs font-semibold text-gray-500">{unreadCount} unread</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close notifications"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-between border-b border-[#ECECF1] px-6 py-3">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Recent activity</span>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 rounded-full border border-[#ECECF1] px-3 py-1.5 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Check className="h-3.5 w-3.5" />
                Mark read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-10 text-center">
                <Inbox className="mb-4 h-12 w-12 text-gray-300" />
                <p className="text-base font-bold text-gray-900">All caught up</p>
                <p className="mt-1 text-sm font-medium text-gray-500">New approvals, mentions, and client actions will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#ECECF1]">
                {notifications.map(notification => {
                  const Icon = getIcon(notification.type);

                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleToggleRead(notification.id)}
                      className={`flex w-full cursor-pointer gap-4 px-6 py-5 text-left transition-colors hover:bg-gray-50 ${
                        notification.unread ? 'bg-red-50/40' : 'bg-white'
                      }`}
                    >
                      <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${notification.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className={`text-sm leading-5 ${notification.unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <span className="shrink-0 text-[11px] font-semibold text-gray-400">{notification.time}</span>
                        </div>
                        <p className="mt-1 text-sm leading-5 text-gray-500">{notification.desc}</p>
                      </div>

                      <div className="flex shrink-0 flex-col items-center justify-between gap-3">
                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${notification.unread ? 'bg-red-600' : 'bg-transparent'}`} />
                        <button
                          type="button"
                          onClick={(event) => handleDismiss(notification.id, event)}
                          className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label="Dismiss notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default NotificationDrawer;
