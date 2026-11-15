import {
  Station,
  Employee,
  Product,
  Pump,
  TankLevel,
  FuelTransaction,
  BoutiqueSale,
  CounterOrder,
  Reservation,
  AlertNotification,
  DailyMetrics,
  CartItem,
  StaffRole,
  AuditLogEntry,
  AuditActionType,
  NetworkConfig,
  AdminSession,
  HomeAdBannerSlide,
} from '@/types';
import {
  INITIAL_STATIONS,
  INITIAL_EMPLOYEES,
  INITIAL_PRODUCTS,
  INITIAL_PUMPS,
  INITIAL_TANKS,
  INITIAL_FUEL_TRANSACTIONS,
  INITIAL_BOUTIQUE_SALES,
  INITIAL_COUNTER_ORDERS,
  INITIAL_RESERVATIONS,
  INITIAL_ALERTS,
  INITIAL_DAILY_METRICS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NETWORK_CONFIG,
  INITIAL_HOME_AD_BANNERS,
  ROLE_DEFINITIONS,
} from '@/data/fixtures';
import { sha256Hex } from '@/utils/crypto';

export type ReservationResult =
  | { success: true; reservation: Reservation }
  | { success: false; error: string };

export interface AppState {
  networkConfig: NetworkConfig;
  stations: Station[];
  selectedStationId: string;
  employees: Employee[];
  currentEmployee: Employee | null;
  adminSession: AdminSession | null;
  products: Product[];
  pumps: Pump[];
  tanks: TankLevel[];
  fuelTransactions: FuelTransaction[];
  boutiqueSales: BoutiqueSale[];
  counterOrders: CounterOrder[];
  cart: CartItem[];
  lastCompletedSale: BoutiqueSale | null;
  reservations: Reservation[];
  alerts: AlertNotification[];
  dailyMetrics: DailyMetrics;
  auditLogs: AuditLogEntry[];
  homeAdBanners: HomeAdBannerSlide[];
}

const STORAGE_KEY = 'stationpro_state_v5';
const ADMIN_ACCESS_CODE = import.meta.env.VITE_ADMIN_ACCESS_CODE || '202699';
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function checkLockout(key: string): string | null {
  const rec = loginAttempts.get(key);
  if (!rec) return null;
  const remainingMs = rec.lockedUntil - Date.now();
  if (remainingMs > 0) {
    const secs = Math.ceil(remainingMs / 1000);
    return `Trop de tentatives infructueuses. Réessayez dans ${secs} s.`;
  }
  return null;
}

function recordFailedAttempt(key: string): void {
  const prev = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  const nextCount = prev.count + 1;
  loginAttempts.set(key, {
    count: nextCount,
    lockedUntil: nextCount >= 5 ? Date.now() + 30_000 : 0,
  });
}

function clearAttempts(key: string): void {
  loginAttempts.delete(key);
}

function loadInitialState(): AppState {
  const seed = getSeedState();
  if (typeof window === 'undefined') {
    return seed;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const mergedStations = seed.stations.map(seedStation => {
        const existing = Array.isArray(parsed.stations)
          ? parsed.stations.find((s: Station) => s.id === seedStation.id)
          : null;
        return existing
          ? {
              ...seedStation,
              ...existing,
              primaryColor: existing.primaryColor || seedStation.primaryColor,
              secondaryColor: existing.secondaryColor || seedStation.secondaryColor,
              canopyTheme: existing.canopyTheme || seedStation.canopyTheme,
              phone: existing.phone || seedStation.phone,
              description: existing.description || seedStation.description,
              status: existing.status || seedStation.status,
              services: { ...seedStation.services, ...(existing.services || {}) },
              advancedSettings: { ...seedStation.advancedSettings, ...(existing.advancedSettings || {}) },
            }
          : seedStation;
      });
      const extraStations = Array.isArray(parsed.stations)
        ? parsed.stations.filter((s: Station) => !seed.stations.some(seedSt => seedSt.id === s.id))
        : [];
      const finalStations = [...mergedStations, ...extraStations];

      return {
        ...seed,
        ...parsed,
        networkConfig: parsed.networkConfig ? { ...seed.networkConfig, ...parsed.networkConfig } : seed.networkConfig,
        stations: finalStations,
        selectedStationId: parsed.selectedStationId || seed.selectedStationId,
        employees: (() => {
          if (!Array.isArray(parsed.employees) || parsed.employees.length === 0) {
            return seed.employees;
          }
          const patched = parsed.employees.map((e: Employee) =>
            e.id === 'emp-4' && e.pin === '3310' && e.role === 'pompiste'
              ? seed.employees.find(se => se.id === 'emp-4') || e
              : e
          );
          const missingSeed = seed.employees.filter(
            se => !patched.some((e: Employee) => e.id === se.id)
          );
          return [...patched, ...missingSeed];
        })(),
        currentEmployee: parsed.currentEmployee ?? null,
        adminSession: parsed.adminSession ?? null,
        products:
          Array.isArray(parsed.products) && parsed.products.length > 0
            ? [
                ...parsed.products,
                ...seed.products.filter(
                  sp => !parsed.products.some((p: Product) => p.id === sp.id)
                ),
              ]
            : seed.products,
        pumps:
          Array.isArray(parsed.pumps) && parsed.pumps.length > 0
            ? [
                ...parsed.pumps.map((p: Pump) => ({
                  ...p,
                  stationId: p.stationId || 'station-liberte',
                })),
                ...seed.pumps.filter(
                  sp => !parsed.pumps.some((p: Pump) => p.id === sp.id)
                ),
              ]
            : seed.pumps,
        tanks: Array.isArray(parsed.tanks) && parsed.tanks.length > 0
          ? parsed.tanks.map((t: TankLevel) => ({ ...t, stationId: t.stationId || 'station-liberte' }))
          : seed.tanks,
        fuelTransactions: Array.isArray(parsed.fuelTransactions)
          ? parsed.fuelTransactions.map((tx: FuelTransaction) => ({ ...tx, stationId: tx.stationId || 'station-liberte' }))
          : seed.fuelTransactions,
        boutiqueSales: Array.isArray(parsed.boutiqueSales)
          ? parsed.boutiqueSales.map((bs: BoutiqueSale) => ({ ...bs, stationId: bs.stationId || 'station-liberte' }))
          : seed.boutiqueSales,
        counterOrders: Array.isArray(parsed.counterOrders) ? parsed.counterOrders : seed.counterOrders,
        cart: Array.isArray(parsed.cart) ? parsed.cart : seed.cart,
        lastCompletedSale: parsed.lastCompletedSale || seed.lastCompletedSale,
        reservations: Array.isArray(parsed.reservations) ? parsed.reservations : seed.reservations,
        alerts: Array.isArray(parsed.alerts)
          ? parsed.alerts.map((a: AlertNotification) => ({ ...a, audience: a.audience || 'staff' }))
          : seed.alerts,
        dailyMetrics: parsed.dailyMetrics || seed.dailyMetrics,
        auditLogs: Array.isArray(parsed.auditLogs) && parsed.auditLogs.length > 0 ? parsed.auditLogs : seed.auditLogs,
        homeAdBanners:
          Array.isArray(parsed.homeAdBanners) && parsed.homeAdBanners.length > 0
            ? parsed.homeAdBanners
            : seed.homeAdBanners,
      };
    }
  } catch (e) {
    console.warn('Failed to parse localStorage, resetting state', e);
  }
  return seed;
}

