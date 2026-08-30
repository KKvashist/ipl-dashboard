import { Search, Bell, ChevronDown } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="h-16 border-b border-navy-700 bg-navy-900/60 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
      <div className="relative w-80 max-w-full">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />

        <input
          placeholder="Search players, teams, matches..."
          className="w-full bg-navy-800/70 border border-navy-600 rounded-lg pl-9 pr-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 transition-all duration-200 focus:outline-none focus:border-electric-500/60 focus:shadow-[0_0_0_3px_rgba(47,123,255,0.15),0_0_20px_-6px_rgba(47,123,255,0.5)]"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1.5 bg-navy-800/70 border border-navy-600 rounded-lg px-3 py-2 text-sm text-ink-300 hover:border-electric-500/40 transition-all duration-200 hover:shadow-[0_0_16px_-6px_rgba(47,123,255,0.4)]">
          All Seasons
          <ChevronDown size={14} />
        </button>

        <button className="relative w-9 h-9 rounded-lg bg-navy-800/70 border border-navy-600 flex items-center justify-center hover:border-electric-500/40 transition-all duration-200 hover:shadow-[0_0_16px_-6px_rgba(47,123,255,0.4)]">
          <Bell size={16} className="text-ink-300" />

          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-stump-500 text-[10px] flex items-center justify-center text-navy-950 font-bold">
            3
          </span>
        </button>

        <div className="w-9 h-9 rounded-full bg-electric-500 flex items-center justify-center text-navy-950 text-xs font-bold">
          KV
        </div>
      </div>
    </header>
  );
}