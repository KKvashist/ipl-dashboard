import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Swords, Users2, Shield, BarChart3, Radio } from 'lucide-react';
import Topbar from '@/components/Topbar';
const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/matches', label: 'Matches', icon: Swords },
  { to: '/players', label: 'Players', icon: Users2 },
  { to: '/teams', label: 'Teams', icon: Shield },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen flex bg-navy-950">
      <aside className="w-64 shrink-0 border-r border-navy-800 bg-navy-900 flex flex-col fixed h-screen">
        <div className="px-6 py-7 border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-electric-500 flex items-center justify-center">
              <Radio size={16} className="text-navy-950" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display text-[15px] leading-none tracking-tight text-ink-100">PITCHSIDE</div>
              <div className="text-[10px] tracking-[0.2em] text-ink-500 mt-1">IPL DATA PLATFORM</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-navy-800 text-electric-500 shadow-[0_0_16px_-4px_rgba(47,123,255,0.4)]'
                    : 'text-ink-500 hover:text-ink-100 hover:bg-navy-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-electric-500" />
                  )}
                  <Icon size={17} strokeWidth={2} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-navy-800">
          <div className="flex items-center gap-2 text-[11px] text-ink-700">
            <span className="w-1.5 h-1.5 rounded-full bg-electric-500 animate-pulse" />
            <div className="font-mono tracking-wide uppercase text-ink-500">LIVE DATA</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 min-h-screen">
        <Topbar />
        <Outlet />
      </main>
    </div>
  );
}
