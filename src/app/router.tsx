import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { ClientLayout } from '@/components/layout/ClientLayout';
import { StaffLayout } from '@/components/layout/StaffLayout';

// Client Pages
import { ClientHomePage } from '@/features/client/ClientHomePage';
import { StationsListPage } from '@/features/client/StationsListPage';
import { StationDetailPage } from '@/features/client/StationDetailPage';
import { ReserveProductPage } from '@/features/client/ReserveProductPage';
import { PaymentMobileMoneyPage } from '@/features/client/PaymentMobileMoneyPage';
import { ReservationsListPage } from '@/features/client/ReservationsListPage';
import { QrPage } from '@/features/client/QrPage';
import { NotificationsPage } from '@/features/client/NotificationsPage';
import { ClientProfilePage } from '@/features/client/ClientProfilePage';

// Staff Auth Pages
import { StaffRoleSelectPage } from '@/features/staff/auth/StaffRoleSelectPage';
import { StaffPinLoginPage } from '@/features/staff/auth/StaffPinLoginPage';

// Staff Role Dashboards
import { PompisteDashboardPage } from '@/features/staff/pompiste/PompisteDashboardPage';
import { ChefDePisteDashboardPage } from '@/features/staff/chef-de-piste/ChefDePisteDashboardPage';
import { CaissiereDashboardPage } from '@/features/staff/caissiere/CaissiereDashboardPage';
import { ChefDePosteDashboardPage } from '@/features/staff/chef-de-poste/ChefDePosteDashboardPage';
import { RayonnisteDashboardPage } from '@/features/staff/rayonniste/RayonnisteDashboardPage';
import { AgentComptoirDashboardPage } from '@/features/staff/agent-comptoir/AgentComptoirDashboardPage';
import { GerantDashboardPage } from '@/features/staff/gerant/GerantDashboardPage';

// Staff Shared Sub-pages
import { StaffPumpsPage } from '@/features/staff/shared/pumps/StaffPumpsPage';
import { StaffTeamPage } from '@/features/staff/shared/team/StaffTeamPage';
import { StaffStocksPage } from '@/features/staff/shared/stocks/StaffStocksPage';
import { StaffReportsPage } from '@/features/staff/shared/reports/StaffReportsPage';
import { StaffAlertsPage } from '@/features/staff/shared/alerts/StaffAlertsPage';
import { StaffSettingsPage } from '@/features/staff/shared/settings/StaffSettingsPage';

// Admin Layout & Pages
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage';
import { AdminStationsPage } from '@/features/admin/AdminStationsPage';
import { AdminUsersPage } from '@/features/admin/AdminUsersPage';
import { AdminStocksPage } from '@/features/admin/AdminStocksPage';
import { AdminTransactionsPage } from '@/features/admin/AdminTransactionsPage';
import { AdminReportsPage } from '@/features/admin/AdminReportsPage';
import { AdminCustomizationPage } from '@/features/admin/AdminCustomizationPage';
import { AdminNotificationsPage } from '@/features/admin/AdminNotificationsPage';
import { AdminSettingsPage } from '@/features/admin/AdminSettingsPage';
import { AdminSupportPage } from '@/features/admin/AdminSupportPage';

