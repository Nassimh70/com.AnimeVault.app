import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Clock, PlayCircle, CheckCircle2, Heart, FolderHeart, ChevronDown,
  BarChart3, Settings, ChevronsLeft, ChevronsRight, Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import logo from '../../hooks/Mylogo.png';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/favorites', label: 'Favoris', icon: Heart },
  { to: '/stats', label: 'Statistiques', icon: BarChart3 },
  { to: '/settings', label: 'Paramètres', icon: Settings },
];

const collectionLinks = [
  { to: '/list?status=a_voir', label: 'À regarder', icon: Clock },
  { to: '/list?status=en_cours', label: 'En cours', icon: PlayCircle },
  { to: '/list?status=termine', label: 'Terminés', icon: CheckCircle2 },
];

function isActiveRoute(pathname: string, search: string, to: string, end?: boolean) {
  const [targetPath, targetSearch = ''] = to.split('?');
  if (end) return pathname === targetPath && search === (targetSearch ? `?${targetSearch}` : '');
  if (targetSearch) return pathname === targetPath && search === `?${targetSearch}`;
  return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  const collectionActive = useMemo(
    () => location.pathname === '/list',
    [location.pathname]
  );

  useEffect(() => {
    if (location.pathname === '/list') {
      setCollectionsOpen(true);
    }
  }, [location.pathname]);

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 248 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      className="h-screen sticky top-0 shrink-0 flex flex-col py-5 px-3 border-r border-white/8 bg-bg/65 backdrop-blur-2xl relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.12),transparent_34%)]" />
      <div className={`flex items-center mb-8 ${collapsed ? 'justify-center px-0' : 'px-2'}`}>
        <img 
          src={logo} 
          alt="Anime Vault Logo" 
          className={`object-contain transition-all duration-300 ${collapsed ? 'w-12' : 'w-53'}`} 
        />
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={() =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 relative overflow-hidden ${
                isActiveRoute(location.pathname, location.search, to, end) ? 'text-white shadow-glow' : 'text-text-secondary hover:bg-white/10 hover:text-text-primary'
              }`
            }
          >
            {() => {
              const isActive = isActiveRoute(location.pathname, location.search, to, end);
              return (
              <>
                {isActive && (
                  <motion.div layoutId="active-pill" className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/20 to-accent-secondary/15 border border-white/10" />
                )}
                <span className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border ${isActive ? 'border-white/15 bg-white/10 text-white' : 'border-white/8 bg-white/5 text-text-secondary group-hover:text-white'}`}>
                  <Icon size={17} className="shrink-0" />
                </span>
                {!collapsed && <span className="relative z-10 whitespace-nowrap">{label}</span>}
              </>
              );
            }}
          </NavLink>
        ))}

        <div className="mt-1">
          <button
            type="button"
            onClick={() => {
              setCollectionsOpen((open) => !open);
              navigate('/list');
            }}
            className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 relative overflow-hidden ${
              collectionActive ? 'text-white shadow-glow' : 'text-text-secondary hover:bg-white/10 hover:text-text-primary'
            }`}
          >
            {collectionActive && (
              <motion.div layoutId="active-pill" className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/20 to-accent-secondary/15 border border-white/10" />
            )}
            <span className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border ${collectionActive ? 'border-white/15 bg-white/10 text-white' : 'border-white/8 bg-white/5 text-text-secondary group-hover:text-white'}`}>
              <FolderHeart size={17} className="shrink-0" />
            </span>
            {!collapsed && (
              <>
                <span className="relative z-10 whitespace-nowrap flex-1 text-left">Collections</span>
                <ChevronDown size={16} className={`relative z-10 transition-transform ${collectionsOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {collectionsOpen && !collapsed && (
            <div className="mt-2 ml-5 pl-4 border-l border-white/10 flex flex-col gap-1">
              {collectionLinks.map(({ to, label, icon: Icon }) => {
                const isActive = isActiveRoute(location.pathname, location.search, to);
                return (
                  <NavLink
                    key={label}
                    to={to}
                    className={`group flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 relative overflow-hidden ${
                      isActive ? 'text-white' : 'text-text-secondary hover:bg-white/10 hover:text-text-primary'
                    }`}
                  >
                    {isActive && <motion.div layoutId={`collection-pill-${label}`} className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/18 to-accent-secondary/12 border border-white/10" />}
                    <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border ${isActive ? 'border-white/15 bg-white/10 text-white' : 'border-white/8 bg-white/5 text-text-secondary group-hover:text-white'}`}>
                      <Icon size={15} className="shrink-0" />
                    </span>
                    <span className="relative z-10 whitespace-nowrap">{label}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="mt-4 flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-text-secondary surface hover:border-white/20 hover:text-text-primary text-sm transition-all"
      >
        {collapsed ? <ChevronsRight size={18} /> : <><ChevronsLeft size={18} /> Réduire</>}
      </button>
    </motion.aside>
  );
}
