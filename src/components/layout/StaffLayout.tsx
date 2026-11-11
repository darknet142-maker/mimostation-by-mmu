import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { StaffRole } from '@/types';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { StatusPill } from '@/components/ui/StatusPill';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ASSETS } from '@/config/assets';
import {
  Menu,
  X,
  Bell,
  MapPin,
  Clock,
  LogOut,
  Home,
  Fuel,
  CreditCard,
  BarChart3,
  Settings,
  LayoutGrid,
  Users,
  ShoppingCart,
  Package,
  AlertTriangle,
  Receipt,
  User,
  Layers,
  RefreshCw,
  Coffee,
  DollarSign,
  LucideIcon,
  ChevronDown,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export const StaffLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stationDropdownOpen, setStationDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  const { currentEmployee, alerts, selectedStationId, stations } = useAppStore(s => ({
    currentEmployee: s.currentEmployee,
    alerts: s.alerts,
    selectedStationId: s.selectedStationId,
    stations: s.stations,
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
  const activeStation = safeStations.find(s => s.id === selectedStationId) || safeStations[0];
  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const unreadAlertsCount = safeAlerts.filter(a => !a.isRead).length;

  // Real-time clock formatted as in screenshots: "09:48 | Lun. 10 Nov. 2026"
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      );
      // Format: "Lun. 10 Nov. 2026"
      const days = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
      const months = ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
      setCurrentDate(`${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} 2026`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const role: StaffRole = currentEmployee?.role || 'pompiste';

  // Specific navigation items per role matching the exact screenshots
  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'pompiste':
        return [
          { id: '', label: 'Accueil', icon: Home },
          { id: 'piste', label: 'Piste', icon: Fuel },
          { id: 'encaissement', label: 'Encaissement', icon: CreditCard },
          { id: 'stocks', label: 'Stock & Niveaux', icon: Layers },
          { id: 'rapports', label: 'Rapports', icon: BarChart3 },
          { id: 'parametres', label: 'Paramètres', icon: Settings },
        ];
      case 'chef-de-piste':
        return [
          { id: '', label: 'Tableau de bord', icon: LayoutGrid },
          { id: 'pompes', label: 'Pistes & Pompes', icon: Fuel },
          { id: 'equipe', label: 'Équipe', icon: Users },
          { id: 'stocks', label: 'Stocks & Produits', icon: Package },
          { id: 'rapports', label: 'Rapports', icon: BarChart3 },
          { id: 'alertes', label: 'Alertes', icon: Bell, badge: unreadAlertsCount },
          { id: 'parametres', label: 'Paramètres', icon: Settings },
        ];
      case 'caissiere':
        return [
          { id: '', label: 'Caisse Boutique', icon: ShoppingCart },
          { id: 'produits', label: 'Produits', icon: Package },
          { id: 'stocks', label: 'Stocks', icon: Layers },
          { id: 'rapports', label: 'Rapports', icon: BarChart3 },
          { id: 'alertes', label: 'Alertes', icon: Bell, badge: unreadAlertsCount },
          { id: 'parametres', label: 'Paramètres', icon: Settings },
        ];
      case 'chef-de-poste':
        return [
          { id: '', label: 'Tableau de bord', icon: LayoutGrid },
          { id: 'equipe', label: 'Équipe', icon: Users },
          { id: 'pompes', label: 'Pistes & Pompes', icon: Fuel },
          { id: 'stocks', label: 'Stocks', icon: Layers },
          { id: 'rapports', label: 'Rapports', icon: BarChart3 },
          { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
          { id: 'parametres', label: 'Paramètres', icon: Settings },
        ];
      case 'rayonniste':
        return [
          { id: '', label: 'Tableau de bord', icon: LayoutGrid },
          { id: 'rayons', label: 'Rayons', icon: Layers },
          { id: 'stocks', label: 'Stocks', icon: Package },
          { id: 'reassort', label: 'Réassort', icon: RefreshCw },
          { id: 'alertes', label: 'Alertes', icon: Bell, badge: unreadAlertsCount },
          { id: 'parametres', label: 'Paramètres', icon: Settings },
        ];
      case 'agent-comptoir':
        return [
          { id: '', label: 'Comptoir Café', icon: Coffee },
          { id: 'commandes', label: 'Commandes', icon: Receipt },
          { id: 'produits', label: 'Produits', icon: Package },
          { id: 'rapports', label: 'Rapports', icon: BarChart3 },
          { id: 'parametres', label: 'Paramètres', icon: Settings },
        ];
      case 'gerant':
        return [
          { id: '', label: 'Tableau de bord', icon: LayoutGrid },
          { id: 'equipe', label: 'Équipe', icon: Users },
          { id: 'pompes', label: 'Pistes & Pompes', icon: Fuel },
          { id: 'stocks', label: 'Stocks', icon: Layers },
          { id: 'finances', label: 'Finances', icon: DollarSign },
          { id: 'rapports', label: 'Rapports', icon: BarChart3 },
          { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
          { id: 'parametres', label: 'Paramètres', icon: Settings },
        ];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    store.logout();
    navigate('/personnel');
  };

  // Determine current active section
  const currentSection = location.pathname.split('/')[3] || '';

  return (
    <div className="min-h-screen bg-[#F0F4FB] flex flex-col lg:flex-row">
      {/* ================= DESKTOP SIDEBAR (>= 1024px) ================= */}
      <aside className="hidden lg:flex w-64 bg-gradient-to-b from-[#0B3A82] via-[#082C6A] to-[#041638] text-white flex-col justify-between shrink-0 shadow-2xl relative z-30">
        <div>
          {/* Logo Header */}
          <div className="p-6 pb-8 border-b border-white/10">
            <BrandLogo theme="dark" mode="staff" size="md" onClick={() => navigate(`/personnel/${role}`)} />
          </div>

          {/* Navigation items */}
          <nav className="p-4 space-y-1.5" aria-label="Menu principal">
            {navItems.map(item => {
              const isActive = currentSection === item.id;
              const Icon = item.icon;
              const targetPath = item.id ? `/personnel/${role}/${item.id}` : `/personnel/${role}`;

              return (
                <Link
                  key={item.id}
                  to={targetPath}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 group ${
                    isActive
                      ? 'bg-[#F7B928] text-[#0A162B] font-bold shadow-md shadow-amber-500/20'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#0A162B]' : 'text-white/80 group-hover:text-white'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white text-xs font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar City Scene & Logout */}
        <div className="relative pt-12 pb-6 px-4">
          <img
            src={role === 'caissiere' ? ASSETS.scenes.sidebarBoutique : ASSETS.scenes.sidebarCity}
            alt=""
            className="absolute bottom-16 left-0 right-0 w-full object-cover pointer-events-none opacity-80"
          />
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="relative z-10 w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/20 bg-black/20 hover:bg-white/10 text-white font-medium text-sm backdrop-blur-xs transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* ================= DESKTOP HEADER BAR (>= 1024px) ================= */}
        <header className="hidden lg:flex bg-gradient-to-r from-[#0B3A82] via-[#0A2E6E] to-[#0D449A] text-white px-8 py-4 justify-between items-center shadow-lg relative overflow-hidden">
          {/* User profile & status */}
          <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
              <img
                src={currentEmployee?.avatar || ASSETS.avatars.pompiste}
                alt={currentEmployee?.name || 'Agent'}
                className="w-14 h-14 rounded-full border-2 border-white shadow-md bg-blue-500 object-cover"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#10B981] border-2 border-white rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {currentEmployee?.title || 'Personnel'}
                </h1>
                <StatusPill type="active" label="En service" size="sm" />
              </div>
              <p className="text-sm text-blue-100 font-medium mt-0.5">
                {currentEmployee?.name || 'Jean Dupont'}
              </p>
            </div>
          </div>

          {/* Location & Live Clock */}
          <div className="flex items-center gap-8 relative z-10">
            {/* Interactive Station Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setStationDropdownOpen(!stationDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-left"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold flex items-center gap-1.5">
                    <span>{activeStation.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
                  </div>
                  <div className="text-[11px] text-blue-200">{activeStation.city}, {activeStation.country}</div>
                </div>
              </button>

              {stationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 p-2 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase">
                    Changer de station active
                  </div>
                  {stations.map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        store.setSelectedStation(st.id);
                        setStationDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        st.id === selectedStationId
                          ? 'bg-[#1668E3] text-white font-bold'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>
                        <div>{st.name}</div>
                        <div className={`text-[10px] ${st.id === selectedStationId ? 'text-blue-100' : 'text-slate-400'}`}>
                          {st.address}
                        </div>
                      </div>
                      {st.id === selectedStationId && <span className="text-[10px] bg-white text-[#1668E3] font-bold px-1.5 py-0.5 rounded-full">Active</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-white tracking-wide">{currentTime || '09:48'}</div>
                <div className="text-xs text-blue-200">{currentDate || 'Lun. 10 Nov. 2026'}</div>
              </div>
            </div>

            {/* Notification Bell */}
            <Link
              to={`/personnel/${role}/alertes`}
              className="relative w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Alertes & Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0B3A82]">
                  {unreadAlertsCount}
                </span>
              )}
            </Link>
          </div>

          {/* Right canopy silhouette backdrop */}
          <img
            src={role === 'caissiere' ? ASSETS.scenes.boutiqueFront : ASSETS.scenes.headerStation}
            alt=""
            className="absolute right-0 top-0 bottom-0 h-full w-96 object-cover object-right opacity-40 pointer-events-none"
          />
        </header>

        {/* ================= MOBILE HEADER (< 1024px) ================= */}
        <header className="lg:hidden sticky top-0 z-40 bg-[#0A285F] text-white px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <BrandLogo theme="dark" mode="staff" size="sm" onClick={() => navigate(`/personnel/${role}`)} />
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/personnel/${role}/alertes`}
              className="relative p-2 rounded-full hover:bg-white/10 text-white"
              aria-label="Alertes"
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

        {/* ================= MAIN ROUTE CONTENT ================= */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* ================= MOBILE SLIDE-OUT DRAWER ================= */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-gradient-to-b from-[#0B3A82] to-[#041638] text-white h-full flex flex-col justify-between p-4 shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <BrandLogo theme="dark" mode="staff" size="sm" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-full text-white/80 hover:text-white"
                  aria-label="Fermer le menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Current user card in drawer */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 mb-3">
                <img
                  src={currentEmployee?.avatar || ASSETS.avatars.pompiste}
                  alt=""
                  className="w-10 h-10 rounded-full border border-white"
                />
                <div>
                  <div className="font-bold text-sm">{currentEmployee?.title}</div>
                  <div className="text-xs text-blue-200">{currentEmployee?.name}</div>
                </div>
              </div>

              {/* Station selector in mobile drawer */}
              <div className="p-2.5 rounded-xl bg-white/10 mb-4 text-xs">
                <div className="text-[10px] text-blue-200 uppercase font-semibold mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#F7B928]" />
                  <span>Station active</span>
                </div>
                <select
                  value={selectedStationId}
                  onChange={e => store.setSelectedStation(e.target.value)}
                  className="w-full bg-black/20 border border-white/20 rounded-lg p-1.5 text-xs text-white font-bold focus:outline-none"
                >
                  {stations.map(st => (
                    <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                      {st.name} ({st.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Navigation items */}
              <nav className="space-y-1">
                {navItems.map(item => {
                  const isActive = currentSection === item.id;
                  const Icon = item.icon;
                  const targetPath = item.id ? `/personnel/${role}/${item.id}` : `/personnel/${role}`;

                  return (
                    <Link
                      key={item.id}
                      to={targetPath}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                        isActive
                          ? 'bg-[#F7B928] text-[#0A162B] font-bold'
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white text-xs font-bold flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setShowLogoutConfirm(true);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/20 bg-black/20 text-white font-medium text-sm"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= MOBILE BOTTOM NAVIGATION (from Capture 01C) ================= */}
      <nav
        className="fixed bottom-0 z-40 w-full lg:hidden bg-white border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg"
        aria-label="Navigation mobile personnel"
      >
        <Link
          to={`/personnel/${role}`}
          className={`flex flex-col items-center py-1 px-3 ${
            location.pathname === `/personnel/${role}` ? 'text-[#1668E3] font-bold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1">Accueil</span>
        </Link>

        <Link
          to={`/personnel/${role}/transactions`}
          className={`flex flex-col items-center py-1 px-3 ${
            location.pathname.includes('/transactions') ? 'text-[#1668E3] font-bold' : 'text-slate-500'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] mt-1">Transactions</span>
        </Link>

        <Link
          to={`/personnel/${role}/rapports`}
          className={`flex flex-col items-center py-1 px-3 ${
            location.pathname.includes('/rapports') ? 'text-[#1668E3] font-bold' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] mt-1">Rapports</span>
        </Link>

        <Link
          to={`/personnel/${role}/parametres`}
          className={`flex flex-col items-center py-1 px-3 ${
            location.pathname.includes('/parametres') ? 'text-[#1668E3] font-bold' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-1">Profil</span>
        </Link>
      </nav>

      {/* Logout confirmation dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Se déconnecter"
        message="Êtes-vous sûr de vouloir quitter votre poste et vous déconnecter ?"
        confirmLabel="Déconnexion"
        variant="navy"
      />
    </div>
  );
};

