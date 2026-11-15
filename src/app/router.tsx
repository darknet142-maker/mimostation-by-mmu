import React, { Suspense, lazy, ComponentType } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { StaffAuthGuard, AdminAuthGuard } from '@/components/auth/RouteGuards';

const RouteLoader: React.FC = () => (
  <div className="min-h-[260px] flex flex-col items-center justify-center gap-3 p-8" role="status" aria-live="polite">
    <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
    <span className="text-xs font-semibold text-slate-500">Chargement de l&apos;interface...</span>
  </div>
);

function lazyNamed<TModule extends Record<string, unknown>, TKey extends keyof TModule>(
  importer: () => Promise<TModule>,
  exportName: TKey
): React.ReactElement {
  const LazyComponent = lazy(async () => {
    const mod = await importer();
    return { default: mod[exportName] as ComponentType<Record<string, never>> };
  });

  return (
    <Suspense fallback={<RouteLoader />}>
      <LazyComponent />
    </Suspense>
  );
}

// Layouts
const ClientLayout = lazyNamed(() => import('@/components/layout/ClientLayout'), 'ClientLayout');
const StaffLayout = lazyNamed(() => import('@/components/layout/StaffLayout'), 'StaffLayout');
const AdminLayout = lazyNamed(() => import('@/components/layout/AdminLayout'), 'AdminLayout');

