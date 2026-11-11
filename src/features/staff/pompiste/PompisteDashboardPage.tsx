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
} from 'lucide-react';

export const PompisteDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { pumps, fuelTransactions, currentEmployee } = useAppStore(s => ({
    pumps: s.pumps,
    fuelTransactions: s.fuelTransactions,
    currentEmployee: s.currentEmployee,
  }));

  // Modals for actions
  const [serveModalOpen, setServeModalOpen] = useState(false);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [selectedPumpNumber, setSelectedPumpNumber] = useState(1);
  const [serveFuelType, setServeFuelType] = useState<'Super' | 'Gasoil'>('Super');
  const [serveLiters, setServeLiters] = useState('15.0');
  const [servePaymentMethod, setServePaymentMethod] = useState<'Mobile Money' | 'Espèces' | 'Carte'>('Mobile Money');
  const [incidentText, setIncidentText] = useState('');
  const [incidentPump, setIncidentPump] = useState('Pompe 2');

  const availablePumpsCount = pumps.filter(p => p.status === 'available').length;

  const handleServeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const litersNum = parseFloat(serveLiters) || 10;
    const pricePerLiter = serveFuelType === 'Super' ? 700 : 650;
    const totalAmount = Math.round(litersNum * pricePerLiter);

    store.recordFuelTransaction({
      pumpNumber: selectedPumpNumber,
      product: serveFuelType,
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
      `${incidentPump} : Signalement anomalie`,
      incidentText
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
              {pumps.map(pump => (
                <div
                  key={pump.id}
                  onClick={() => {
                    setSelectedPumpNumber(pump.number);
                    setServeFuelType(pump.fuelType);
                    setServeModalOpen(true);
                  }}
                  className="bg-white rounded-2xl border border-[#DCE4F0] p-4 flex flex-col items-center text-center hover:border-blue-400 hover:shadow-md cursor-pointer transition-all duration-150 relative group"
                >
                  {/* Pump number badge circle (Screen 06) */}
                  <span className="absolute top-3 left-3 w-6 h-6 rounded-full bg-[#1668E3] text-white font-bold text-xs flex items-center justify-center">
                    {pump.number}
                  </span>

                  {/* 3D Gas Pump Graphic */}
                  <div className="w-16 h-18 my-2 flex items-center justify-center">
                    <img
                      src={ASSETS.icons.pump}
                      alt={`Pompe ${pump.number}`}
                      className="max-h-16 object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Status Pill */}
                  <div className="w-full mb-2">
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
                </div>
              ))}
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
          title="Servir un client"
          subtitle="Enregistrer une distribution et paiement de carburant"
          maxWidth="sm"
        >
          <form onSubmit={handleServeSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Numéro de Pompe
              </label>
              <select
                value={selectedPumpNumber}
                onChange={e => setSelectedPumpNumber(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-white"
              >
                {pumps.map(p => (
                  <option key={p.id} value={p.number}>
                    Pompe #{p.number} ({p.fuelType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Type de carburant
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setServeFuelType('Super')}
                  className={`p-2.5 rounded-xl text-xs font-bold border ${
                    serveFuelType === 'Super'
                      ? 'bg-amber-50 border-amber-500 text-amber-900'
                      : 'border-slate-200'
                  }`}
                >
                  Super (700 FCFA/L)
                </button>
                <button
                  type="button"
                  onClick={() => setServeFuelType('Gasoil')}
                  className={`p-2.5 rounded-xl text-xs font-bold border ${
                    serveFuelType === 'Gasoil'
                      ? 'bg-amber-50 border-amber-500 text-amber-900'
                      : 'border-slate-200'
                  }`}
                >
                  Gasoil (650 FCFA/L)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Litres servis
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="500"
                value={serveLiters}
                onChange={e => setServeLiters(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-white"
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-xl flex items-center justify-between text-sm font-bold text-[#0B3A82]">
              <span>Total à encaisser :</span>
              <span>
                {new Intl.NumberFormat('fr-FR').format(
                  Math.round(
                    (parseFloat(serveLiters) || 0) *
                      (serveFuelType === 'Super' ? 700 : 650)
                  )
                )}{' '}
                FCFA
              </span>
            </div>

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
                    className={`py-2 rounded-lg border ${
                      servePaymentMethod === method
                        ? 'bg-[#1668E3] text-white border-[#1668E3]'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <Button variant="yellow" size="lg" fullWidth type="submit">
              Enregistrer l'encaissement
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
