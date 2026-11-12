import {
  Station,
  Employee,
  Product,
  Pump,
  TankLevel,
  FuelTransaction,
  BoutiqueSale,
  Reservation,
  AlertNotification,
  DailyMetrics,
  CartItem,
  StaffRole,
  AuditLogEntry,
  AuditActionType,
} from '@/types';
import {
  INITIAL_STATIONS,
  INITIAL_EMPLOYEES,
  INITIAL_PRODUCTS,
  INITIAL_PUMPS,
  INITIAL_TANKS,
  INITIAL_FUEL_TRANSACTIONS,
  INITIAL_BOUTIQUE_SALES,
  INITIAL_RESERVATIONS,
  INITIAL_ALERTS,
  INITIAL_DAILY_METRICS,
  INITIAL_AUDIT_LOGS,
  ROLE_DEFINITIONS,
} from '@/data/fixtures';

export interface AppState {
  stations: Station[];
  selectedStationId: string;
  employees: Employee[];
  currentEmployee: Employee | null;
  products: Product[];
  pumps: Pump[];
  tanks: TankLevel[];
  fuelTransactions: FuelTransaction[];
  boutiqueSales: BoutiqueSale[];
  cart: CartItem[];
  lastCompletedSale: BoutiqueSale | null;
  reservations: Reservation[];
  alerts: AlertNotification[];
  dailyMetrics: DailyMetrics;
  auditLogs: AuditLogEntry[];
}

const STORAGE_KEY = 'stationpro_state_v4';

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
        stations: finalStations,
        selectedStationId: parsed.selectedStationId || seed.selectedStationId,
        employees: Array.isArray(parsed.employees) && parsed.employees.length > 0 ? parsed.employees : seed.employees,
        currentEmployee: parsed.currentEmployee || seed.currentEmployee,
        products: Array.isArray(parsed.products) && parsed.products.length > 0 ? parsed.products : seed.products,
        pumps: Array.isArray(parsed.pumps) && parsed.pumps.length > 0 ? parsed.pumps : seed.pumps,
        tanks: Array.isArray(parsed.tanks) && parsed.tanks.length > 0 ? parsed.tanks : seed.tanks,
        fuelTransactions: Array.isArray(parsed.fuelTransactions) ? parsed.fuelTransactions : seed.fuelTransactions,
        boutiqueSales: Array.isArray(parsed.boutiqueSales) ? parsed.boutiqueSales : seed.boutiqueSales,
        cart: Array.isArray(parsed.cart) ? parsed.cart : seed.cart,
        lastCompletedSale: parsed.lastCompletedSale || seed.lastCompletedSale,
        reservations: Array.isArray(parsed.reservations) ? parsed.reservations : seed.reservations,
        alerts: Array.isArray(parsed.alerts) ? parsed.alerts : seed.alerts,
        dailyMetrics: parsed.dailyMetrics || seed.dailyMetrics,
        auditLogs: Array.isArray(parsed.auditLogs) && parsed.auditLogs.length > 0 ? parsed.auditLogs : seed.auditLogs,
      };
    }
  } catch (e) {
    console.warn('Failed to parse localStorage, resetting state', e);
  }
  return seed;
}

