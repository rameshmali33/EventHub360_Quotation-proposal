import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Bell } from 'lucide-react';
import NotificationDrawer from './NotificationDrawer';

const WizardNavbar = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    firstName: localStorage.getItem('user_first_name') || 'Ramesh',
    lastName: localStorage.getItem('user_last_name') || 'Mali',
    avatarUrl: localStorage.getItem('user_avatar_url') || '',
    role: localStorage.getItem('user_role') || 'Team Member',
  });
  const [hasUnread, setHasUnread] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  useEffect(() => {
    const refreshProfile = () => {
      setProfile({
        firstName: localStorage.getItem('user_first_name') || 'Ramesh',
        lastName: localStorage.getItem('user_last_name') || 'Mali',
        avatarUrl: localStorage.getItem('user_avatar_url') || '',
        role: localStorage.getItem('user_role') || 'Team Member',
      });
    };

    const checkUnread = () => {
      try {
        const saved = localStorage.getItem('system_notifications');
        const list = saved ? JSON.parse(saved) : [];
        setHasUnread(list.some((n: any) => n.unread));
      } catch {
        setHasUnread(false);
      }
    };

    refreshProfile();
    checkUnread();
    window.addEventListener('storage', checkUnread);
    window.addEventListener('profile-updated', refreshProfile);

    return () => {
      window.removeEventListener('storage', checkUnread);
      window.removeEventListener('profile-updated', refreshProfile);
    };
  }, []);

  const initials = `${profile.firstName[0] || 'R'}${profile.lastName[0] || 'M'}`.toUpperCase();

  return (
    <div className="h-[72px] bg-white border-b border-[#ECECF1] px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center">
        <h1 className="text-xl font-bold tracking-tight text-[#B3262E]">
          EventHub360
        </h1>
        <div className="w-px h-6 bg-gray-200 mx-6"></div>
        <h2 className="text-[15px] font-semibold text-gray-700">
          Quotation Management
        </h2>
      </div>

      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => navigate('/support')}
          className="text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Open support center"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setNotificationDrawerOpen(true)}
          className="relative text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Open notifications"
        >
          <Bell className="w-5 h-5" />
          {hasUnread && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="ml-2 flex items-center gap-3 rounded-full pl-2 pr-1 py-1 hover:bg-gray-50 transition-colors"
          aria-label="Open profile"
        >
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-gray-900 leading-tight">{profile.firstName} {profile.lastName}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{profile.role}</p>
          </div>
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={`${profile.firstName} ${profile.lastName}`}
              className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-[13px] border border-red-200 shadow-sm shrink-0">
              {initials}
            </div>
          )}
        </button>
      </div>
      <NotificationDrawer open={notificationDrawerOpen} onClose={() => setNotificationDrawerOpen(false)} />
    </div>
  );
};

export default WizardNavbar;
