import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { Activity, Zap, TrendingUp, Target, Map, Clock, Leaf, MapPin, ChevronDown, Search } from 'lucide-react';
import { WelcomeDialog } from './WelcomeDialog';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import { useCity } from '../context/CityContext';

export function RootLayout() {
  const location = useLocation();
  const { city, setCityById, allCities } = useCity();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSelectorOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = allCities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase())
  );

  const navItems = [
    { path: '/app', label: 'Dashboard', icon: Activity },
    { path: '/app/simulate', label: 'Simulate', icon: Zap },
    { path: '/app/forecast', label: 'Forecast', icon: TrendingUp },
    { path: '/app/recommendations', label: 'Recommendations', icon: Target },
    { path: '/app/zones', label: 'Zones', icon: Map },
    { path: '/app/ecology', label: 'Ecology', icon: Leaf },
    { path: '/app/history', label: 'History', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <WelcomeDialog />

      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm shrink-0">
        <div className="w-full px-[15px] py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rust rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-card-foreground tracking-tight">CitySentinel <span className="text-rust">AI</span></h1>
                <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Urban Crisis Intelligence</p>
              </div>
            </div>

            {/* Right: City Selector + Status */}
            <div className="flex items-center gap-4">
              {/* City Selector Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setSelectorOpen((o) => !o)}
                  className="flex items-center gap-2 bg-muted/60 hover:bg-muted border border-border rounded-full px-3 py-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-rust flex-shrink-0" />
                  <div className="flex flex-col leading-none text-left">
                    <span className="text-xs font-bold text-card-foreground tracking-wide">{city.name}</span>
                    <span className="text-[10px] text-muted-foreground tracking-wide">{city.state}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${selectorOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {selectorOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      {/* Search */}
                      <div className="p-3 border-b border-border">
                        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                          <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <input
                            autoFocus
                            type="text"
                            placeholder="Search city or state..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground outline-none w-full"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 px-1">Monitoring {allCities.length} Indian cities</p>
                      </div>
                      {/* City List */}
                      <div className="max-h-72 overflow-y-auto">
                        {filtered.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setCityById(c.id);
                              setSelectorOpen(false);
                              setSearch('');
                            }}
                            className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left ${c.id === city.id ? 'bg-rust/5' : ''}`}
                          >
                            <MapPin className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${c.id === city.id ? 'text-rust' : 'text-muted-foreground'}`} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${c.id === city.id ? 'text-rust' : 'text-card-foreground'}`}>{c.name}</span>
                                <span className="text-[10px] bg-muted rounded-full px-2 py-0.5 text-muted-foreground">{c.state}</span>
                                {c.id === city.id && <span className="text-[9px] bg-rust/10 text-rust rounded-full px-2 py-0.5 font-medium">ACTIVE</span>}
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{c.tagline}</p>
                            </div>
                          </button>
                        ))}
                        {filtered.length === 0 && (
                          <div className="px-4 py-8 text-center text-sm text-muted-foreground">No cities found</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Live indicator */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium tracking-wide text-muted-foreground">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b border-border shrink-0">
        <div className="w-full px-[15px]">
          <div className="flex gap-1 overflow-x-auto hide-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${isActive
                    ? 'text-rust border-b-2 border-rust'
                    : 'text-muted-foreground hover:text-primary'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content Area with AnimatePresence */}
      <main className="flex-1 w-full px-[15px] py-8 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {/* Keying by pathname triggers unmount/remount on route change */}
          <React.Fragment key={location.pathname}>
            <Outlet />
          </React.Fragment>
        </AnimatePresence>
      </main>
    </div>
  );
}