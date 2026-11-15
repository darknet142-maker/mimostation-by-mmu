-- Script DDL de Production StationPro (PostgreSQL 15+ / Supabase)
-- Inclut contraintes d'intégrité, indexation multi-stations et journal d'audit append-only inviolable.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Configuration globale du réseau
CREATE TABLE IF NOT EXISTS network_config (
  id TEXT PRIMARY KEY DEFAULT 'network-global',
  platform_name TEXT NOT NULL DEFAULT 'StationPro',
  platform_slogan TEXT NOT NULL DEFAULT 'Console d''administration des stations-services',
  currency TEXT NOT NULL DEFAULT 'FCFA',
  support_phone TEXT NOT NULL,
  support_email TEXT NOT NULL,
  system_theme TEXT NOT NULL DEFAULT 'navy-pro'
    CHECK (system_theme IN ('navy-pro', 'slate-dark', 'emerald-clean', 'royal-blue')),
  super_price_fcfa INTEGER NOT NULL CHECK (super_price_fcfa > 0),
  gasoil_price_fcfa INTEGER NOT NULL CHECK (gasoil_price_fcfa > 0),
  petrole_lampant_price_fcfa INTEGER NOT NULL CHECK (petrole_lampant_price_fcfa > 0),
  gaz_butane_price_fcfa INTEGER NOT NULL CHECK (gaz_butane_price_fcfa > 0),
  enable_network_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  enable_global_mobile_money BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Stations-service et personnalisation 360°
CREATE TABLE IF NOT EXISTS stations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  operator_id TEXT NOT NULL DEFAULT 'totalenergies'
    CHECK (operator_id IN ('ola-energy', 'engen', 'petrogabon', 'totalenergies', 'gab-oil')),
  code TEXT UNIQUE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Gabon',
  phone TEXT,
  email TEXT,
  manager_name TEXT,
  description TEXT,
  distance_km NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (distance_km >= 0),
  is_open_24h BOOLEAN NOT NULL DEFAULT TRUE,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'closed')),
  primary_color TEXT NOT NULL DEFAULT '#0B4DB3',
  secondary_color TEXT NOT NULL DEFAULT '#FFC107',
  logo_url TEXT,
  cover_image TEXT,
  canopy_theme TEXT NOT NULL DEFAULT 'classic-blue',
  layout_style TEXT NOT NULL DEFAULT 'standard' CHECK (layout_style IN ('standard', 'compact', 'dense')),
  banner_style TEXT NOT NULL DEFAULT 'cover',
  pumps_total INTEGER NOT NULL DEFAULT 6 CHECK (pumps_total >= 0),
  pumps_available INTEGER NOT NULL DEFAULT 6 CHECK (pumps_available >= 0),
  has_boutique BOOLEAN NOT NULL DEFAULT TRUE,
  has_cafe BOOLEAN NOT NULL DEFAULT TRUE,
  has_car_wash BOOLEAN NOT NULL DEFAULT TRUE,
  has_lubricants BOOLEAN NOT NULL DEFAULT TRUE,
  has_gas BOOLEAN NOT NULL DEFAULT TRUE,
  has_tyre_service BOOLEAN NOT NULL DEFAULT FALSE,
  has_mechanic BOOLEAN NOT NULL DEFAULT FALSE,
  enable_reservations BOOLEAN NOT NULL DEFAULT TRUE,
  enable_mobile_money BOOLEAN NOT NULL DEFAULT TRUE,
  enable_client_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  reservation_duration_min INTEGER NOT NULL DEFAULT 30 CHECK (reservation_duration_min BETWEEN 5 AND 240),
  airtel_money_number TEXT,
  moov_money_number TEXT,
  accepts_cash BOOLEAN NOT NULL DEFAULT TRUE,
  accepts_cards BOOLEAN NOT NULL DEFAULT TRUE,
  opening_time TEXT NOT NULL DEFAULT '06:00',
  closing_time TEXT NOT NULL DEFAULT '23:00',
  min_stock_alert_percent INTEGER NOT NULL DEFAULT 20 CHECK (min_stock_alert_percent BETWEEN 1 AND 90),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stations_city_status ON stations (city, status);
CREATE INDEX IF NOT EXISTS idx_stations_operator ON stations (operator_id);

-- 3. Personnel & Affectation par station
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (
    role IN ('pompiste', 'chef-de-piste', 'caissiere', 'rayonniste', 'agent-comptoir', 'chef-de-poste', 'gerant')
  ),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  avatar TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'break', 'offline')),
  station_id TEXT NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  pin_hash TEXT NOT NULL,
  assigned_scope TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_station_role ON employees (station_id, role, status);

-- 4. Pompes par station
CREATE TABLE IF NOT EXISTS pumps (
  id TEXT PRIMARY KEY,
  station_id TEXT NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  pump_number INTEGER NOT NULL CHECK (pump_number > 0),
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('Super', 'Gasoil', 'Pétrole Lampant')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'maintenance', 'offline')),
  liters_today NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (liters_today >= 0),
  assigned_employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  UNIQUE (station_id, pump_number)
);

