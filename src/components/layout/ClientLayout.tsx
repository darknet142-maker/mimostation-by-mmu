import React from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { SmartSearchBar } from '@/components/client/SmartSearchBar';
import { useAppStore } from '@/hooks/useAppStore';
import {
  Home,
  MapPin,
  Calendar,
  QrCode,
  User,
  Bell,
  ArrowLeft,
  Lock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const ClientLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { alerts, reservations, stations, selectedStationId } = useAppStore(s => ({
    alerts: s.alerts || [],
    reservations: s.reservations || [],
    stations: s.stations || [],
    selectedStationId: s.selectedStationId,
  }));

  const safeStations = Array.isArray(stations) && stations.length > 0 ? stations : [
    {
      id: 'station-liberte',
      name: 'Station Liberté',
      address: 'Avenue de l’Indépendance, Libreville',
      city: 'Libreville',
      country: 'Gabon',
      distanceKm: 1.2,
      isOpen24h: true,
      isOpen: true,
      services: { pumpsTotal: 6, pumpsAvailable: 6, hasBoutique: true, hasCafe: true, hasCarWash: true },
    }
  ];

  const currentStation = safeStations.find(s => s.id === selectedStationId) || safeStations[0];
  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const unreadAlertsCount = safeAlerts.filter(a => !a.isRead).length;

  // Determine if on subpage needing back arrow
  const isSubPage =
    location.pathname.startsWith('/stations/') ||
    location.pathname.includes('/reserver') ||
    location.pathname.includes('/paiement');

  const getPageTitle = () => {
    if (location.pathname.includes('/reserver')) return 'Réserver un produit';
    if (location.pathname.includes('/paiement')) return 'Paiement Mobile Money';
    if (location.pathname.startsWith('/stations/')) return 'Détails de la station';
    return '';
  };

  const activeReservationsCount = safeReservations.filter(
    r => r.status === 'pending' || r.status === 'awaiting_payment'
  ).length;

  const navItems = [
    { label: 'Accueil', path: '/', icon: Home },
    { label: 'Stations', path: '/stations', icon: MapPin },
    {
      label: 'Mes réservations',
      path: '/reservations',
      icon: Calendar,
      badge: activeReservationsCount > 0 ? activeReservationsCount : undefined,
    },
    { label: 'Mes QR', path: '/qr', icon: QrCode },
    { label: 'Profil', path: '/profil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4FB] flex w-full">
      {/* ================= DESKTOP SIDEBAR (>= 1024px) ================= */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 bg-[#0B3A82] text-white p-6 shrink-0 min-h-screen sticky top-0 shadow-2xl z-30 justify-between">
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="pb-4 border-b border-white/10">
            <BrandLogo mode="client" theme="dark" size="md" onClick={() => navigate('/')} />
          </div>

          {/* Current Station Info Widget */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F7B928]" />
                Station en cours
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ouverte 24/7
              </span>
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">{currentStation.name}</h4>
              <p className="text-xs text-blue-100/80 mt-0.5">{currentStation.address}</p>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
              <span className="text-blue-200">Distance : <strong className="text-white">{currentStation.distanceKm} km</strong></span>
              <Link to="/stations" className="text-[#F7B928] hover:underline font-bold text-[11px] flex items-center gap-0.5">
                Changer <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Navigation latérale desktop">
            {navItems.map(item => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white text-[#0B3A82] font-bold shadow-md'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-[#EF4444] text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Notifications link */}
            <Link
              to="/notifications"
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                location.pathname === '/notifications'
                  ? 'bg-white text-[#0B3A82] font-bold shadow-md'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5" />
                <span className="text-sm">Notifications</span>
              </div>
              {unreadAlertsCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#EF4444] text-white">
                  {unreadAlertsCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* Staff & Security Bottom Banner */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <Link
            to="/staff"
            className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-[#F7B928] to-amber-500 text-slate-900 font-bold hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-black/10 flex items-center justify-center">
                <Lock className="w-4 h-4 text-slate-900" />
              </div>
              <div className="text-left">
                <div className="text-xs font-extrabold leading-tight">Espace Personnel</div>
                <div className="text-[10px] text-slate-800 font-medium">Pompiste, Caisse, Gérant</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2 text-[11px] text-blue-200/70 px-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>StationPro v2.4 • Libreville</span>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Desktop Top Header Bar (>= 1024px) */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200/80 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <SmartSearchBar mode="embedded" />
          </div>

          <div className="flex items-center gap-4">
            {/* Selected Station Indicator */}
            <Link
              to="/stations"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-colors"
            >
              <MapPin className="w-4 h-4 text-[#1668E3]" />
              <span>{currentStation.name}</span>
              <span className="text-slate-400">({currentStation.distanceKm} km)</span>
            </Link>

            {/* Notification Bell */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadAlertsCount}
                </span>
              )}
            </Link>

            {/* Direct Staff Access */}
            <Link
              to="/staff"
              className="px-3.5 py-1.5 rounded-xl bg-[#0B3A82] text-white text-xs font-bold hover:bg-[#1668E3] transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Personnel</span>
            </Link>
          </div>
        </header>

        {/* Mobile Header Bar (< 1024px) */}
        <div className="lg:hidden w-full">
          {isSubPage ? (
            <header className="sticky top-0 z-40 bg-[#0B3A82] text-white px-4 py-3.5 flex items-center justify-between shadow-md">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-1.5 -ml-1.5 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white flex items-center justify-center"
                aria-label="Retour"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
              <h1 className="text-base sm:text-lg font-bold text-white text-center flex-1 pr-6 truncate">
                {getPageTitle()}
              </h1>
              <div className="w-4" />
            </header>
          ) : (
            <header className="sticky top-0 z-40 bg-[#0A285F] px-4 py-3 flex items-center justify-between shadow-md">
              <BrandLogo mode="client" theme="dark" size="sm" onClick={() => navigate('/')} />
              <div className="flex items-center gap-2">
                <Link
                  to="/staff"
                  className="px-2.5 py-1 rounded-lg bg-white/15 text-white text-[11px] font-bold flex items-center gap-1"
                >
                  <Lock className="w-3 h-3 text-[#F7B928]" />
                  <span>Personnel</span>
                </Link>
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadAlertsCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0A285F]">
                      {unreadAlertsCount}
                    </span>
                  )}
                </Link>
              </div>
            </header>
          )}
        </div>

        {/* Center Main Content Container */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="w-full max-w-md md:max-w-xl lg:max-w-5xl mx-auto min-h-full pb-28 lg:pb-12 bg-white lg:bg-transparent lg:shadow-none shadow-xl border-x border-slate-200/50 lg:border-x-0">
            <Outlet />
          </div>
        </main>

        {/* ================= MOBILE FLOATING SMART SEARCH BAR (< 1024px) ================= */}
        {/* Floating directly above the bottom menu on mobile */}
        <div className="lg:hidden">
          <SmartSearchBar mode="floating" />
        </div>

        {/* ================= MOBILE BOTTOM NAVIGATION BAR (< 1024px) ================= */}
        <nav
          className="lg:hidden fixed bottom-0 z-40 w-full max-w-md md:max-w-xl left-1/2 -translate-x-1/2 bg-white border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-2xl"
          aria-label="Navigation client"
        >
          {navItems.map(item => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-colors relative ${
                  isActive ? 'text-[#1668E3]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${
                      isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                    }`}
                  />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 bg-[#EF4444] text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 font-medium truncate max-w-[64px] text-center ${
                    isActive ? 'font-bold text-[#1668E3]' : ''
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