export const router = createBrowserRouter([
  // ================= CLIENT ROUTES =================
  {
    path: '/',
    element: <ClientLayout />,
    children: [
      { index: true, element: <ClientHomePage /> },
      { path: 'stations', element: <StationsListPage /> },
      { path: 'stations/:stationId', element: <StationDetailPage /> },
      { path: 'stations/:stationId/reserver/:productId', element: <ReserveProductPage /> },
      { path: 'reservations', element: <ReservationsListPage /> },
      { path: 'reservations/:reservationId/paiement', element: <PaymentMobileMoneyPage /> },
      { path: 'qr', element: <QrPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'profil', element: <ClientProfilePage /> },
    ],
  },

  // ================= STAFF AUTH (FULLSCREEN) =================
  {
    path: '/personnel',
    element: <StaffRoleSelectPage />,
  },
  {
    path: '/personnel/connexion/:role',
    element: <StaffPinLoginPage />,
  },

  // ================= STAFF WORKSPACE BY ROLE =================
  {
    path: '/personnel/pompiste',
    element: <StaffLayout />,
    children: [
      { index: true, element: <PompisteDashboardPage /> },
      { path: 'piste', element: <PompisteDashboardPage /> },
      { path: 'boutique', element: <StaffStocksPage /> },
      { path: 'encaissement', element: <StaffPumpsPage /> },
      { path: 'transactions', element: <StaffReportsPage /> },
      { path: 'stocks', element: <StaffStocksPage /> },
      { path: 'rapports', element: <StaffReportsPage /> },
      { path: 'alertes', element: <StaffAlertsPage /> },
      { path: 'parametres', element: <StaffSettingsPage /> },
    ],
  },
  {
    path: '/personnel/chef-de-piste',
    element: <StaffLayout />,
    children: [
      { index: true, element: <ChefDePisteDashboardPage /> },
      { path: 'pompes', element: <StaffPumpsPage /> },
      { path: 'equipe', element: <StaffTeamPage /> },
      { path: 'stocks', element: <StaffStocksPage /> },
      { path: 'rapports', element: <StaffReportsPage /> },
      { path: 'alertes', element: <StaffAlertsPage /> },
      { path: 'parametres', element: <StaffSettingsPage /> },
    ],
  },
  {
    path: '/personnel/caissiere',
    element: <StaffLayout />,
    children: [
      { index: true, element: <CaissiereDashboardPage /> },
      { path: 'produits', element: <StaffStocksPage /> },
      { path: 'stocks', element: <StaffStocksPage /> },
      { path: 'rapports', element: <StaffReportsPage /> },
      { path: 'alertes', element: <StaffAlertsPage /> },
      { path: 'parametres', element: <StaffSettingsPage /> },
    ],
  },
  {
    path: '/personnel/chef-de-poste',
    element: <StaffLayout />,
    children: [
      { index: true, element: <ChefDePosteDashboardPage /> },
      { path: 'equipe', element: <StaffTeamPage /> },
      { path: 'pompes', element: <StaffPumpsPage /> },
      { path: 'stocks', element: <StaffStocksPage /> },
      { path: 'rapports', element: <StaffReportsPage /> },
      { path: 'incidents', element: <StaffAlertsPage /> },
      { path: 'parametres', element: <StaffSettingsPage /> },
    ],
  },
  {
    path: '/personnel/rayonniste',
    element: <StaffLayout />,
    children: [
      { index: true, element: <RayonnisteDashboardPage /> },
      { path: 'rayons', element: <StaffStocksPage /> },
      { path: 'stocks', element: <StaffStocksPage /> },
      { path: 'reassort', element: <StaffStocksPage /> },
      { path: 'alertes', element: <StaffAlertsPage /> },
      { path: 'parametres', element: <StaffSettingsPage /> },
    ],
  },
  {
    path: '/personnel/agent-comptoir',
    element: <StaffLayout />,
    children: [
      { index: true, element: <AgentComptoirDashboardPage /> },
      { path: 'commandes', element: <AgentComptoirDashboardPage /> },
      { path: 'produits', element: <StaffStocksPage /> },
      { path: 'rapports', element: <StaffReportsPage /> },
      { path: 'parametres', element: <StaffSettingsPage /> },
    ],
  },
  {
    path: '/personnel/gerant',
    element: <StaffLayout />,
    children: [
      { index: true, element: <GerantDashboardPage /> },
      { path: 'equipe', element: <StaffTeamPage /> },
      { path: 'pompes', element: <StaffPumpsPage /> },
      { path: 'stocks', element: <StaffStocksPage /> },
      { path: 'finances', element: <StaffReportsPage /> },
      { path: 'rapports', element: <StaffReportsPage /> },
      { path: 'incidents', element: <StaffAlertsPage /> },
      { path: 'parametres', element: <StaffSettingsPage /> },
    ],
  },

  // ================= ADMIN CONSOLE (GLOBAL NETWORK MANAGEMENT) =================
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'stations', element: <AdminStationsPage /> },
      { path: 'utilisateurs', element: <AdminUsersPage /> },
      { path: 'stocks', element: <AdminStocksPage /> },
      { path: 'transactions', element: <AdminTransactionsPage /> },
      { path: 'rapports', element: <AdminReportsPage /> },
      { path: 'personnalisation', element: <AdminCustomizationPage /> },
      { path: 'notifications', element: <AdminNotificationsPage /> },
      { path: 'parametres', element: <AdminSettingsPage /> },
      { path: 'support', element: <AdminSupportPage /> },
    ],
  },

  // Fallback
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