CREATE INDEX IF NOT EXISTS idx_pumps_station_status ON pumps (station_id, status);

-- 5. Cuves & Jaugeage par station
CREATE TABLE IF NOT EXISTS tank_levels (
  id TEXT PRIMARY KEY,
  station_id TEXT NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('Super', 'Gasoil', 'Pétrole Lampant', 'Gaz Butane')),
  current_liters NUMERIC(12, 2) NOT NULL CHECK (current_liters >= 0),
  capacity_liters NUMERIC(12, 2) NOT NULL CHECK (capacity_liters > 0 AND current_liters <= capacity_liters),
  level_percent INTEGER NOT NULL CHECK (level_percent BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'low', 'critical')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (station_id, fuel_type)
);

-- 6. Catalogue Produits & Stocks par station
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('carburant', 'gaz', 'lubrifiants', 'boutique', 'auto')),
  subtitle TEXT NOT NULL,
  default_price_fcfa INTEGER NOT NULL CHECK (default_price_fcfa >= 0),
  unit TEXT NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS station_stocks (
  id TEXT PRIMARY KEY,
  station_id TEXT NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price_fcfa INTEGER NOT NULL CHECK (price_fcfa >= 0),
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  min_stock_threshold INTEGER NOT NULL DEFAULT 10 CHECK (min_stock_threshold >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (station_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_station_stocks_lookup ON station_stocks (station_id, is_available);

-- 7. Réservations avec verrou de stock et expiration
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  product_subtitle TEXT NOT NULL,
  product_image TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  unit_price_fcfa INTEGER NOT NULL CHECK (unit_price_fcfa >= 0),
  total_fcfa INTEGER NOT NULL CHECK (total_fcfa >= 0),
  station_id TEXT NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  station_name TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('place', 'mobile_money')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'awaiting_payment', 'paid', 'collected', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reservations_station_status_expires
  ON reservations (station_id, status, expires_at);

-- 8. Transactions Carburant, Boutique & Commandes Comptoir
CREATE TABLE IF NOT EXISTS fuel_transactions (
  id TEXT PRIMARY KEY,
  station_id TEXT NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  pump_number INTEGER NOT NULL CHECK (pump_number > 0),
  product TEXT NOT NULL,
  quantity_liters NUMERIC(10, 2) NOT NULL CHECK (quantity_liters > 0),
  amount_fcfa INTEGER NOT NULL CHECK (amount_fcfa >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Mobile Money', 'Espèces', 'Carte')),
  status TEXT NOT NULL DEFAULT 'OK' CHECK (status IN ('OK', 'En attente', 'Annulé')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fuel_tx_station_created ON fuel_transactions (station_id, created_at DESC);

CREATE TABLE IF NOT EXISTS boutique_sales (
  id TEXT PRIMARY KEY,
  station_id TEXT NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  sale_number TEXT NOT NULL UNIQUE,
  ticket_number TEXT NOT NULL UNIQUE,
  items_json JSONB NOT NULL,
  total_fcfa INTEGER NOT NULL CHECK (total_fcfa >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Mobile Money', 'Espèces')),
  cashier_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_boutique_sales_station_created ON boutique_sales (station_id, created_at DESC);

CREATE TABLE IF NOT EXISTS counter_orders (
  id TEXT PRIMARY KEY,
  station_id TEXT NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  customer TEXT NOT NULL,
  total_fcfa INTEGER NOT NULL CHECK (total_fcfa >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'served')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_counter_orders_station_status ON counter_orders (station_id, status, created_at DESC);

-- 9. Notifications cloisonnées par audience & station
CREATE TABLE IF NOT EXISTS alert_notifications (
  id TEXT PRIMARY KEY,
  station_id TEXT REFERENCES stations(id) ON DELETE CASCADE,
  audience TEXT NOT NULL DEFAULT 'staff' CHECK (audience IN ('staff', 'client')),
  type TEXT NOT NULL CHECK (type IN ('danger', 'info', 'success')),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  target_role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_station_audience ON alert_notifications (station_id, audience, is_read, created_at DESC);

-- 10. Journal d'Audit Chaîné SHA-256 Strictement Append-Only
CREATE TABLE IF NOT EXISTS audit_ledger (
  id TEXT PRIMARY KEY,
  sequence BIGSERIAL NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('product', 'employee', 'station', 'reservation', 'admin')),
  target_id TEXT NOT NULL,
  target_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  details TEXT NOT NULL,
  previous_hash TEXT NOT NULL,
  hash TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_audit_ledger_timestamp ON audit_ledger (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_ledger_target ON audit_ledger (target_type, target_id);

CREATE OR REPLACE FUNCTION prevent_audit_ledger_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_ledger is strictly append-only: % operation forbidden', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_ledger_immutable ON audit_ledger;
CREATE TRIGGER trg_audit_ledger_immutable
  BEFORE UPDATE OR DELETE ON audit_ledger
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_ledger_mutation();