function getSeedState(): AppState {
  return {
    networkConfig: INITIAL_NETWORK_CONFIG,
    stations: INITIAL_STATIONS,
    selectedStationId: 'station-liberte',
    employees: INITIAL_EMPLOYEES,
    currentEmployee: null,
    adminSession: null,
    products: INITIAL_PRODUCTS,
    pumps: INITIAL_PUMPS,
    tanks: INITIAL_TANKS,
    fuelTransactions: INITIAL_FUEL_TRANSACTIONS,
    boutiqueSales: INITIAL_BOUTIQUE_SALES,
    counterOrders: INITIAL_COUNTER_ORDERS,
    cart: [
      { product: INITIAL_PRODUCTS.find(p => p.id === 'pos-eau-50cl')!, quantity: 1 },
      { product: INITIAL_PRODUCTS.find(p => p.id === 'pos-chips')!, quantity: 1 },
      { product: INITIAL_PRODUCTS.find(p => p.id === 'pos-jus-tropical')!, quantity: 1 },
    ],
    lastCompletedSale: INITIAL_BOUTIQUE_SALES[0],
    reservations: INITIAL_RESERVATIONS,
    alerts: INITIAL_ALERTS,
    dailyMetrics: INITIAL_DAILY_METRICS,
    auditLogs: INITIAL_AUDIT_LOGS,
    homeAdBanners: INITIAL_HOME_AD_BANNERS,
  };
}

let state: AppState = loadInitialState();
const listeners = new Set<() => void>();

function notify() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }
  listeners.forEach(fn => fn());
}

