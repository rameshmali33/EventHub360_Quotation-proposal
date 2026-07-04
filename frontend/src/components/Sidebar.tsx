
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Files, LayoutTemplate, CheckSquare, Settings, HelpCircle, LogOut, BarChart3, UserRound, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { canAccessPath } from '../utils/permissions';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const role = user?.role || localStorage.getItem('user_role') || 'Client';

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'Quotations', path: '/quotations' },
    { icon: Files, label: 'Proposals', path: '/proposals' },
    { icon: FileText, label: 'Price Book', path: '/price-book' },
    { icon: LayoutTemplate, label: 'Templates', path: '/templates' },
    { icon: CheckSquare, label: 'Approvals', path: '/quotations/approval-workbench' },
    { icon: BarChart3, label: 'Margin Analysis', path: '/margin-analysis' },
    { icon: UserRound, label: 'Client Portal', path: '/client-portal' },
  ].filter((item) => canAccessPath(role, item.path));

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === '/quotations' && location.pathname.startsWith('/quotations') && !location.pathname.includes('approval')) ||
    (path.includes('approval') && location.pathname.includes('approval'));

  return (
    <aside className="w-[260px] bg-white h-screen fixed left-0 top-0 flex flex-col border-r border-[#ECECF1] z-10 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
      <div className="p-6 pb-8">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight"><span className="text-red-600">Event</span>Hub360</h1>
        <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">Enterprise Concierge</p>
      </div>
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path} className={'w-full flex items-center h-12 px-4 rounded-[14px] transition-all duration-200 group relative ' + (active ? 'bg-purple-50 text-red-600 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium')}>
              <Icon className={'w-5 h-5 mr-3 ' + (active ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600')} />
              <span className="text-[15px]">{item.label}</span>
              {active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-600 rounded-l-full" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-6 pt-4 border-t border-[#ECECF1] space-y-3">
        {canAccessPath(role, '/quotations/new') && (
          <button onClick={() => navigate('/quotations/new')} className="w-full flex items-center justify-center bg-gradient-to-r from-red-600 to-orange-400 text-white h-12 rounded-[14px] font-bold text-[15px] shadow-[0_4px_12px_rgba(220,38,38,0.2)]">+ New Quotation</button>
        )}
        {role === 'Super Admin' && (
          <Link to="/settings" className="w-full flex items-center h-10 px-4 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"><Settings className="w-5 h-5 mr-3 text-gray-400" /><span className="text-[15px]">Settings</span></Link>
        )}
        {canAccessPath(role, '/settings/tax-configuration') && (
          <Link to="/settings/tax-configuration" className="w-full flex items-center h-10 px-4 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"><SlidersHorizontal className="w-5 h-5 mr-3 text-gray-400" /><span className="text-[15px]">Pricing Rules</span></Link>
        )}
        <Link to="/support" className="w-full flex items-center h-10 px-4 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"><HelpCircle className="w-5 h-5 mr-3 text-gray-400" /><span className="text-[15px]">Support</span></Link>
        <Link to="/profile" className="mt-3 flex items-center gap-3 p-2 hover:bg-gray-50 rounded-[14px]">
          {localStorage.getItem('user_avatar_url') ? (
            <img src={localStorage.getItem('user_avatar_url') || ''} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-[13px] border border-red-200">{(user?.firstName || 'U')[0].toUpperCase()}{(user?.lastName || '')[0]?.toUpperCase()}</div>
          )}
          <div className="min-w-0"><p className="text-sm font-bold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p><p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{role}</p></div>
        </Link>
        <button type="button" onClick={() => { signOut(); navigate('/login', { replace: true }); }} className="flex h-10 w-full items-center px-4 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 font-medium"><LogOut className="w-5 h-5 mr-3 text-gray-400" /><span className="text-[15px]">Sign out</span></button>
      </div>
    </aside>
  );
};

export default Sidebar;