import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  Layers,
  BarChart3,
  Palette,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  ChevronDown,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ASSETS } from '@/config/assets';

export const AdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: 'Tableau de bord', path: '/admin', icon: LayoutDashboard },
    { label: 'Stations', path: '/admin/stations', icon: Building2 },
    { label: 'Utilisateurs', path: '/admin/utilisateurs', icon: Users },
    { label: 'Produits & Stocks', path: '/admin/stocks', icon: Package },
    { label: 'Transactions', path: '/admin/transactions', icon: Layers },
    { label: 'Rapports', path: '/admin/rapports', icon: BarChart3 },
    { label: 'Personnalisation', path: '/admin/personnalisation', icon: Palette },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell, badge: 3 },
    { label: 'Paramètres', path: '/admin/parametres', icon: Settings },
    { label: 'Support', path: '/admin/support', icon: HelpCircle },
  ];

  const handleLogout = () => {
    navigate('/personnel');
  };

  const isActiveLink = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F0F4FB] text-slate-800 flex flex-col font-sans">
      <div className="flex-1 flex overflow-hidden">
        {/* ================= DESKTOP SIDEBAR ================= */}
        <aside className="hidden lg:flex w-64 bg-[#0A1D37] text-white flex-col justify-between shrink-0 shadow-xl border-r border-[#152E52] select-none">
          <div className="p-5 flex flex-col h-full justify-between">
            <div>
              {/* Brand Header */}
              <div className="flex items-center gap-3 pb-6 border-b border-slate-700/60">
                <BrandLogo theme="dark" mode="admin" size="md" />
              </div>

              {/* Navigation Links */}
              <nav className="mt-5 space-y-1">
                {navLinks.map(item => {
                  const active = isActiveLink(item.path);
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                        active
                          ? 'bg-[#F7B928] text-[#0A1D37] font-bold shadow-md shadow-amber-500/20'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-[#0A1D37]' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            active
                              ? 'bg-[#0A1D37] text-[#F7B928]'
                              : 'bg-rose-500 text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Section */}
            <div className="space-y-3 pt-6 border-t border-slate-700/60">
              {/* Licence Status Pill */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-[#0E2C57] to-[#123668] border border-blue-500/30 text-xs shadow-inner">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Statut Licence</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-medium text-emerald-300">Actif jusqu'au 31 déc. 2026</span>
                </div>
              </div>

              {/* Admin Profile Row */}
              <div
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer border border-white/5 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={ASSETS.avatars.gerant}
                    alt="Admin Global"
                    className="w-9 h-9 rounded-full object-cover border-2 border-amber-400/80 bg-blue-900"
                  />
                  <div className="leading-tight">
                    <p className="text-xs font-bold text-white">Admin Global</p>
                    <p className="text-[11px] text-slate-400">Super Administrateur</p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-white/10 text-xs font-medium transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ================= MOBILE SIDEBAR DRAWER ================= */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80%] bg-[#0A1D37] text-white p-5 flex flex-col justify-between shadow-2xl z-10">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
                  <BrandLogo theme="dark" mode="admin" size="sm" />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="mt-4 space-y-1">
                  {navLinks.map(item => {
                    const active = isActiveLink(item.path);
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${
                          active
                            ? 'bg-[#F7B928] text-[#0A1D37] font-bold'
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-700/60">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MAIN CONTENT WRAPPER ================= */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* TOP HEADER BAR */}
          <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Global Admin Search Bar */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une station, un utilisateur..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Right Header Controls */}
            <div className="flex items-center gap-2.5 sm:gap-4 ml-3">
              {/* Quick links to client and staff apps */}
              <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Vue Client</span>
                </button>
                <button
                  onClick={() => navigate('/personnel')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition-all"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Espace Personnel</span>
                </button>
              </div>

              {/* Notification Bell with Badge 3 */}
              <button
                onClick={() => navigate('/admin/notifications')}
                className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-all"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  3
                </span>
              </button>

              {/* User Avatar Pill */}
              <div
                onClick={() => navigate('/admin/parametres')}
                className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 cursor-pointer group"
              >
                <img
                  src={ASSETS.avatars.gerant}
                  alt="Admin Global"
                  className="w-8 h-8 rounded-full object-cover border border-slate-300 group-hover:border-blue-500 transition-all"
                />
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Admin Global
                  </p>
                  <p className="text-[10px] text-slate-500">Super Administrateur</p>
                </div>
              </div>
            </div>
          </header>

          {/* PAGE BODY */}
          <main className="flex-1 p-3 sm:p-5 lg:p-6 pb-12 max-w-[1600px] w-full mx-auto">
            <Outlet />
          </main>

          {/* BOTTOM STATUS BAR (Footer from Screen) */}
          <footer className="bg-[#0A1D37] text-slate-300 text-[11px] sm:text-xs py-2 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 select-none">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Système opérationnel</span>
              </div>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-400">
                Dernière mise à jour : 10/11/2026 à 09:45
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-blue-400 font-mono font-medium">Version : v2.0.0</span>
            </div>

            <div className="text-slate-400 text-[11px]">
              StationPro - Plateforme de gestion des stations-services
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
