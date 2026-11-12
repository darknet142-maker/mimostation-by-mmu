export type StaffRole =
  | 'pompiste'
  | 'chef-de-piste'
  | 'caissiere'
  | 'rayonniste'
  | 'agent-comptoir'
  | 'chef-de-poste'
  | 'gerant';

export interface RoleInfo {
  role: StaffRole;
  title: string;
  subtitle: string;
  defaultEmployeeName: string;
  avatar: string;
  defaultPin: string;
}

export interface Employee {
  id: string;
  name: string;
  role: StaffRole;
  title: string;
  subtitle: string;
  avatar: string;
  status: 'active' | 'break' | 'offline';
  stationId: string;
  pin: string;
  assignedPumps?: number[]; // [1] pour Pompe 1, ou [1, 2]
  assignedScope?: string; // ex: "Pompe #1 (Super)", "Caisse Principale & Boutique", "Supervision Piste"
}

export interface StationServiceOverview {
  pumpsTotal: number;
  pumpsAvailable: number;
  hasBoutique: boolean;
  hasCafe: boolean;
  hasCarWash: boolean;
  hasLubricants?: boolean;
  hasGas?: boolean;
  hasTyreService?: boolean;
  hasMechanic?: boolean;
}

export interface StationAdvancedSettings {
  enableReservations: boolean;
  enableMobileMoney: boolean;
  enableClientNotifications: boolean;
  reservationDurationMin?: number;
  airtelMoneyNumber?: string;
  moovMoneyNumber?: string;
  acceptsCash?: boolean;
  acceptsCards?: boolean;
  openingTime?: string;
  closingTime?: string;
  minStockAlertPercent?: number;
}

export interface Station {
  id: string;
  name: string;
  code?: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  managerName?: string;
  description?: string;
  distanceKm: number;
  isOpen24h: boolean;
  isOpen: boolean;
  services: StationServiceOverview;
  isFavorite?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  canopyTheme?: 'classic-blue' | 'night-edition' | 'eco-green' | 'neon-tech' | 'minimal-blue' | 'urban-orange';
  layoutStyle?: 'standard' | 'compact' | 'dense';
  bannerImage?: string;
  status?: 'active' | 'maintenance' | 'closed';
  advancedSettings?: StationAdvancedSettings;
}

export interface NetworkConfig {
  platformName: string;
  platformSlogan: string;
  currency: string;
  supportPhone: string;
  supportEmail: string;
  systemTheme: 'navy-pro' | 'slate-dark' | 'emerald-clean' | 'royal-blue';
  fuelPrices: {
    super: number;
    gasoil: number;
    petroleLampant: number;
    gazButane: number;
  };
  enableNetworkAlerts: boolean;
  enableGlobalMobileMoney: boolean;
}

export type ProductCategory =
  | 'carburant'
  | 'gaz'
  | 'lubrifiants'
  | 'boutique'
  | 'auto';

export interface Product {
  id: string;
  stationId?: string;
  name: string;
  category: ProductCategory;
  subtitle: string;
  priceFCFA: number;
  unit: string;
  image: string;
  isAvailable: boolean;
  stockQuantity: number;
  minStockThreshold: number;
}

export type PumpStatus = 'available' | 'busy' | 'maintenance' | 'offline';

export interface Pump {
  id: string;
  number: number;
  fuelType: 'Super' | 'Gasoil';
  status: PumpStatus;
  litersToday: number;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
}

export interface TankLevel {
  id: string;
  fuelType: 'Super' | 'Gasoil' | 'Gaz Butane';
  currentLiters: number;
  capacityLiters: number;
  levelPercent: number;
  status: 'ok' | 'low' | 'critical';
}

export interface FuelTransaction {
  id: string;
  time: string;
  pumpNumber: number;
  product: string;
  quantityLiters: number;
  amountFCFA: number;
  paymentMethod: 'Mobile Money' | 'Espèces' | 'Carte';
  status: 'OK' | 'En attente' | 'Annulé';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface BoutiqueSale {
  id: string;
  saleNumber: string; // e.g. "VTE-20261110-048"
  ticketNumber: string; // e.g. "TKT-20261110-048"
  time: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPriceFCFA: number;
    totalFCFA: number;
  }[];
  totalFCFA: number;
  paymentMethod: 'Mobile Money' | 'Espèces';
  cashierName: string;
  status: 'confirmed' | 'refunded';
}

export type ReservationStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'paid'
  | 'collected'
  | 'expired'
  | 'cancelled';

export interface Reservation {
  id: string;
  code: string; // e.g. "STP-20261110-458"
  productId: string;
  productName: string;
  productSubtitle: string;
  productImage: string;
  quantity: number;
  unit: string;
  unitPriceFCFA: number;
  totalFCFA: number;
  stationId: string;
  stationName: string;
  paymentMethod: 'place' | 'mobile_money';
  status: ReservationStatus;
  createdAt: string;
  expiresAt: string; // ISO date, +30 min
}

export interface AlertNotification {
  id: string;
  type: 'danger' | 'info' | 'success';
  title: string;
  subtitle: string;
  time: string;
  isRead: boolean;
  targetRole?: StaffRole;
}

export type AuditActionType =
  | 'CREATION_PRODUIT'
  | 'MODIFICATION_STOCK'
  | 'MODIFICATION_PRIX'
  | 'SUPPRESSION_PRODUIT'
  | 'AJOUT_EMPLOYE'
  | 'MODIFICATION_EMPLOYE'
  | 'SUPPRESSION_EMPLOYE'
  | 'CREATION_STATION'
  | 'MODIFICATION_STATION'
  | 'SUPPRESSION_STATION'
  | 'PERSONNALISATION_STATION'
  | 'LIVRAISON_CUVE'
  | 'CONFIGURATION_POMPE'
  | 'CONFIGURATION_RESEAU';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO date
  dateFormatted: string; // "11/11/2026" (J/M/A)
  timeFormatted: string; // "19:25:30"
  authorName: string;
  authorRole: string;
  actionType: AuditActionType;
  targetType: 'product' | 'employee' | 'station';
  targetId: string;
  targetName: string;
  oldValue?: string;
  newValue?: string;
  details: string;
  hash: string; // Empreinte de contrôle infalsifiable
}

export interface DailyMetrics {
  fuelRevenueFCFA: number;
  boutiqueRevenueFCFA: number;
  totalRevenueFCFA: number;
  transactionsCount: number;
  growthPercentVsYesterday: number;
  hourlySales: { hour: string; amountFCFA: number }[];
  categoryBreakdown: {
    superPercent: number;
    gasoilPercent: number;
    gazButanePercent: number;
    boutiquePercent: number;
  };
}