export const store = {
  getSnapshot(): AppState {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // --- CLIENT ACTIONS ---
  setSelectedStation(stationId: string) {
    state = { ...state, selectedStationId: stationId };
    notify();
  },

  toggleFavoriteStation(stationId: string) {
    state = {
      ...state,
      stations: state.stations.map(st =>
        st.id === stationId ? { ...st, isFavorite: !st.isFavorite } : st
      ),
    };
    notify();
  },

  createReservation(params: {
    productId: string;
    stationId: string;
    quantity: number;
    paymentMethod: 'place' | 'mobile_money';
  }): ReservationResult {
    const product = state.products.find(p => p.id === params.productId);
    const station = state.stations.find(s => s.id === params.stationId);
    if (!product || !station) {
      return { success: false, error: 'Produit ou station introuvable.' };
    }
    if (station.status === 'maintenance' || station.status === 'closed' || !station.isOpen) {
      return { success: false, error: `${station.name} est actuellement fermée ou en maintenance.` };
    }
    if (station.advancedSettings?.enableReservations === false) {
      return { success: false, error: `Les réservations en ligne sont désactivées sur ${station.name}.` };
    }
    if (params.quantity <= 0 || !Number.isFinite(params.quantity)) {
      return { success: false, error: 'La quantité demandée est invalide.' };
    }
    if (!product.isAvailable || product.stockQuantity < params.quantity) {
      return {
        success: false,
        error: `Stock insuffisant pour ${product.name} (${product.stockQuantity} ${product.unit} disponible(s)).`,
      };
    }

    const durationMin = station.advancedSettings?.reservationDurationMin ?? 30;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const code = `STP-${dateStr}-${randomSeq}`;
    const total = product.priceFCFA * params.quantity;

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      code,
      productId: product.id,
      productName: product.name,
      productSubtitle: product.subtitle,
      productImage: product.image,
      quantity: params.quantity,
      unit: product.unit,
      unitPriceFCFA: product.priceFCFA,
      totalFCFA: total,
      stationId: station.id,
      stationName: station.name,
      paymentMethod: params.paymentMethod,
      status: params.paymentMethod === 'mobile_money' ? 'awaiting_payment' : 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + durationMin * 60 * 1000).toISOString(),
    };

    const updatedProducts = state.products.map(p =>
      p.id === product.id
        ? {
            ...p,
            stockQuantity: Math.max(0, p.stockQuantity - params.quantity),
            isAvailable: p.stockQuantity - params.quantity > 0,
          }
        : p
    );

    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const staffAlert: AlertNotification = {
      id: `alt-${Date.now()}`,
      stationId: station.id,
      audience: 'staff',
      type: 'info',
      title: `Nouvelle réservation : ${product.name} (x${params.quantity})`,
      subtitle: `Code ${code} • ${station.name}`,
      time: nowTime,
      isRead: false,
    };

    state = {
      ...state,
      products: updatedProducts,
      reservations: [newRes, ...state.reservations],
      alerts: [staffAlert, ...state.alerts],
    };
    notify();
    return { success: true, reservation: newRes };
  },

  cancelReservation(reservationId: string) {
    const target = state.reservations.find(r => r.id === reservationId);
    if (!target || target.status === 'cancelled' || target.status === 'collected') return;

    const restockQty = target.status === 'pending' || target.status === 'awaiting_payment' ? target.quantity : 0;
    state = {
      ...state,
      products: restockQty > 0
        ? state.products.map(p =>
            p.id === target.productId
              ? { ...p, stockQuantity: p.stockQuantity + restockQty, isAvailable: true }
              : p
          )
        : state.products,
      reservations: state.reservations.map(r =>
        r.id === reservationId ? { ...r, status: 'cancelled' } : r
      ),
    };
    notify();
  },

  confirmReservationPayment(reservationId: string) {
    const target = state.reservations.find(r => r.id === reservationId);
    if (!target || target.status === 'paid' || target.status === 'cancelled' || target.status === 'expired') return;

    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const clientAlert: AlertNotification = {
      id: `alt-pay-client-${Date.now()}`,
      stationId: target.stationId,
      audience: 'client',
      type: 'success',
      title: `Paiement confirmé • ${target.code}`,
      subtitle: `Votre retrait de ${target.productName} à ${target.stationName} est prêt.`,
      time: nowTime,
      isRead: false,
    };
    const staffAlert: AlertNotification = {
      id: `alt-pay-staff-${Date.now()}`,
      stationId: target.stationId,
      audience: 'staff',
      type: 'success',
      title: `Encaissement Mobile Money confirmé : ${target.code}`,
      subtitle: `${target.totalFCFA.toLocaleString('fr-FR')} FCFA • ${target.stationName}`,
      time: nowTime,
      isRead: false,
    };
    const auditEntry = createAuditLog(
      'PAIEMENT_CONFIRME',
      'reservation',
      target.id,
      target.code,
      `Confirmation paiement Mobile Money de ${target.totalFCFA} FCFA (${target.stationName})`,
      target.status,
      'paid',
      'Passerelle Mobile Money',
      'Système Paiement'
    );

    state = {
      ...state,
      reservations: state.reservations.map(r =>
        r.id === reservationId ? { ...r, status: 'paid' } : r
      ),
      alerts: [staffAlert, clientAlert, ...state.alerts],
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
  },

  sweepExpiredReservations() {
    const nowMs = Date.now();
    const expiredIds = new Set<string>();
    const restockByProduct = new Map<string, number>();

    for (const r of state.reservations) {
      if ((r.status === 'pending' || r.status === 'awaiting_payment') && new Date(r.expiresAt).getTime() <= nowMs) {
        expiredIds.add(r.id);
        restockByProduct.set(r.productId, (restockByProduct.get(r.productId) || 0) + r.quantity);
      }
    }
    if (expiredIds.size === 0) return;

    state = {
      ...state,
      reservations: state.reservations.map(r =>
        expiredIds.has(r.id) ? { ...r, status: 'expired' } : r
      ),
      products: state.products.map(p => {
        const add = restockByProduct.get(p.id) || 0;
        return add > 0 ? { ...p, stockQuantity: p.stockQuantity + add, isAvailable: true } : p;
      }),
    };
    notify();
  },

  // --- STAFF & ADMIN AUTH ACTIONS ---
  login(role: StaffRole, pin: string, stationId?: string): { success: boolean; message?: string } {
    const roleDef = ROLE_DEFINITIONS.find(r => r.role === role);
    if (!roleDef) return { success: false, message: 'Rôle inconnu' };

    const cleanPin = pin.trim();
    const targetStationId = stationId || state.selectedStationId || state.stations[0]?.id || 'station-liberte';
    const lockKey = `staff:${role}:${targetStationId}`;
    const lockMsg = checkLockout(lockKey);
    if (lockMsg) return { success: false, message: lockMsg };

    // 1. Exact station + role + pin match
    let matched = state.employees.find(
      e => e.role === role && e.pin === cleanPin && e.stationId === targetStationId
    );

    // 2. Fallback: employee with matching role & pin on the network (allows multi-station demo testing)
    if (!matched) {
      const networkMatch = state.employees.find(e => e.role === role && e.pin === cleanPin);
      if (networkMatch) {
        matched = { ...networkMatch, stationId: targetStationId };
      }
    }

    // 3. Fallback: official demo PIN for the requested role on any station
    if (!matched && cleanPin === roleDef.defaultPin) {
      matched = {
        id: `emp-demo-${role}`,
        name: roleDef.defaultEmployeeName,
        role: roleDef.role,
        title: roleDef.title,
        subtitle: roleDef.subtitle,
        avatar: roleDef.avatar,
        status: 'active',
        stationId: targetStationId,
        pin: roleDef.defaultPin,
      };
    }

    if (matched) {
      clearAttempts(lockKey);
      state = {
        ...state,
        currentEmployee: matched,
        selectedStationId: targetStationId,
      };
      notify();
      return { success: true };
    }

    recordFailedAttempt(lockKey);
    return {
      success: false,
      message: `Code PIN incorrect. PIN démo pour ${roleDef.title} : ${roleDef.defaultPin}`,
    };
  },

  logout() {
    state = { ...state, currentEmployee: null };
    notify();
  },

  loginAdmin(code: string): { success: boolean; message?: string } {
    const lockKey = 'admin:console';
    const lockMsg = checkLockout(lockKey);
    if (lockMsg) return { success: false, message: lockMsg };

    if (code.trim() !== ADMIN_ACCESS_CODE) {
      recordFailedAttempt(lockKey);
      return { success: false, message: 'Code administrateur invalide.' };
    }

    clearAttempts(lockKey);
    const session: AdminSession = {
      isAuthenticated: true,
      name: 'Admin Global',
      email: state.networkConfig.supportEmail,
      loginAt: new Date().toISOString(),
    };
    const auditEntry = createAuditLog(
      'ADMIN_CONNEXION',
      'admin',
      'admin-global',
      'Console Réseau 360°',
      'Ouverture session Super Administrateur',
      'Hors ligne',
      'Authentifié',
      session.name,
      'Super Administrateur'
    );

    state = {
      ...state,
      adminSession: session,
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
    return { success: true };
  },

  logoutAdmin() {
    state = { ...state, adminSession: null };
    notify();
  },

  setCurrentRole(role: StaffRole) {
    const roleDef = ROLE_DEFINITIONS.find(r => r.role === role);
    const emp = state.employees.find(e => e.role === role) || {
      id: `emp-demo-${role}`,
      name: roleDef?.defaultEmployeeName || 'Agent',
      role,
      title: roleDef?.title || 'Agent',
      subtitle: roleDef?.subtitle || 'Service',
      avatar: roleDef?.avatar || '',
      status: 'active' as const,
      stationId: state.selectedStationId,
      pin: roleDef?.defaultPin || '0000',
    };
    state = {
      ...state,
      currentEmployee: emp,
      selectedStationId: emp.stationId || state.selectedStationId,
    };
    notify();
  },

  // --- POMPISTE / PUMPS ACTIONS ---
  updatePumpStatus(pumpNumber: number, status: Pump['status'], stationId?: string) {
    const targetStationId = stationId || state.currentEmployee?.stationId || state.selectedStationId;
    state = {
      ...state,
      pumps: state.pumps.map(p =>
        p.number === pumpNumber && p.stationId === targetStationId ? { ...p, status } : p
      ),
    };
    notify();
  },

  recordFuelTransaction(params: {
    pumpNumber: number;
    product: string;
    quantityLiters: number;
    amountFCFA: number;
    paymentMethod: 'Mobile Money' | 'Espèces' | 'Carte';
    stationId?: string;
  }): { success: boolean; message?: string } {
    const targetStationId = params.stationId || state.currentEmployee?.stationId || state.selectedStationId;
    const pump = state.pumps.find(p => p.stationId === targetStationId && p.number === params.pumpNumber);
    if (!pump) {
      return { success: false, message: `Pompe #${params.pumpNumber} introuvable sur cette station.` };
    }
    if (pump.status !== 'available') {
      return { success: false, message: `Pompe #${params.pumpNumber} indisponible (${pump.status}).` };
    }
    if (params.quantityLiters <= 0 || !Number.isFinite(params.quantityLiters)) {
      return { success: false, message: 'Volume à servir invalide.' };
    }

    const lowerProd = params.product.toLowerCase();
    const targetFuelType: TankLevel['fuelType'] = lowerProd.includes('super')
      ? 'Super'
      : lowerProd.includes('pétrole') || lowerProd.includes('petrole')
      ? 'Pétrole Lampant'
      : 'Gasoil';

    const matchingTank = state.tanks.find(
      t => t.stationId === targetStationId && t.fuelType === targetFuelType
    );
    if (matchingTank && matchingTank.currentLiters < params.quantityLiters) {
      return {
        success: false,
        message: `Niveau cuve ${targetFuelType} insuffisant (${matchingTank.currentLiters.toLocaleString('fr-FR')} L restants).`,
      };
    }

    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newTx: FuelTransaction = {
      id: `tx-${Date.now()}`,
      stationId: targetStationId,
      time: nowTime,
      pumpNumber: params.pumpNumber,
      product: params.product,
      quantityLiters: params.quantityLiters,
      amountFCFA: params.amountFCFA,
      paymentMethod: params.paymentMethod,
      status: 'OK',
    };

    const updatedPumps = state.pumps.map(p =>
      p.id === pump.id ? { ...p, litersToday: p.litersToday + params.quantityLiters } : p
    );

    const updatedTanks = state.tanks.map(tank => {
      if (tank.stationId === targetStationId && tank.fuelType === targetFuelType) {
        const newLiters = Math.max(0, tank.currentLiters - params.quantityLiters);
        const newPercent = Math.round((newLiters / tank.capacityLiters) * 100);
        return {
          ...tank,
          currentLiters: newLiters,
          levelPercent: newPercent,
          status: (newPercent <= 15 ? 'critical' : newPercent <= 30 ? 'low' : 'ok') as TankLevel['status'],
        };
      }
      return tank;
    });

    const updatedMetrics: DailyMetrics = {
      ...state.dailyMetrics,
      fuelRevenueFCFA: state.dailyMetrics.fuelRevenueFCFA + params.amountFCFA,
      totalRevenueFCFA: state.dailyMetrics.totalRevenueFCFA + params.amountFCFA,
      transactionsCount: state.dailyMetrics.transactionsCount + 1,
    };

    state = {
      ...state,
      fuelTransactions: [newTx, ...state.fuelTransactions],
      pumps: updatedPumps,
      tanks: updatedTanks,
      dailyMetrics: updatedMetrics,
    };
    notify();
    return { success: true };
  },

  reportIncident(title: string, subtitle: string, stationId?: string) {
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newAlert: AlertNotification = {
      id: `inc-${Date.now()}`,
      stationId: stationId || state.currentEmployee?.stationId || state.selectedStationId,
      audience: 'staff',
      type: 'danger',
      title,
      subtitle,
      time: nowTime,
      isRead: false,
    };
    state = {
      ...state,
      alerts: [newAlert, ...state.alerts],
    };
    notify();
  },

  requestRestockAlert(productName: string, currentQty: number, stationId?: string) {
    const targetStationId = stationId || state.currentEmployee?.stationId || state.selectedStationId;
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newAlert: AlertNotification = {
      id: `restock-${Date.now()}`,
      stationId: targetStationId,
      audience: 'staff',
      type: 'info',
      title: `Demande réassort rayon : ${productName}`,
      subtitle: `Stock restant : ${currentQty} • Signalé par ${state.currentEmployee?.name || 'Rayonniste'}`,
      time: nowTime,
      isRead: false,
      targetRole: 'gerant',
    };
    const auditEntry = createAuditLog(
      'REASSORT_DEMANDE',
      'product',
      productName,
      productName,
      `Signalement besoin de réassort rayon (${currentQty} restants)`,
      `${currentQty}`,
      'Réassort demandé',
      state.currentEmployee?.name || 'Rayonniste',
      state.currentEmployee?.title || 'Rayonniste'
    );
    state = {
      ...state,
      alerts: [newAlert, ...state.alerts],
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
  },

  // --- COUNTER / CAFE ORDERS ---
  advanceCounterOrder(orderId: string) {
    state = {
      ...state,
      counterOrders: state.counterOrders.map(o => {
        if (o.id !== orderId) return o;
        const nextStatus: CounterOrder['status'] =
          o.status === 'pending' ? 'ready' : o.status === 'ready' ? 'served' : 'served';
        return { ...o, status: nextStatus };
      }),
    };
    notify();
  },

  addCounterOrder(params: { item: string; customer: string; totalFCFA: number; stationId?: string }) {
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newOrder: CounterOrder = {
      id: `cmd-${Date.now()}`,
      stationId: params.stationId || state.currentEmployee?.stationId || state.selectedStationId,
      time: nowTime,
      item: params.item,
      customer: params.customer,
      totalFCFA: params.totalFCFA,
      status: 'pending',
    };
    state = {
      ...state,
      counterOrders: [newOrder, ...state.counterOrders],
    };
    notify();
    return newOrder;
  },

  // --- BOUTIQUE / POS ACTIONS ---
  addToCart(product: Product) {
    const existing = state.cart.find(c => c.product.id === product.id);
    if (existing) {
      state = {
        ...state,
        cart: state.cart.map(c =>
          c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        ),
      };
    } else {
      state = {
        ...state,
        cart: [...state.cart, { product, quantity: 1 }],
      };
    }
    notify();
  },

  updateCartQuantity(productId: string, delta: number) {
    state = {
      ...state,
      cart: state.cart
        .map(c => {
          if (c.product.id === productId) {
            const next = c.quantity + delta;
            return next > 0 ? { ...c, quantity: next } : null;
          }
          return c;
        })
        .filter((c): c is CartItem => c !== null),
    };
    notify();
  },

  removeFromCart(productId: string) {
    state = {
      ...state,
      cart: state.cart.filter(c => c.product.id !== productId),
    };
    notify();
  },

  clearCart() {
    state = { ...state, cart: [] };
    notify();
  },

  checkoutBoutiqueSale(paymentMethod: 'Mobile Money' | 'Espèces'): BoutiqueSale | null {
    if (state.cart.length === 0) return null;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const saleSeq = String(state.boutiqueSales.length + 49).padStart(3, '0');
    const saleNumber = `VTE-${dateStr}-${saleSeq}`;
    const ticketNumber = `TKT-${dateStr}-${saleSeq}`;
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    let total = 0;
    const saleItems = state.cart.map(c => {
      const lineTotal = c.product.priceFCFA * c.quantity;
      total += lineTotal;
      return {
        productId: c.product.id,
        productName: c.product.name,
        quantity: c.quantity,
        unitPriceFCFA: c.product.priceFCFA,
        totalFCFA: lineTotal,
      };
    });

    const newSale: BoutiqueSale = {
      id: `sale-${Date.now()}`,
      stationId: state.currentEmployee?.stationId || state.selectedStationId,
      saleNumber,
      ticketNumber,
      time: nowTime,
      items: saleItems,
      totalFCFA: total,
      paymentMethod,
      cashierName: state.currentEmployee?.name || 'Mireille BIBANG',
      status: 'confirmed',
    };

    // Decrement products stock
    const updatedProducts = state.products.map(p => {
      const cartItem = state.cart.find(c => c.product.id === p.id);
      if (cartItem) {
        return {
          ...p,
          stockQuantity: Math.max(0, p.stockQuantity - cartItem.quantity),
        };
      }
      return p;
    });

    // Update metrics
    const updatedMetrics: DailyMetrics = {
      ...state.dailyMetrics,
      boutiqueRevenueFCFA: state.dailyMetrics.boutiqueRevenueFCFA + total,
      totalRevenueFCFA: state.dailyMetrics.totalRevenueFCFA + total,
      transactionsCount: state.dailyMetrics.transactionsCount + 1,
    };

    state = {
      ...state,
      boutiqueSales: [newSale, ...state.boutiqueSales],
      cart: [],
      lastCompletedSale: newSale,
      products: updatedProducts,
      dailyMetrics: updatedMetrics,
    };
    notify();
    return newSale;
  },

  markAlertsAsRead() {
    state = {
      ...state,
      alerts: state.alerts.map(a => ({ ...a, isRead: true })),
    };
    notify();
  },

  toggleEmployeeStatus(employeeId: string) {
    state = {
      ...state,
      employees: state.employees.map(e =>
        e.id === employeeId
          ? { ...e, status: e.status === 'active' ? 'break' : 'active' }
          : e
      ),
    };
    notify();
  },

  // --- GERANT / AUDIT TRAIL IMMUABLE ACTIONS ---
  addProduct(productData: Omit<Product, 'id'>, authorName = 'Alain OBAME') {
    const newId = `prod-${Date.now()}`;
    const targetStationId = productData.stationId || state.selectedStationId;
    const targetStation = state.stations.find(s => s.id === targetStationId);
    const stationName = targetStation?.name || 'Station';

    const newProduct: Product = {
      ...productData,
      id: newId,
      stationId: targetStationId,
    };

    const auditEntry = createAuditLog(
      'CREATION_PRODUIT',
      'product',
      newId,
      newProduct.name,
      `Création du produit ${newProduct.name} pour ${stationName} (Prix : ${newProduct.priceFCFA} FCFA, Stock initial : ${newProduct.stockQuantity} ${newProduct.unit}).`,
      'Non existant',
      `${newProduct.priceFCFA} FCFA (${newProduct.stockQuantity} ${newProduct.unit})`,
      authorName,
      'Gérant'
    );

    state = {
      ...state,
      products: [newProduct, ...state.products],
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
    return newProduct;
  },

  updateProduct(
    productId: string,
    updates: Partial<Product>,
    authorName = 'Alain OBAME',
    reason = 'Mise à jour régulière'
  ) {
    const current = state.products.find(p => p.id === productId);
    if (!current) return;

    let actionType: AuditActionType = 'MODIFICATION_STOCK';
    let oldVal = '';
    let newVal = '';

    if (updates.priceFCFA !== undefined && updates.priceFCFA !== current.priceFCFA) {
      actionType = 'MODIFICATION_PRIX';
      oldVal = `${current.priceFCFA} FCFA`;
      newVal = `${updates.priceFCFA} FCFA`;
    } else if (updates.stockQuantity !== undefined && updates.stockQuantity !== current.stockQuantity) {
      actionType = 'MODIFICATION_STOCK';
      oldVal = `${current.stockQuantity} ${current.unit}`;
      newVal = `${updates.stockQuantity} ${current.unit}`;
    } else {
      oldVal = JSON.stringify(current);
      newVal = JSON.stringify({ ...current, ...updates });
    }

    const updatedProduct = { ...current, ...updates };

    const auditEntry = createAuditLog(
      actionType,
      'product',
      productId,
      current.name,
      `Modification effectuée sur ${current.name} : ${reason}`,
      oldVal,
      newVal,
      authorName,
      'Gérant'
    );

    state = {
      ...state,
      products: state.products.map(p => (p.id === productId ? updatedProduct : p)),
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
    return updatedProduct;
  },

  deleteProduct(productId: string, authorName = 'Alain OBAME', reason = 'Retrait de référence') {
    const current = state.products.find(p => p.id === productId);
    if (!current) return;

    const auditEntry = createAuditLog(
      'SUPPRESSION_PRODUIT',
      'product',
      productId,
      current.name,
      `Suppression définitive de la référence ${current.name}. Motif : ${reason}`,
      `${current.name} (Stock : ${current.stockQuantity})`,
      'Archivé / Supprimé du catalogue actif',
      authorName,
      'Gérant'
    );

    state = {
      ...state,
      products: state.products.filter(p => p.id !== productId),
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
  },

  addEmployee(employeeData: Omit<Employee, 'id'>, authorName = 'Alain OBAME') {
    const newId = `emp-${Date.now()}`;
    const targetStationId = employeeData.stationId || state.selectedStationId;
    const targetStation = state.stations.find(s => s.id === targetStationId);
    const stationName = targetStation?.name || 'Station';

    const newEmp: Employee = {
      ...employeeData,
      id: newId,
      stationId: targetStationId,
    };

    const auditEntry = createAuditLog(
      'AJOUT_EMPLOYE',
      'employee',
      newId,
      newEmp.name,
      `Recrutement / Affectation de ${newEmp.name} au poste ${newEmp.title} (${stationName}).`,
      'Non existant',
      `${newEmp.title} • PIN configuré • ${stationName}`,
      authorName,
      'Gérant'
    );

    // Synchronize pump assignments if assignedPumps specified
    const updatedPumps = newEmp.assignedPumps && newEmp.assignedPumps.length > 0
      ? state.pumps.map(p =>
          newEmp.assignedPumps?.includes(p.number)
            ? { ...p, assignedEmployeeId: newId, assignedEmployeeName: newEmp.name }
            : p
        )
      : state.pumps;

    state = {
      ...state,
      employees: [...state.employees, newEmp],
      pumps: updatedPumps,
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
    return newEmp;
  },

  updateEmployee(
    employeeId: string,
    updates: Partial<Employee>,
    authorName = 'Alain OBAME',
    reason = 'Ajustement RH'
  ) {
    const current = state.employees.find(e => e.id === employeeId);
    if (!current) return;

    const updatedEmp = { ...current, ...updates };

    const auditEntry = createAuditLog(
      'MODIFICATION_EMPLOYE',
      'employee',
      employeeId,
      current.name,
      `Mise à jour fiche agent ${current.name} : ${reason}`,
      `${current.title} (${current.status})`,
      `${updatedEmp.title} (${updatedEmp.status})`,
      authorName,
      'Gérant'
    );

    // Synchronize pump assignments
    let updatedPumps = state.pumps;
    if (updates.assignedPumps !== undefined) {
      updatedPumps = state.pumps.map(p => {
        if (updates.assignedPumps?.includes(p.number)) {
          return { ...p, assignedEmployeeId: employeeId, assignedEmployeeName: updatedEmp.name };
        } else if (p.assignedEmployeeId === employeeId) {
          return { ...p, assignedEmployeeId: undefined, assignedEmployeeName: undefined };
        }
        return p;
      });
    }

    state = {
      ...state,
      employees: state.employees.map(e => (e.id === employeeId ? updatedEmp : e)),
      pumps: updatedPumps,
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
    return updatedEmp;
  },

  deleteEmployee(employeeId: string, authorName = 'Alain OBAME', reason = 'Fin de contrat') {
    const current = state.employees.find(e => e.id === employeeId);
    if (!current) return;

    const auditEntry = createAuditLog(
      'SUPPRESSION_EMPLOYE',
      'employee',
      employeeId,
      current.name,
      `Désactivation et clôture des accès de l'employé ${current.name}. Motif : ${reason}`,
      `${current.name} (${current.title})`,
      'Compte désactivé et révoqué',
      authorName,
      'Gérant'
    );

    state = {
      ...state,
      employees: state.employees.filter(e => e.id !== employeeId),
      pumps: state.pumps.map(p =>
        p.assignedEmployeeId === employeeId
          ? { ...p, assignedEmployeeId: undefined, assignedEmployeeName: undefined }
          : p
      ),
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
  },

  // --- ADMIN STATION MANAGEMENT & BRANDING ---
  saveStation(station: Station, authorName = 'Admin Global') {
    const exists = state.stations.some(s => s.id === station.id);
    let updatedStations: Station[];
    let auditEntry: AuditLogEntry;

    if (exists) {
      updatedStations = state.stations.map(s => (s.id === station.id ? station : s));
      auditEntry = createAuditLog(
        'MODIFICATION_STATION',
        'station',
        station.id,
        station.name,
        `Mise à jour configuration et habillage de la station ${station.name} (${station.city})`,
        'Config précédente',
        JSON.stringify({ primary: station.primaryColor, secondary: station.secondaryColor, theme: station.canopyTheme }),
        authorName,
        'Super Administrateur'
      );
    } else {
      updatedStations = [...state.stations, station];
      auditEntry = createAuditLog(
        'CREATION_STATION',
        'station',
        station.id,
        station.name,
        `Création de la nouvelle station ${station.name} à ${station.city}`,
        'Inexistant',
        `Station créée (${station.city})`,
        authorName,
        'Super Administrateur'
      );
    }

    state = {
      ...state,
      stations: updatedStations,
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
    return station;
  },

  updateStationCustomization(
    stationId: string,
    updates: Partial<Station>,
    authorName = 'Admin Global'
  ) {
    const current = state.stations.find(s => s.id === stationId);
    if (!current) return;

    const updated: Station = {
      ...current,
      ...updates,
      services: {
        ...current.services,
        ...(updates.services || {}),
      },
      advancedSettings: {
        ...(current.advancedSettings || {
          enableReservations: true,
          enableMobileMoney: true,
          enableClientNotifications: true,
        }),
        ...(updates.advancedSettings || {}),
      },
    };

    const auditEntry = createAuditLog(
      'PERSONNALISATION_STATION',
      'station',
      stationId,
      updated.name,
      `Habillage et personnalisation modifiés pour ${updated.name}`,
      `Thème: ${current.canopyTheme || 'classic-blue'}, Coul: ${current.primaryColor || '#0B4DB3'}`,
      `Thème: ${updated.canopyTheme || 'classic-blue'}, Coul: ${updated.primaryColor || '#0B4DB3'}`,
      authorName,
      'Super Administrateur'
    );

    state = {
      ...state,
      stations: state.stations.map(s => (s.id === stationId ? updated : s)),
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
    return updated;
  },

  deleteStation(stationId: string, authorName = 'Admin Global') {
    const current = state.stations.find(s => s.id === stationId);
    if (!current) return;

    const auditEntry = createAuditLog(
      'SUPPRESSION_STATION',
      'station',
      stationId,
      current.name,
      `Suppression de la station ${current.name} du réseau StationPro`,
      current.name,
      'Station supprimée',
      authorName,
      'Super Administrateur'
    );

    const remaining = state.stations.filter(s => s.id !== stationId);
    state = {
      ...state,
      stations: remaining,
      selectedStationId:
        state.selectedStationId === stationId
          ? (remaining[0]?.id || 'station-liberte')
          : state.selectedStationId,
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
  },

  // --- 360° NETWORK & PLATFORM CUSTOMIZATION ---
  updateNetworkConfig(updates: Partial<NetworkConfig>, authorName = 'Admin Global') {
    const updated = { ...state.networkConfig, ...updates };
    const auditEntry = createAuditLog(
      'CONFIGURATION_RESEAU',
      'station',
      'network-global',
      'Plateforme Globale',
      `Mise à jour configuration réseau : Devise=${updated.currency}, Plateforme=${updated.platformName}`,
      JSON.stringify(state.networkConfig),
      JSON.stringify(updated),
      authorName,
      'Super Administrateur'
    );

    state = {
      ...state,
      networkConfig: updated,
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
    return updated;
  },

  updateFuelPrices(
    prices: { super: number; gasoil: number; petroleLampant: number; gazButane: number },
    authorName = 'Admin Global'
  ) {
    const oldPrices = state.networkConfig.fuelPrices;
    const updatedConfig: NetworkConfig = {
      ...state.networkConfig,
      fuelPrices: prices,
    };

    // Synchronize price directly in products catalog
    const updatedProducts = state.products.map(p => {
      if (p.id.includes('super')) {
        return { ...p, priceFCFA: prices.super };
      }
      if (p.id.includes('gazoil') || p.id.includes('gasoil')) {
        return { ...p, priceFCFA: prices.gasoil };
      }
      if (p.id.includes('petrole')) {
        return { ...p, priceFCFA: prices.petroleLampant };
      }
      if (p.id.includes('gaz-butane') && p.unit.includes('6 kg')) {
        return { ...p, priceFCFA: prices.gazButane };
      }
      return p;
    });

    const auditEntry = createAuditLog(
      'MODIFICATION_PRIX',
      'product',
      'fuel-prices',
      'Tarification Carburants & Gaz Réseau',
      `Ajustement officiel des prix : Super=${prices.super} F, Gasoil=${prices.gasoil} F, Pétrole=${prices.petroleLampant} F, Gaz=${prices.gazButane} F`,
      `Super: ${oldPrices.super} F, Gasoil: ${oldPrices.gasoil} F`,
      `Super: ${prices.super} F, Gasoil: ${prices.gasoil} F`,
      authorName,
      'Super Administrateur'
    );

    state = {
      ...state,
      networkConfig: updatedConfig,
      products: updatedProducts,
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
  },

  // --- 360° TANKS & CUVE LOGISTICS ---
  refillTank(
    tankId: string,
    litersAdded: number,
    supplier = 'TOTAL Distribution',
    authorName = 'Admin Global'
  ) {
    const tank = state.tanks.find(t => t.id === tankId);
    if (!tank) return;

    const newCurrent = Math.min(tank.capacityLiters, tank.currentLiters + litersAdded);
    const newPercent = Math.round((newCurrent / tank.capacityLiters) * 100);
    const newStatus: 'ok' | 'low' | 'critical' =
      newPercent <= 15 ? 'critical' : newPercent <= 30 ? 'low' : 'ok';

    const updatedTank: TankLevel = {
      ...tank,
      currentLiters: newCurrent,
      levelPercent: newPercent,
      status: newStatus,
    };

    const auditEntry = createAuditLog(
      'LIVRAISON_CUVE',
      'station',
      tankId,
      `Cuve ${tank.fuelType}`,
      `Réception livraison camion-citerne ${supplier} : +${litersAdded.toLocaleString('fr-FR')} L dans cuve ${tank.fuelType}`,
      `${tank.currentLiters.toLocaleString('fr-FR')} L (${tank.levelPercent}%)`,
      `${newCurrent.toLocaleString('fr-FR')} L (${newPercent}%)`,
      authorName,
      'Super Administrateur'
    );

    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newAlert: AlertNotification = {
      id: `alert-refill-${Date.now()}`,
      type: 'success',
      title: `Livraison effectuée • Cuve ${tank.fuelType}`,
      subtitle: `+${litersAdded.toLocaleString('fr-FR')} Litres réceptionnés de ${supplier}`,
      time: nowTime,
      isRead: false,
    };

    state = {
      ...state,
      tanks: state.tanks.map(t => (t.id === tankId ? updatedTank : t)),
      alerts: [newAlert, ...state.alerts],
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
    return updatedTank;
  },

  updateTank(tankId: string, updates: Partial<TankLevel>, authorName = 'Admin Global') {
    const current = state.tanks.find(t => t.id === tankId);
    if (!current) return;

    const updated = { ...current, ...updates };
    if (updates.currentLiters !== undefined || updates.capacityLiters !== undefined) {
      updated.levelPercent = Math.round((updated.currentLiters / updated.capacityLiters) * 100);
      updated.status = updated.levelPercent <= 15 ? 'critical' : updated.levelPercent <= 30 ? 'low' : 'ok';
    }

    const auditEntry = createAuditLog(
      'MODIFICATION_STOCK',
      'station',
      tankId,
      `Cuve ${current.fuelType}`,
      `Mise à jour paramètres ou jauge de la cuve ${current.fuelType}`,
      `${current.currentLiters} L (${current.levelPercent}%)`,
      `${updated.currentLiters} L (${updated.levelPercent}%)`,
      authorName,
      'Super Administrateur'
    );

    state = {
      ...state,
      tanks: state.tanks.map(t => (t.id === tankId ? updated : t)),
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
    return updated;
  },

  // --- 360° PUMPS INFRASTRUCTURE ---
  addPump(pumpData: Omit<Pump, 'id'>, authorName = 'Admin Global') {
    const newId = `pump-${Date.now()}`;
    const newPump: Pump = {
      ...pumpData,
      id: newId,
    };

    const auditEntry = createAuditLog(
      'CONFIGURATION_POMPE',
      'station',
      newId,
      `Pompe #${newPump.number}`,
      `Ajout du distributeur Pompe #${newPump.number} (${newPump.fuelType})`,
      'Non existant',
      `Pompe #${newPump.number} créée`,
      authorName,
      'Super Administrateur'
    );

    state = {
      ...state,
      pumps: [...state.pumps, newPump],
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
    return newPump;
  },

  updatePump(pumpId: string, updates: Partial<Pump>, authorName = 'Admin Global') {
    const current = state.pumps.find(p => p.id === pumpId);
    if (!current) return;

    const updated = { ...current, ...updates };
    const auditEntry = createAuditLog(
      'CONFIGURATION_POMPE',
      'station',
      pumpId,
      `Pompe #${updated.number}`,
      `Mise à jour distributeur #${updated.number} : Statut=${updated.status}, Produit=${updated.fuelType}`,
      `${current.status} (${current.fuelType})`,
      `${updated.status} (${updated.fuelType})`,
      authorName,
      'Super Administrateur'
    );

    state = {
      ...state,
      pumps: state.pumps.map(p => (p.id === pumpId ? updated : p)),
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
    return updated;
  },

  deletePump(pumpId: string, authorName = 'Admin Global') {
    const current = state.pumps.find(p => p.id === pumpId);
    if (!current) return;

    const auditEntry = createAuditLog(
      'CONFIGURATION_POMPE',
      'station',
      pumpId,
      `Pompe #${current.number}`,
      `Suppression du distributeur Pompe #${current.number}`,
      `Pompe #${current.number} active`,
      'Pompe démantelée / supprimée',
      authorName,
      'Super Administrateur'
    );

    state = {
      ...state,
      pumps: state.pumps.filter(p => p.id !== pumpId),
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
  },

  // --- SUPER ADMIN ADVERTISING CAROUSEL (1920x1080) ---
  addHomeAdBanner(
    input: Omit<HomeAdBannerSlide, 'id' | 'createdAt'>,
    authorName = 'Admin Global'
  ) {
    const newSlide: HomeAdBannerSlide = {
      ...input,
      id: `ad-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const auditEntry = createAuditLog(
      'CONFIGURATION_RESEAU',
      'station',
      newSlide.stationId,
      newSlide.stationName,
      `Publication bannière publicitaire 1920×1080 "${newSlide.title}" pour ${newSlide.stationName}`,
      'Aucune bannière',
      newSlide.title,
      authorName,
      'Super Administrateur'
    );
    state = {
      ...state,
      homeAdBanners: [newSlide, ...state.homeAdBanners],
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
    return newSlide;
  },

  updateHomeAdBanner(
    id: string,
    updates: Partial<HomeAdBannerSlide>,
    authorName = 'Admin Global'
  ) {
    const current = state.homeAdBanners.find(b => b.id === id);
    if (!current) return;
    const updatedSlide = { ...current, ...updates };
    const auditEntry = createAuditLog(
      'CONFIGURATION_RESEAU',
      'station',
      updatedSlide.stationId,
      updatedSlide.stationName,
      `Mise à jour publicité accueil "${updatedSlide.title}" (Statut: ${
        updatedSlide.isActive ? 'Active' : 'En pause'
      })`,
      current.title,
      updatedSlide.title,
      authorName,
      'Super Administrateur'
    );
    state = {
      ...state,
      homeAdBanners: state.homeAdBanners.map(b => (b.id === id ? updatedSlide : b)),
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
    return updatedSlide;
  },

  moveHomeAdBanner(id: string, direction: 'up' | 'down') {
    const idx = state.homeAdBanners.findIndex(b => b.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= state.homeAdBanners.length) return;
    const copy = [...state.homeAdBanners];
    const tmp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = tmp;
    state = { ...state, homeAdBanners: copy };
    notify();
  },

  deleteHomeAdBanner(id: string, authorName = 'Admin Global') {
    const current = state.homeAdBanners.find(b => b.id === id);
    if (!current) return;
    const auditEntry = createAuditLog(
      'CONFIGURATION_RESEAU',
      'station',
      current.stationId,
      current.stationName,
      `Retrait de la publicité accueil "${current.title}" (${current.stationName})`,
      current.title,
      'Supprimée',
      authorName,
      'Super Administrateur'
    );
    state = {
      ...state,
      homeAdBanners: state.homeAdBanners.filter(b => b.id !== id),
      auditLogs: [auditEntry, ...state.auditLogs],
    };
    notify();
  },

  resetAll() {
    state = getSeedState();
    notify();
  },
};

function createAuditLog(
  actionType: AuditActionType,
  targetType: AuditLogEntry['targetType'],
  targetId: string,
  targetName: string,
  details: string,
  oldValue = '',
  newValue = '',
  authorName = 'Alain OBAME',
  authorRole = 'Gérant'
): AuditLogEntry {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const dateFormatted = `${day}/${month}/${year}`;
  const timeFormatted = now.toLocaleTimeString('fr-FR');

  const previousHash =
    state?.auditLogs?.[0]?.hash ||
    'SHA256:0000000000000000000000000000000000000000000000000000000000000000';
  const payload = `${previousHash}|${now.toISOString()}|${authorName}|${actionType}|${targetId}|${oldValue}|${newValue}`;
  const hash = `SHA256:${sha256Hex(payload)}`;

  return {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: now.toISOString(),
    dateFormatted,
    timeFormatted,
    authorName,
    authorRole,
    actionType,
    targetType,
    targetId,
    targetName,
    oldValue,
    newValue,
    details,
    previousHash,
    hash,
  };
}

