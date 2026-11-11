import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { StatusPill } from '@/components/ui/StatusPill';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ASSETS } from '@/config/assets';
import {
  Fuel,
  CreditCard,
  Gauge,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Droplet,
  BarChart3,
  Lock,
} from 'lucide-react';

export const PompisteDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { pumps, fuelTransactions, currentEmployee, tanks } = useAppStore(s => ({
    pumps: s.pumps,
    fuelTransactions: s.fuelTransactions,
    currentEmployee: s.currentEmployee,
    tanks: s.tanks,
  }));

  // Pompiste's assigned pump(s)
  const assignedPumpNumbers =
    currentEmployee?.assignedPumps && currentEmployee.assignedPumps.length > 0
      ? currentEmployee.assignedPumps
      : [1];

  const [selectedPumpNumber, setSelectedPumpNumber] = useState<number>(assignedPumpNumbers[0] || 1);
  const activePump = pumps.find(p => p.number === selectedPumpNumber) || pumps[0];
  const associatedTank = tanks.find(t => t.fuelType === activePump.fuelType) || tanks[0];

  // Specific metrics for this pompiste's active pump
  const pumpTransactions = fuelTransactions.filter(tx => tx.pumpNumber === activePump.number);
  const pumpRevenueToday = pumpTransactions.reduce((acc, tx) => acc + tx.amountFCFA, 0);
  const pumpLitersToday = activePump.litersToday;

  // Modals for actions
  const [serveModalOpen, setServeModalOpen] = useState(false);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [serveFuelType, setServeFuelType] = useState<'Super' | 'Gasoil'>(activePump.fuelType);
  const [serveLiters, setServeLiters] = useState('20.0');
  const [serveAmountFCFA, setServeAmountFCFA] = useState('14000');
  const [serveMode, setServeMode] = useState<'liters' | 'amount'>('liters');
  const [servePaymentMethod, setServePaymentMethod] = useState<'Mobile Money' | 'Espèces' | 'Carte'>('Mobile Money');
  const [incidentText, setIncidentText] = useState('');
  const [incidentPump, setIncidentPump] = useState(`Pompe ${activePump.number}`);
  const [readOnlyWarning, setReadOnlyWarning] = useState<string | null>(null);

  const availablePumpsCount = pumps.filter(p => p.status === 'available').length;

  const currentPricePerLiter = serveFuelType === 'Super' ? 700 : 650;

  const handleLitersChange = (litersVal: string) => {
    setServeLiters(litersVal);
    const num = parseFloat(litersVal) || 0;
    setServeAmountFCFA(String(Math.round(num * currentPricePerLiter)));
  };

  const handleAmountChange = (amountVal: string) => {
    setServeAmountFCFA(amountVal);
    const num = parseFloat(amountVal) || 0;
    setServeLiters((num / currentPricePerLiter).toFixed(2));
  };

  const applyShortcutPreset = (liters: number) => {
    setServeLiters(liters.toFixed(1));
    setServeAmountFCFA(String(Math.round(liters * currentPricePerLiter)));
  };

  const applyAmountPreset = (amount: number) => {
    setServeAmountFCFA(String(amount));
    setServeLiters((amount / currentPricePerLiter).toFixed(2));
  };

  const handleServeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const litersNum = parseFloat(serveLiters) || 10;
    const totalAmount = Math.round(litersNum * currentPricePerLiter);

    store.recordFuelTransaction({
      pumpNumber: activePump.number,
      product: activePump.fuelType,
      quantityLiters: litersNum,
      amountFCFA: totalAmount,
      paymentMethod: servePaymentMethod,
    });

    setServeModalOpen(false);
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentText) return;
    store.reportIncident(
      `Pompe ${activePump.number} : ${incidentText}`,
      `Signalé par le pompiste en service (${currentEmployee?.name || 'Jean Dupont'})`
    );
    setIncidentText('');
    setIncidentModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ================= MOBILE USER CARD (< 1024px, from Capture 01C) ================= */}
      <div className="lg:hidden p-4 rounded-3xl bg-white border border-[#DCE4F0] shadow-station-card flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={currentEmployee?.avatar || ASSETS.avatars.pompiste}
              alt=""
              className="w-14 h-14 rounded-full border-2 border-white shadow-md bg-blue-500 object-cover"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#10B981] border-2 border-white rounded-full flex items-center justify-center text-white text-[8px] font-bold">
              ✓
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0F172A]">Pompiste</h2>
              <StatusPill type="active" label="En service" size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Bienvenue, {currentEmployee?.name || 'Jean Dupont'}
            </p>
          </div>
        </div>
      </div>

      {/* ================= TOP 4 KPI CARDS (Screen 06 Desktop) ================= */}
      <div className="hidden lg:grid grid-cols-4 gap-4">
        {/* Card 1: Pompes opérationnelles */}
        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1668E3] flex items-center justify-center">
              <Fuel className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">
                Pompes opérationnelles
              </div>
              <div className="text-2xl font-extrabold text-[#0F172A] flex items-center gap-2 mt-0.5">
                <span>{availablePumpsCount} / {pumps.length}</span>
                <span className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center text-xs">
                  ✓
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Super */}
        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ASSETS.icons.fuelDrop} alt="" className="w-9 h-9 object-contain" />
            <div>
              <div className="text-sm font-bold text-[#0F172A]">Super</div>
              <div className="mt-1">
                <StatusPill type="disponible" size="sm" />
              </div>
            </div>
          </div>
          <span className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center text-xs">
            ✓
          </span>
        </div>

        {/* Card 3: Gazole */}
        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ASSETS.icons.barrel} alt="" className="w-9 h-9 object-contain" />
            <div>
              <div className="text-sm font-bold text-[#0F172A]">Gazole</div>
              <div className="mt-1">
                <StatusPill type="disponible" size="sm" />
              </div>
            </div>
          </div>
          <span className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center text-xs">
            ✓
          </span>
        </div>

        {/* Card 4: Gaz Butane */}
        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ASSETS.products.gazButane} alt="" className="w-8 h-9 object-contain" />
            <div>
              <div className="text-sm font-bold text-[#0F172A]">Gaz Butane</div>
              <div className="mt-1">
                <StatusPill type="disponible" size="sm" />
              </div>
            </div>
          </div>
          <span className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center text-xs">
            ✓
          </span>
        </div>
      </div>

      {/* ================= HERO CARD: MA POMPE EN GESTION EXCLUSIVE & NIVEAU DE CUVE EN DIRECT ================= */}
      <div className="bg-gradient-to-r from-[#0B3A82] via-[#0D449A] to-[#1668E3] rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden border border-blue-400/30">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold bg-[#F7B928] text-[#0A162B] px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                Votre Poste en Gestion
              </span>
              <span className="text-xs font-semibold bg-white/15 text-blue-100 px-3 py-1 rounded-full border border-white/20">
                {currentEmployee?.name || 'Jean Dupont'}
              </span>
              <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Pompe opérationnelle
              </span>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Pompe #{activePump.number} — {activePump.fuelType}
                </h2>
              </div>
              <p className="text-xs text-blue-100 mt-1">
                Tarif officiel station : <strong className="text-white font-bold">{currentPricePerLiter} FCFA / Litre</strong> • Données sécurisées en lecture seule
              </p>
            </div>

            {/* Select pump if multiple assigned */}
            {assignedPumpNumbers.length > 1 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-blue-200">Basculer entre vos pompes :</span>
                {assignedPumpNumbers.map(pNum => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => {
                      setSelectedPumpNumber(pNum);
                      const pObj = pumps.find(p => p.number === pNum);
                      if (pObj) setServeFuelType(pObj.fuelType);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      selectedPumpNumber === pNum
                        ? 'bg-white text-[#0B3A82] shadow-md'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    Pompe #{pNum}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Strategic Tank Gauge Card: Au premier coup d'œil */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex-1 max-w-md space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-blue-100">
              <span className="flex items-center gap-1.5 uppercase tracking-wide">
                <Gauge className="w-4 h-4 text-[#F7B928]" />
                Niveau Cuve {associatedTank.fuelType}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                associatedTank.levelPercent > 30 ? 'bg-emerald-500/30 text-emerald-200' : 'bg-red-500/30 text-red-200'
              }`}>
                {associatedTank.levelPercent}% RESTANT
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  {new Intl.NumberFormat('fr-FR').format(associatedTank.currentLiters)}
                </span>
                <span className="text-xs text-blue-200">
                  / {new Intl.NumberFormat('fr-FR').format(associatedTank.capacityLiters)} Litres
                </span>
              </div>

              {/* High Contrast Gauge Bar */}
              <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden mt-2 p-0.5 border border-white/10">
                <div
                  style={{ width: `${associatedTank.levelPercent}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    associatedTank.levelPercent > 30
                      ? 'bg-gradient-to-r from-emerald-400 to-[#10B981]'
                      : 'bg-gradient-to-r from-amber-400 to-red-500'
                  }`}
                />
              </div>
            </div>

            {/* Quick Metrics of this pump */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
              <div>
                <span className="text-blue-200 text-[10px] block">Servis par vous aujourd'hui</span>
                <strong className="text-white font-bold">{pumpLitersToday.toFixed(1)} L</strong>
              </div>
              <div className="text-right">
                <span className="text-blue-200 text-[10px] block">Encaissé sur votre pompe</span>
                <strong className="text-white font-bold">{new Intl.NumberFormat('fr-FR').format(pumpRevenueToday)} FCFA</strong>
              </div>
            </div>

            {/* Direct Instant Serve Button */}
            <button
              type="button"
              onClick={() => {
                setServeFuelType(activePump.fuelType);
                setServeModalOpen(true);
              }}
              className="w-full py-3 px-4 bg-[#F7B928] hover:bg-amber-400 active:scale-[0.98] text-[#0A162B] font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Zap className="w-4 h-4 fill-[#0A162B]" />
              <span>Servir un client & Encaisser (Pompe #{activePump.number})</span>
            </button>
          </div>
        </div>

        {/* Subtle Watermark decoration */}
        <img
          src={ASSETS.scenes.headerStation}
          alt=""
          className="absolute right-0 top-0 bottom-0 h-full w-96 object-cover object-right opacity-15 pointer-events-none"
        />
      </div>

      {readOnlyWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{readOnlyWarning}</span>
          </div>
          <button
            type="button"
            onClick={() => setReadOnlyWarning(null)}
            className="text-amber-700 underline font-bold ml-2"
          >
            Fermer
          </button>
        </div>
      )}

      {/* ================= MOBILE 2x2 TILES (< 1024px, from Capture 01C) ================= */}
      <div className="grid grid-cols-2 lg:hidden gap-3">
        {/* Tile 1: Produits dispo */}
        <div
          onClick={() => navigate('/personnel/pompiste/stocks')}
          className="p-4 bg-white rounded-2xl border border-[#DCE4F0] shadow-station-card flex flex-col justify-between min-h-[110px] cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1668E3] flex items-center justify-center relative">
            <Fuel className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#10B981] text-white rounded-full flex items-center justify-center text-[9px] font-bold">
              ✓
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-bold text-[#0F172A]">Produits dispo</h3>
            <p className="text-xs text-slate-500">Consulter l'état</p>
          </div>
        </div>

        {/* Tile 2: Encaissement */}
        <div
          onClick={() => {
            setServeFuelType('Super');
            setServeModalOpen(true);
          }}
          className="p-4 bg-white rounded-2xl border border-[#DCE4F0] shadow-station-card flex flex-col justify-between min-h-[110px] cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1668E3] flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-bold text-[#0F172A]">Encaissement</h3>
            <p className="text-xs text-slate-500">Enregistrer</p>
          </div>
        </div>

        {/* Tile 3: Niveaux cuves */}
        <div
          onClick={() => navigate('/personnel/pompiste/stocks')}
          className="p-4 bg-white rounded-2xl border border-[#DCE4F0] shadow-station-card flex flex-col justify-between min-h-[110px] cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1668E3] flex items-center justify-center">
            <Gauge className="w-5 h-5" />
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-bold text-[#0F172A]">Niveaux cuves</h3>
            <p className="text-xs text-slate-500">Voir les niveaux</p>
          </div>
        </div>

        {/* Tile 4: Incidents */}
        <div
          onClick={() => setIncidentModalOpen(true)}
          className="p-4 bg-white rounded-2xl border border-[#DCE4F0] shadow-station-card flex flex-col justify-between min-h-[110px] cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#EF4444] flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-bold text-[#0F172A]">Incidents</h3>
            <p className="text-xs text-slate-500">Signaler</p>
          </div>
        </div>
      </div>

      {/* ================= MOBILE "VUE RAPIDE STATION" & STATUS BANNER (Screen 01C Mobile) ================= */}
      <div className="lg:hidden space-y-3.5">
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <BarChart3 className="w-4 h-4 text-[#1668E3]" />
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Vue rapide station
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Super */}
            <div className="bg-white rounded-2xl border border-[#DCE4F0] p-3 flex flex-col items-center text-center shadow-xs">
              <img
                src={ASSETS.products.super}
                alt="Super"
                className="w-11 h-11 object-contain drop-shadow-xs"
              />
              <span className="text-xs font-bold text-[#0F172A] mt-1.5">Super</span>
              <span className="text-[10px] font-bold text-[#10B981] mt-0.5">Disponible</span>
            </div>

            {/* Gazole */}
            <div className="bg-white rounded-2xl border border-[#DCE4F0] p-3 flex flex-col items-center text-center shadow-xs">
              <img
                src={ASSETS.products.gazoil}
                alt="Gazole"
                className="w-11 h-11 object-contain drop-shadow-xs"
              />
              <span className="text-xs font-bold text-[#0F172A] mt-1.5">Gazole</span>
              <span className="text-[10px] font-bold text-[#10B981] mt-0.5">Disponible</span>
            </div>

            {/* Gaz Butane */}
            <div className="bg-white rounded-2xl border border-[#DCE4F0] p-3 flex flex-col items-center text-center shadow-xs">
              <img
                src={ASSETS.products.gazButane}
                alt="Gaz Butane"
                className="w-11 h-11 object-contain drop-shadow-xs"
              />
              <span className="text-xs font-bold text-[#0F172A] mt-1.5">Gaz Butane</span>
              <span className="text-[10px] font-bold text-[#10B981] mt-0.5">Disponible</span>
            </div>
          </div>
        </div>

        {/* Station opérationnelle banner with green check and subtle watermark (Screen 01C) */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-[#E6F7EF] via-[#E8F8F0] to-[#DCFCE7] border border-[#A7F3D0] flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="relative z-10">
            <h4 className="text-sm font-extrabold text-[#065F46] leading-tight">
              Station opérationnelle
            </h4>
            <p className="text-xs text-[#047857] mt-0.5 font-medium">
              Tous les services sont disponibles.
            </p>
          </div>
          <img
            src={ASSETS.scenes.headerStation}
            alt=""
            className="absolute right-0 top-0 bottom-0 h-full w-36 object-cover object-right opacity-25 pointer-events-none"
          />
        </div>
      </div>

      {/* ================= MIDDLE SECTION: ÉTAT DES POMPES + ACTIONS RAPIDES (Screen 06 Desktop) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: État des pompes (8 cols) */}
        <div className="lg:col-span-8">
          <SectionCard
            title="État des pompes"
            icon={<Fuel className="w-5 h-5" />}
            onAction={() => {}}
            actionLabel="Rafraîchir"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {pumps.map(pump => {
                const isMyAssignedPump = pump.number === activePump.number;
                return (
                  <div
                    key={pump.id}
                    onClick={() => {
                      if (isMyAssignedPump) {
                        setSelectedPumpNumber(pump.number);
                        setServeFuelType(pump.fuelType);
                        setServeModalOpen(true);
                      } else {
                        setReadOnlyWarning(
                          `La Pompe #${pump.number} est sous la responsabilité d'un autre collègue. Vous avez la gestion exclusive de la Pompe #${activePump.number}.`
                        );
                      }
                    }}
                    className={`bg-white rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-150 relative group cursor-pointer ${
                      isMyAssignedPump
                        ? 'border-2 border-[#1668E3] shadow-md ring-2 ring-blue-400/20'
                        : 'border border-[#DCE4F0] opacity-80 hover:opacity-100 hover:border-slate-300'
                    }`}
                  >
                    {/* Pump number badge circle (Screen 06) */}
                    <span
                      className={`absolute top-3 left-3 w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center text-white ${
                        isMyAssignedPump ? 'bg-[#1668E3]' : 'bg-slate-400'
                      }`}
                    >
                      {pump.number}
                    </span>

                    {/* Lock / Active badge */}
                    {isMyAssignedPump ? (
                      <span className="absolute top-3 right-3 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        Votre Pompe
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Autre</span>
                      </span>
                    )}

                    {/* 3D Gas Pump Graphic */}
                    <div className="w-16 h-18 my-2 flex items-center justify-center">
                      <img
                        src={ASSETS.icons.pump}
                        alt={`Pompe ${pump.number}`}
                        className="max-h-16 object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Status Pill */}
                    <div className="w-full mb-1">
                      <StatusPill
                        type={pump.status === 'available' ? 'disponible' : 'maintenance'}
                        size="sm"
                        label={pump.status === 'available' ? 'Disponible' : 'Maintenance'}
                      />
                    </div>

                    {/* Fuel Type */}
                    <div className="text-xs font-bold text-slate-700">
                      {pump.fuelType}
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1">
                      {isMyAssignedPump ? (
                        <span className="text-blue-600 font-bold">En gestion active</span>
                      ) : (
                        <span>Lecture seule</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Actions rapides (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <SectionCard
            title="Actions rapides"
            icon={<Zap className="w-5 h-5 text-amber-500 fill-amber-500" />}
          >
            <div className="space-y-3">
              {/* Action 1: Servir un client */}
              <div
                onClick={() => setServeModalOpen(true)}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <img src={ASSETS.products.gazoil} alt="" className="w-7 h-7 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">Servir un client</h3>
                    <p className="text-xs text-slate-500">Démarrer le service</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Action 2: Encaisser un paiement */}
              <div
                onClick={() => setServeModalOpen(true)}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1668E3] flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">Encaisser un paiement</h3>
                    <p className="text-xs text-slate-500">Espèces / Mobile Money</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Action 3: Signaler une anomalie */}
              <div
                onClick={() => setIncidentModalOpen(true)}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-red-400 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-[#EF4444] flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">Signaler une anomalie</h3>
                    <p className="text-xs text-slate-500">Panne / Incident</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Action 4: Voir les rapports */}
              <div
                onClick={() => navigate('/personnel/pompiste/rapports')}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1668E3] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">Voir les rapports</h3>
                    <p className="text-xs text-slate-500">Activité du jour</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ================= BOTTOM ROW: DERNIÈRES TRANSACTIONS + INFORMATIONS STATION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Dernières transactions (7 cols) */}
        <div className="lg:col-span-7">
          <SectionCard
            title="Dernières transactions"
            icon={<Clock className="w-5 h-5" />}
            actionLabel="Voir tout"
            actionHref="/personnel/pompiste/transactions"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-3">Heure</th>
                    <th className="pb-3">Pompe</th>
                    <th className="pb-3">Produit</th>
                    <th className="pb-3">Quantité</th>
                    <th className="pb-3">Mode de paiement</th>
                    <th className="pb-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fuelTransactions.slice(0, 5).map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/80">
                      <td className="py-3 font-semibold text-slate-800">{tx.time}</td>
                      <td className="py-3 font-bold text-[#1668E3]">#{tx.pumpNumber}</td>
                      <td className="py-3 font-semibold text-slate-800">{tx.product}</td>
                      <td className="py-3 font-semibold text-slate-800">
                        {tx.quantityLiters.toFixed(2)} L
                      </td>
                      <td className="py-3 text-slate-600">{tx.paymentMethod}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                          ✓ OK
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        {/* Right Card: Informations station (5 cols) */}
        <div className="lg:col-span-5">
          <SectionCard
            title="Informations station"
            icon={<CheckCircle2 className="w-5 h-5 text-blue-600" />}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-semibold text-slate-700">Super</span>
                    </div>
                    <span className="font-bold text-emerald-600">Disponible</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-semibold text-slate-700">Gazole</span>
                    </div>
                    <span className="font-bold text-emerald-600">Disponible</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={ASSETS.products.gazButane} alt="" className="w-4 h-4 object-contain" />
                      <span className="font-semibold text-slate-700">Gaz Butane</span>
                    </div>
                    <span className="font-bold text-emerald-600">Disponible</span>
                  </div>
                </div>

                {/* Right Operational Badge (Screen 06) */}
                <div className="p-4 rounded-2xl bg-[#E6F7EF] border border-[#A7F3D0] flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center mb-1.5 shadow-sm">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div className="text-xs font-bold text-[#059669]">
                    Station opérationnelle
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Tout est normal
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Prochaine maintenance : <span className="font-semibold text-slate-800">15/11/2026</span></span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ================= MODAL: SERVIR UN CLIENT ================= */}
      {serveModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setServeModalOpen(false)}
          title={`Distribution & Encaissement — Pompe #${activePump.number}`}
          subtitle={`Pompiste en service : ${currentEmployee?.name || 'Jean Dupont'}`}
          maxWidth="sm"
        >
          <form onSubmit={handleServeSubmit} className="space-y-4">
            {/* Header Lock Info: Pompe & Carburant fixé par la Direction */}
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#1668E3] text-white flex items-center justify-center font-bold text-xs">
                  #{activePump.number}
                </span>
                <div>
                  <div className="font-extrabold text-[#0B3A82]">Pompe #{activePump.number} ({activePump.fuelType})</div>
                  <div className="text-[10px] text-slate-500">Tarif fixé : {currentPricePerLiter} FCFA / Litre</div>
                </div>
              </div>
              <span className="text-[10px] bg-white text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-semibold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Fixé</span>
              </span>
            </div>

            {/* Input Mode Selector: Litres vs Montant */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setServeMode('liters')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  serveMode === 'liters'
                    ? 'bg-white text-[#1668E3] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Saisir en Litres (L)
              </button>
              <button
                type="button"
                onClick={() => setServeMode('amount')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  serveMode === 'amount'
                    ? 'bg-white text-[#1668E3] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Saisir en Montant (FCFA)
              </button>
            </div>

            {/* Main Input based on mode */}
            {serveMode === 'liters' ? (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Volume de carburant à servir (Litres)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="500"
                    value={serveLiters}
                    onChange={e => handleLitersChange(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-lg font-mono font-extrabold text-[#0F172A] bg-white focus:ring-2 focus:ring-[#1668E3]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                    Litres
                  </span>
                </div>

                {/* Liters Quick Shortcut Pills */}
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[10, 20, 30, 50].map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => applyShortcutPreset(l)}
                      className="py-1 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#1668E3] hover:border-blue-200"
                    >
                      {l} L
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Montant demandé par le client (FCFA)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="500"
                    min="500"
                    max="500000"
                    value={serveAmountFCFA}
                    onChange={e => handleAmountChange(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-lg font-mono font-extrabold text-[#0F172A] bg-white focus:ring-2 focus:ring-[#1668E3]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                    FCFA
                  </span>
                </div>

                {/* Amount Quick Shortcut Pills */}
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[5000, 10000, 15000, 20000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => applyAmountPreset(amt)}
                      className="py-1 px-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-blue-50 hover:text-[#1668E3] hover:border-blue-200 truncate"
                    >
                      {amt.toLocaleString('fr-FR')} F
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recalculated Summary Card with Live Tank Projection */}
            <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">Quantité calculée :</span>
                <span className="font-mono font-extrabold text-[#0B3A82] text-base">
                  {parseFloat(serveLiters || '0').toFixed(2)} Litres
                </span>
              </div>
              <div className="flex items-center justify-between text-base border-t border-blue-100 pt-1.5">
                <span className="font-extrabold text-slate-800">Total à encaisser :</span>
                <span className="font-mono font-extrabold text-[#1668E3] text-lg">
                  {new Intl.NumberFormat('fr-FR').format(
                    Math.round(parseFloat(serveLiters || '0') * currentPricePerLiter)
                  )}{' '}
                  FCFA
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-blue-100 flex items-center justify-between">
                <span>Niveau cuve après service :</span>
                <span className="font-bold text-emerald-700">
                  {Math.max(0, associatedTank.currentLiters - (parseFloat(serveLiters) || 0)).toLocaleString('fr-FR')} L restants
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mode d'encaissement
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                {['Mobile Money', 'Espèces', 'Carte'].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setServePaymentMethod(method as any)}
                    className={`py-2 rounded-xl border transition-all ${
                      servePaymentMethod === method
                        ? 'bg-[#1668E3] text-white border-[#1668E3] shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <Button variant="yellow" size="lg" fullWidth type="submit">
              Valider la distribution & Encaisser
            </Button>
          </form>
        </Modal>
      )}

      {/* ================= MODAL: SIGNALER UNE ANOMALIE ================= */}
      {incidentModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIncidentModalOpen(false)}
          title="Signaler une anomalie"
          subtitle="Notification immédiate au Chef de Piste et Chef de Poste"
          maxWidth="sm"
        >
          <form onSubmit={handleIncidentSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Équipement concerné
              </label>
              <select
                value={incidentPump}
                onChange={e => setIncidentPump(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
              >
                {pumps.map(p => (
                  <option key={p.id} value={`Pompe ${p.number}`}>
                    Pompe #{p.number} ({p.fuelType})
                  </option>
                ))}
                <option value="Cuve Super">Cuve Super</option>
                <option value="Cuve Gasoil">Cuve Gasoil</option>
                <option value="Terminal TPE">Terminal TPE</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Description de la panne ou incident
              </label>
              <textarea
                rows={3}
                required
                value={incidentText}
                onChange={e => setIncidentText(e.target.value)}
                placeholder="Ex : Pistolet qui goutte, affichage TPE illisible, niveau de cuve bas..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-red-400"
              />
            </div>

            <Button variant="danger" size="lg" fullWidth type="submit">
              Transmettre le signalement
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