export const router = createBrowserRouter([
  // ================= CLIENT ROUTES =================
  {
    path: '/',
    element: ClientLayout,
    children: [
      { index: true, element: lazyNamed(() => import('@/features/client/ClientHomePage'), 'ClientHomePage') },
      { path: 'stations', element: lazyNamed(() => import('@/features/client/StationsListPage'), 'StationsListPage') },
      { path: 'stations/:stationId', element: lazyNamed(() => import('@/features/client/StationDetailPage'), 'StationDetailPage') },
      { path: 'stations/:stationId/reserver/:productId', element: lazyNamed(() => import('@/features/client/ReserveProductPage'), 'ReserveProductPage') },
      { path: 'reservations', element: lazyNamed(() => import('@/features/client/ReservationsListPage'), 'ReservationsListPage') },
      { path: 'reservations/:reservationId/paiement', element: lazyNamed(() => import('@/features/client/PaymentMobileMoneyPage'), 'PaymentMobileMoneyPage') },
      { path: 'qr', element: lazyNamed(() => import('@/features/client/QrPage'), 'QrPage') },
      { path: 'notifications', element: lazyNamed(() => import('@/features/client/NotificationsPage'), 'NotificationsPage') },
      { path: 'profil', element: lazyNamed(() => import('@/features/client/ClientProfilePage'), 'ClientProfilePage') },
    ],
  },

  // Compatibilité ancien lien /staff
  {
    path: '/staff',
    element: <Navigate to="/personnel" replace />,
  },

  // ================= STAFF AUTH (FULLSCREEN) =================
  {
    path: '/personnel',
    element: lazyNamed(() => import('@/features/staff/auth/StaffRoleSelectPage'), 'StaffRoleSelectPage'),
  },
  {
    path: '/personnel/connexion/:role',
    element: lazyNamed(() => import('@/features/staff/auth/StaffPinLoginPage'), 'StaffPinLoginPage'),
  },

  // ================= STAFF WORKSPACE BY ROLE (PROTÉGÉ PAR GARDE) =================
  {
    path: '/personnel/pompiste',
    element: <StaffAuthGuard expectedRole="pompiste" />,
    children: [
      {
        element: StaffLayout,
        children: [
          { index: true, element: lazyNamed(() => import('@/features/staff/pompiste/PompisteDashboardPage'), 'PompisteDashboardPage') },
          { path: 'piste', element: lazyNamed(() => import('@/features/staff/pompiste/PompisteDashboardPage'), 'PompisteDashboardPage') },
          { path: 'boutique', element: lazyNamed(() => import('@/features/staff/shared/stocks/StaffStocksPage'), 'StaffStocksPage') },
          { path: 'encaissement', element: lazyNamed(() => import('@/features/staff/shared/pumps/StaffPumpsPage'), 'StaffPumpsPage') },
          { path: 'transactions', element: lazyNamed(() => import('@/features/staff/shared/reports/StaffReportsPage'), 'StaffReportsPage') },
          { path: 'stocks', element: lazyNamed(() => import('@/features/staff/shared/stocks/StaffStocksPage'), 'StaffStocksPage') },
          { path: 'rapports', element: lazyNamed(() => import('@/features/staff/shared/reports/StaffReportsPage'), 'StaffReportsPage') },
          { path: 'alertes', element: lazyNamed(() => import('@/features/staff/shared/alerts/StaffAlertsPage'), 'StaffAlertsPage') },
          { path: 'parametres', element: lazyNamed(() => import('@/features/staff/shared/settings/StaffSettingsPage'), 'StaffSettingsPage') },
        ],
      },
    ],
  },
  {
    path: '/personnel/chef-de-piste',
    element: <StaffAuthGuard expectedRole="chef-de-piste" />,
    children: [
      {
        element: StaffLayout,
        children: [
          { index: true, element: lazyNamed(() => import('@/features/staff/chef-de-piste/ChefDePisteDashboardPage'), 'ChefDePisteDashboardPage') },
          { path: 'pompes', element: lazyNamed(() => import('@/features/staff/shared/pumps/StaffPumpsPage'), 'StaffPumpsPage') },
          { path: 'equipe', element: lazyNamed(() => import('@/features/staff/shared/team/StaffTeamPage'), 'StaffTeamPage') },
          { path: 'stocks', element: lazyNamed(() => import('@/features/staff/shared/stocks/StaffStocksPage'), 'StaffStocksPage') },
          { path: 'transactions', element: lazyNamed(() => import('@/features/staff/shared/reports/StaffReportsPage'), 'StaffReportsPage') },
          { path: 'rapports', element: lazyNamed(() => import('@/features/staff/shared/reports/StaffReportsPage'), 'StaffReportsPage') },
          { path: 'alertes', element: lazyNamed(() => import('@/features/staff/shared/alerts/StaffAlertsPage'), 'StaffAlertsPage') },
          { path: 'parametres', element: lazyNamed(() => import('@/features/staff/shared/settings/StaffSettingsPage'), 'StaffSettingsPage') },
        ],
      },
    ],
  },
  {
    path: '/personnel/caissiere',
    element: <StaffAuthGuard expectedRole="caissiere" />,
    children: [
      {
        element: StaffLayout,
        children: [
          { index: true, element: lazyNamed(() => import('@/features/staff/caissiere/CaissiereDashboardPage'), 'CaissiereDashboardPage') },
          { path: 'produits', element: lazyNamed(() => import('@/features/staff/shared/stocks/StaffStocksPage'), 'StaffStocksPage') },
          { path: 'stocks', element: lazyNamed(() => import('@/features/staff/shared/stocks/StaffStocksPage'), 'StaffStocksPage') },
          { path: 'transactions', element: lazyNamed(() => import('@/features/staff/shared/reports/StaffReportsPage'), 'StaffReportsPage') },
          { path: 'rapports', element: lazyNamed(() => import('@/features/staff/shared/reports/StaffReportsPage'), 'StaffReportsPage') },
          { path: 'alertes', element: lazyNamed(() => import('@/features/staff/shared/alerts/StaffAlertsPage'), 'StaffAlertsPage') },
          { path: 'parametres', element: lazyNamed(() => import('@/features/staff/shared/settings/StaffSettingsPage'), 'StaffSettingsPage') },
        ],
      },
    ],
  },
  {
    path: '/personnel/chef-de-poste',
    element: <StaffAuthGuard expectedRole="chef-de-poste" />,
    children: [
      {
        element: StaffLayout,
        children: [
          { index: true, element: lazyNamed(() => import('@/features/staff/chef-de-poste/ChefDePosteDashboardPage'), 'ChefDePosteDashboardPage') },
          { path: 'equipe', element: lazyNamed(() => import('@/features/staff/shared/team/StaffTeamPage'), 'StaffTeamPage') },
          { path: 'pompes', element: lazyNamed(() => import('@/features/staff/shared/pumps/StaffPumpsPage'), 'StaffPumpsPage') },
          { path: 'stocks', element: lazyNamed(() => import('@/features/staff/shared/stocks/StaffStocksPage'), 'StaffStocksPage') },
          { path: 'transactions', element: lazyNamed(() => import('@/features/staff/shared/reports/StaffReportsPage'), 'StaffReportsPage') },
          { path: 'rapports', element: lazyNamed(() => import('@/features/staff/shared/reports/StaffReportsPage'), 'StaffReportsPage') },
          { path: 'incidents', element: lazyNamed(() => import('@/features/staff/shared/alerts/StaffAlertsPage'), 'StaffAlertsPage') },
          { path: 'parametres', element: lazyNamed(() => import('@/features/staff/shared/settings/StaffSettingsPage'), 'StaffSettingsPage') },
        ],
      },
    ],
  },
  {
    path: '/personnel/rayonniste',
    element: <StaffAuthGuard expectedRole="rayonniste" />,
    children: [
      {
        element: StaffLayout,
        children: [
          { index: true, element: lazyNamed(() => import('@/features/staff/rayonniste/RayonnisteDashboardPage'), 'RayonnisteDashboardPage') },
          { path: 'rayons', element: lazyNamed(() => import('@/features/staff/shared/stocks/StaffStocksPage'), 'StaffStocksPage') },
          { path: 'stocks', element: lazyNamed(() => import('@/features/staff/shared/stocks/StaffStocksPage'), 'StaffStocksPage') },
          { path: 'reassort', element: lazyNamed(() => import('@/features/staff/shared/stocks/StaffStocksPage'), 'StaffStocksPage') },
          { path: 'transactions', element: lazyNamed(() => import('@/features/staff/shared/reports/StaffReportsPage'), 'StaffReportsPage') },
          { path: 'rapports', element: lazyNamed(() => import('@/features/staff/shared/reports/StaffReportsPage'), 'StaffReportsPage') },
          { path: 'alertes', element: lazyNamed(() => import('@/features/staff/shared/alerts/StaffAlertsPage'), 'StaffAlertsPage') },
          { path: 'parametres', element: lazyNamed(() => import('@/features/staff/shared/settings/StaffSettingsPage'), 'StaffSettingsPage') },
        ],
      },
    ],
  },
  {
    path: '/personnel/agent-comptoir',
    element: <StaffAuthGuard expectedRole="agent-comptoir" />,
    children: [
      {
        element: StaffLayout,
        children: [
          { index: true, element: lazyNamed(() => import('@/features/staff/agent-comptoir/AgentComptoirDashboardPage'), 'AgentComptoirDashboardPage') },
          { path: 'commandes', element: lazyNamed(() => import('@/features/staff/agent-comptoir/AgentComptoirDashboardPage'), 'AgentComptoirDashboardPage') },
          { path: 'produits', element: lazyNamed(() => import('@/features/staff/shared/stocks/StaffStocksPage'), 'StaffStocksPage') },
          { path: 'transactions', element: lazyNamed(() => import('@/features/staff/shared/reports/StaffReportsPage'), 'StaffReportsPage') },
          { path: 'rapports', element: lazyNamed(() => import('@/features/staff/shared/reports/StaffReportsPage'), 'StaffReportsPage') },
          { path: 'parametres', element: lazyNamed(() => import('@/features/staff/shared/settings/StaffSettingsPage'), 'StaffSettingsPage') },
        ],
      },
    ],
  },
  {
    path: '/personnel/gerant',
    element: <StaffAuthGuard expectedRole="gerant" />,
    children: [
      {
        element: StaffLayout,
        children: [
          { index: true, element: lazyNamed(() => import('@/features/staff/gerant/GerantDashboardPage'), 'GerantDashboardPage') },
          { path: 'equipe', element: lazyNamed(() => import('@/features/staff/shared/team/StaffTeamPage'), 'StaffTeamPage') },
          { path: 'pompes', element: lazyNamed(() => import('@/features/staff/shared/pumps/StaffPumpsPage'), 'StaffPumpsPage') },
          { path: 'stocks', element: lazyNamed(() => import('@/features/staff/shared/stocks/StaffStocksPage'), 'StaffStocksPage') },
          { path: 'finances', element: lazyNamed(() => import('@/features/staff/shared/reports/StaffReportsPage'), 'StaffReportsPage') },
          { path: 'transactions', element: lazyNamed(() => import('@/features/staff/shared/reports/StaffReportsPage'), 'StaffReportsPage') },
          { path: 'rapports', element: lazyNamed(() => import('@/features/staff/shared/reports/StaffReportsPage'), 'StaffReportsPage') },
          { path: 'incidents', element: lazyNamed(() => import('@/features/staff/shared/alerts/StaffAlertsPage'), 'StaffAlertsPage') },
          { path: 'parametres', element: lazyNamed(() => import('@/features/staff/shared/settings/StaffSettingsPage'), 'StaffSettingsPage') },
        ],
      },
    ],
  },

  // ================= ADMIN CONSOLE (PROTÉGÉ PAR GARDE SUPER ADMIN) =================
  {
    path: '/admin',
    element: <AdminAuthGuard />,
    children: [
      {
        element: AdminLayout,
        children: [
          { index: true, element: lazyNamed(() => import('@/features/admin/AdminDashboardPage'), 'AdminDashboardPage') },
          { path: 'dashboard', element: lazyNamed(() => import('@/features/admin/AdminDashboardPage'), 'AdminDashboardPage') },
          { path: 'stations', element: lazyNamed(() => import('@/features/admin/AdminStationsPage'), 'AdminStationsPage') },
          { path: 'utilisateurs', element: lazyNamed(() => import('@/features/admin/AdminUsersPage'), 'AdminUsersPage') },
          { path: 'stocks', element: lazyNamed(() => import('@/features/admin/AdminStocksPage'), 'AdminStocksPage') },
          { path: 'transactions', element: lazyNamed(() => import('@/features/admin/AdminTransactionsPage'), 'AdminTransactionsPage') },
          { path: 'rapports', element: lazyNamed(() => import('@/features/admin/AdminReportsPage'), 'AdminReportsPage') },
          { path: 'personnalisation', element: lazyNamed(() => import('@/features/admin/AdminCustomizationPage'), 'AdminCustomizationPage') },
          { path: 'notifications', element: lazyNamed(() => import('@/features/admin/AdminNotificationsPage'), 'AdminNotificationsPage') },
          { path: 'parametres', element: lazyNamed(() => import('@/features/admin/AdminSettingsPage'), 'AdminSettingsPage') },
          { path: 'support', element: lazyNamed(() => import('@/features/admin/AdminSupportPage'), 'AdminSupportPage') },
        ],
      },
    ],
  },

  // Fallback
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
