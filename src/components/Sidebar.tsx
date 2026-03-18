import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wrench, Warehouse, Settings, FileText, Bike, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, signOut } = useAuth();

  const menuItems = [
    { name: 'PANEL DE CONTROL', icon: LayoutDashboard, path: '/' },
    { name: 'GARAJE', icon: Warehouse, path: '/garage' },
    { name: 'DOCUMENTOS', icon: FileText, path: '/documents' },
    { name: 'MANTENIMIENTO', icon: Wrench, path: '/maintenance' },
    { name: 'AJUSTES', icon: Settings, path: '/settings' },
  ];

  // Extract display name from user metadata or email
  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]?.toUpperCase()
    || 'OPERADOR';

  const avatarUrl = user?.user_metadata?.avatar_url
    || `https://ui-avatars.com/api/?name=${displayName}&background=00ff80&color=000&bold=true&size=150`;

  return (
    <div className="w-20 md:w-64 h-screen bg-[#07070a] border-r border-white/5 flex flex-col justify-between fixed left-0 top-0 transition-all duration-300 z-50">
      {/* Brand */}
      <div className="p-8 pb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--color-neon-green)] rounded flex justify-center items-center shrink-0">
            <Bike className="text-black" size={24} />
          </div>
          <div>
            <h1 className="text-white font-bold tracking-widest text-xl m-0 leading-none">MOTOHUB</h1>
            <span className="text-[var(--color-neon-green)] text-[10px] uppercase font-bold tracking-[0.2em]">PREMIUM</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-4">
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-center md:justify-start gap-4 px-2 md:px-4 py-3 rounded-lg transition-all duration-300  ${isActive
                    ? 'bg-[var(--color-dark-surface)] text-[var(--color-neon-green)] border-l-2 border-[var(--color-neon-green)]'
                    : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <item.icon size={20} strokeWidth={1.5} />
                <span className="hidden md:block text-sm font-semibold tracking-wider font-sans truncate">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-10 h-10 rounded-lg grayscale hover:grayscale-0 transition-all border border-white/10"
          />
          <div className="hidden md:block flex-1 min-w-0">
            <h4 className="text-white text-sm font-bold m-0 leading-tight tracking-wider truncate">{displayName}</h4>
            <p className="text-[var(--color-text-secondary)] text-[10px] m-0 truncate">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="hidden md:flex p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-neon-orange)] hover:bg-[var(--color-neon-orange)]/10 transition-all"
            title="Cerrar Sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
