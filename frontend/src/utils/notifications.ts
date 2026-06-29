export type SystemNotificationType = 'approval' | 'mention' | 'client' | 'system';

export interface SystemNotificationInput {
  title: string;
  desc: string;
  type?: SystemNotificationType;
  color?: string;
}

const NOTIFICATION_KEY = 'system_notifications';

const getRelativeTime = () => 'Just now';

const inferType = (title: string, desc: string): SystemNotificationType => {
  const text = `${title} ${desc}`.toLowerCase();
  if (text.includes('approval') || text.includes('approved') || text.includes('rejected')) return 'approval';
  if (text.includes('client') || text.includes('proposal sent')) return 'client';
  if (text.includes('comment') || text.includes('mention')) return 'mention';
  return 'system';
};

const getColor = (type: SystemNotificationType, title: string) => {
  const text = title.toLowerCase();
  if (text.includes('failed') || text.includes('error')) return 'bg-red-50 text-red-600';
  if (type === 'approval') return 'bg-indigo-50 text-indigo-600';
  if (type === 'client') return 'bg-emerald-50 text-emerald-600';
  if (type === 'mention') return 'bg-blue-50 text-blue-600';
  return 'bg-amber-50 text-amber-600';
};

export const addSystemNotification = ({ title, desc, type, color }: SystemNotificationInput) => {
  try {
    const current = localStorage.getItem(NOTIFICATION_KEY);
    const existing = current ? JSON.parse(current) : [];
    const resolvedType = type || inferType(title, desc);
    const notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      desc,
      time: getRelativeTime(),
      type: resolvedType,
      unread: true,
      color: color || getColor(resolvedType, title),
    };
    const updated = [notification, ...existing].slice(0, 50);
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('system-notification-created', { detail: notification }));
  } catch {
    // Notification persistence should never block the primary action.
  }
};