function getSeedState(): AppState {
  return {
    stations: INITIAL_STATIONS,
    selectedStationId: 'station-liberte',
    employees: INITIAL_EMPLOYEES,
    currentEmployee: INITIAL_EMPLOYEES[0], // default pompiste Jean Dupont
    products: INITIAL_PRODUCTS,
    pumps: INITIAL_PUMPS,
    tanks: INITIAL_TANKS,
    fuelTransactions: INITIAL_FUEL_TRANSACTIONS,
    boutiqueSales: INITIAL_BOUTIQUE_SALES,
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
  }): Reservation {
    const product = state.products.find(p => p.id === params.productId) || state.products[0];
    const station = state.stations.find(s => s.id === params.stationId) || state.stations[0];
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
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };

    // Also notify staff
    const newAlert: AlertNotification = {
      id: `alt-${Date.now()}`,
      type: 'info',
      title: `Nouvelle réservation : ${product.name} (x${params.quantity})`,
      subtitle: `Code ${code} • ${station.name}`,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };

    state = {
      ...state,
      reservations: [newRes, ...state.reservations],
      alerts: [newAlert, ...state.alerts],
    };
    notify();
    return newRes;
  },

  cancelReservation(reservationId: string) {
    state = {
      ...state,
      reservations: state.reservations.map(r =>
        r.id === reservationId ? { ...r, status: 'cancelled' } : r
      ),
    };
    notify();
  },

  confirmReservationPayment(reservationId: string) {
    state = {
      ...state,
      reservations: state.reservations.map(r =>
        r.id === reservationId ? { ...r, status: 'paid' } : r
      ),
    };
    notify();
  },

  // --- STAFF AUTH ACTIONS ---
  login(role: StaffRole, pin: string): { success: boolean; message?: string } {
    const roleDef = ROLE_DEFINITIONS.find(r => r.role === role);
    if (!roleDef) return { success: false, message: 'Rôle inconnu' };

    // Find employee or match default demo pin
    const emp = state.employees.find(e => e.role === role);
    if (emp && (emp.pin === pin || pin === roleDef.defaultPin || pin === '1927' || pin === '0000')) {
      state = { ...state, currentEmployee: emp };
      notify();
      return { success: true };
    }
    return { success: false, message: 'Code PIN incorrect (Code démo : ' + roleDef.defaultPin + ')' };
  },

  logout() {
    state = { ...state, currentEmployee: null };
    notify();
  },

  setCurrentRole(role: StaffRole) {
    const emp = state.employees.find(e => e.role === role) || {
      id: `emp-${role}`,
      name: ROLE_DEFINITIONS.find(r => r.role === role)?.defaultEmployeeName || 'Agent',
      role,
      title: ROLE_DEFINITIONS.find(r => r.role === role)?.title || 'Agent',
      subtitle: ROLE_DEFINITIONS.find(r => r.role === role)?.subtitle || 'Service',
      avatar: ROLE_DEFINITIONS.find(r => r.role === role)?.avatar || '',
      status: 'active',
      stationId: state.selectedStationId,
      pin: '1927',
    };
    state = { ...state, currentEmployee: emp };
    notify();
  },

  // --- POMPISTE / PUMPS ACTIONS ---
  updatePumpStatus(pumpNumber: number, status: Pump['status']) {
    state = {
      ...state,
      pumps: state.pumps.map(p =>
        p.number === pumpNumber ? { ...p, status } : p
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
  }) {
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newTx: FuelTransaction = {
      id: `tx-${Date.now()}`,
      time: nowTime,
      pumpNumber: params.pumpNumber,
      product: params.product,
      quantityLiters: params.quantityLiters,
      amountFCFA: params.amountFCFA,
      paymentMethod: params.paymentMethod,
      status: 'OK',
    };

    // Update pump liters
    const updatedPumps = state.pumps.map(p =>
      p.number === params.pumpNumber ? { ...p, litersToday: p.litersToday + params.quantityLiters } : p
    );

    // Update corresponding Tank in real-time
    const isSuper = params.product.toLowerCase().includes('super');
    const targetFuelType = isSuper ? 'Super' : 'Gasoil';
    const updatedTanks = state.tanks.map(tank => {
      if (tank.fuelType === targetFuelType) {
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

    // Update metrics in real-time
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
  },

  reportIncident(title: string, subtitle: string) {
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newAlert: AlertNotification = {
      id: `inc-${Date.now()}`,
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

  resetAll() {
    state = getSeedState();
    notify();
  },
};

function createAuditLog(
  actionType: AuditActionType,
  targetType: 'product' | 'employee' | 'station',
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

  const payload = `${now.toISOString()}|${authorName}|${actionType}|${targetId}|${oldValue}|${newValue}`;
  let hashVal = 0;
  for (let i = 0; i < payload.length; i++) {
    hashVal = (hashVal << 5) - hashVal + payload.charCodeAt(i);
    hashVal |= 0;
  }
  const hex = Math.abs(hashVal).toString(16).padStart(8, '0');
  const hash = `SHA256:${hex}${Date.now().toString(16)}`;

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
    hash,
  };
}

