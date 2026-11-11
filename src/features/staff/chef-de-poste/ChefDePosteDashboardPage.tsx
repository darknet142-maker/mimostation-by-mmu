import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ASSETS } from '@/config/assets';
import {
  Fuel,
  Users,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export const ChefDePosteDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { pumps, employees, dailyMetrics } = useAppStore(s => ({
    pumps: s.pumps,
    employees: s.employees,
    dailyMetrics: s.dailyMetrics,
  }));

  const [closeShiftModalOpen, setCloseShiftModalOpen] = useState(false);
  const [shiftClosedSuccess, setShiftClosedSuccess] = useState(false);

  // 5 active members from Screen 03 (Équipe en service)
  const activeTeamMembers = [
    employees.find(e => e.name === 'Pierre MOUKALA') || employees[1],
    employees.find(e => e.name === 'Michel NGOMA') || employees[2],
    employees.find(e => e.name === 'Marie BIBANG') || employees[7],
    employees.find(e => e.name === 'Daniel BIKOUMOU') || employees[3],
    employees.find(e => e.name === 'Agnès MATSANGA') || employees[8],
  ].filter(Boolean);

  const availablePumpsCount = pumps.filter(p => p.status === 'available').length;

  const handleConfirmCloseShift = () => {
    setCloseShiftModalOpen(false);
    setShiftClosedSuccess(true);
    store.reportIncident(
      'Clôture de poste effectuée',
      `Poste validé par Chef de Poste. Total ventes : ${new Intl.NumberFormat('fr-FR').format(dailyMetrics.totalRevenueFCFA)} FCFA.`
    );
  };

  return (
    <div className="space-y-6">
      {/* ================= TOP 4 KPI CARDS (Screen 03) ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 6 / 6 Pompes opérationnelles */}
        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center p-1.5">
              <img src={ASSETS.official.carburantsGaz.super} alt="" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">
                Pompes opérationnelles
              </div>
              <div className="text-2xl font-extrabold text-[#0F172A] flex items-center gap-2 mt-0.5">
                <span>{availablePumpsCount} / {pumps.length}</span>
                <img src={ASSETS.official.uiActions.disponible} alt="OK" className="w-5 h-5 object-contain" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Super */}
        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ASSETS.official.carburantsGaz.super} alt="" className="w-9 h-9 object-contain" />
            <div>
              <div className="text-sm font-bold text-[#0F172A]">Super</div>
              <div className="mt-1">
                <StatusPill type="disponible" size="sm" />
              </div>
            </div>
          </div>
          <img src={ASSETS.official.uiActions.disponible} alt="OK" className="w-5 h-5 object-contain" />
        </div>

        {/* Card 3: Gasoil */}
        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ASSETS.official.carburantsGaz.gasoil} alt="" className="w-9 h-9 object-contain" />
            <div>
              <div className="text-sm font-bold text-[#0F172A]">Gasoil</div>
              <div className="mt-1">
                <StatusPill type="disponible" size="sm" />
              </div>
            </div>
          </div>
          <img src={ASSETS.official.uiActions.disponible} alt="OK" className="w-5 h-5 object-contain" />
        </div>

        {/* Card 4: Gaz Butane */}
        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ASSETS.official.carburantsGaz.gazButane} alt="" className="w-8 h-9 object-contain" />
            <div>
              <div className="text-sm font-bold text-[#0F172A]">Gaz Butane</div>
              <div className="mt-1">
                <StatusPill type="disponible" size="sm" />
              </div>
            </div>
          </div>
          <img src={ASSETS.official.uiActions.disponible} alt="OK" className="w-5 h-5 object-contain" />
        </div>
      </div>

      {/* ================= SECOND ROW: ÉTAT DES POMPES + ÉQUIPE EN SERVICE + ACTIONS RAPIDES (Screen 03) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: État des pompes (5 cols) */}
        <div className="lg:col-span-5">
          <SectionCard
            title="État des pompes"
            icon={<Fuel className="w-5 h-5" />}
            actionLabel="Voir détails"
            actionHref="/personnel/chef-de-poste/pompes"
          >
            <div className="grid grid-cols-3 gap-2.5">
              {pumps.map(pump => (
                <div
                  key={pump.id}
                  className="bg-white rounded-2xl border border-[#DCE4F0] p-2.5 flex flex-col items-center text-center relative"
                >
                  <span className="text-[11px] font-bold text-slate-800 mb-1">
                    Pompe {pump.number}
                  </span>

                  <div className="w-12 h-14 my-1 flex items-center justify-center">
                    <img
                      src={ASSETS.icons.pump}
                      alt=""
                      className="max-h-12 object-contain"
                    />
                  </div>

                  <div className="w-full mb-1">
                    <StatusPill
                      type={pump.status === 'available' ? 'disponible' : 'maintenance'}
                      size="sm"
                      label="Disponible"
                    />
                  </div>

                  <div className="text-[11px] font-bold text-slate-600">
                    {pump.fuelType}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Middle: Équipe en service (4 cols, Screen 03) */}
        <div className="lg:col-span-4">
          <SectionCard
            title="Équipe en service"
            icon={<Users className="w-5 h-5" />}
          >
            <div className="space-y-2.5">
              {activeTeamMembers.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#0F172A]">{member.title}</h4>
                      <p className="text-[11px] text-slate-500">{member.name}</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Actif</span>
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Right: Actions rapides (3 cols, Screen 03) */}
        <div className="lg:col-span-3">
          <SectionCard
            title="Actions rapides"
            icon={<Zap className="w-4 h-4 text-amber-500 fill-amber-500" />}
          >
            <div className="space-y-2.5">
              {/* Action 1: Contrôler les pompes */}
              <button
                type="button"
                onClick={() => navigate('/personnel/chef-de-poste/pompes')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <img src={ASSETS.official.carburantsGaz.super} alt="" className="w-5 h-5 object-contain" />
                  <span className="text-xs font-bold text-[#0F172A]">
                    Contrôler les pompes
                  </span>
                </div>
              </button>

              {/* Action 2: Vérifier les stocks */}
              <button
                type="button"
                onClick={() => navigate('/personnel/chef-de-poste/stocks')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <img src={ASSETS.official.uiActions.niveauCuve} alt="" className="w-5 h-5 object-contain" />
                  <span className="text-xs font-bold text-[#0F172A]">
                    Vérifier les stocks
                  </span>
                </div>
              </button>

              {/* Action 3: Signaler un incident */}
              <button
                type="button"
                onClick={() => navigate('/personnel/chef-de-poste/incidents')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-red-400 hover:bg-slate-50 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <img src={ASSETS.official.uiActions.alerte} alt="" className="w-5 h-5 object-contain" />
                  <span className="text-xs font-bold text-[#0F172A]">
                    Signaler un incident
                  </span>
                </div>
              </button>

              {/* Action 4: Voir les rapports */}
              <button
                type="button"
                onClick={() => navigate('/personnel/chef-de-poste/rapports')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <img src={ASSETS.official.uiActions.rapports} alt="" className="w-5 h-5 object-contain" />
                  <span className="text-xs font-bold text-[#0F172A]">
                    Voir les rapports
                  </span>
                </div>
              </button>

              {/* Action 5: Clôturer le poste */}
              <button
                type="button"
                onClick={() => setCloseShiftModalOpen(true)}
                className="w-full p-2.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <img src={ASSETS.official.uiActions.disponible} alt="" className="w-5 h-5 object-contain" />
                  <span className="text-xs font-bold text-[#0B3A82]">
                    Clôturer le poste
                  </span>
                </div>
              </button>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ================= THIRD ROW: VENTES DU POSTE + ALERTES & NOTIFICATIONS + PERFORMANCE DU JOUR (Screen 03) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Ventes du poste (aujourd'hui) (4 cols, Screen 03) */}
        <div className="lg:col-span-4">
          <SectionCard
            title="Ventes du poste (aujourd'hui)"
            icon={<TrendingUp className="w-4 h-4" />}
            actionLabel="Voir rapport"
            actionHref="/personnel/chef-de-poste/rapports"
          >
            <div className="flex items-center justify-between gap-2">
              {/* SVG Donut Chart */}
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {/* Super (40%) -> Blue */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#2563EB"
                    strokeWidth="16"
                    strokeDasharray="95.5 238.7"
                    strokeDashoffset="0"
                  />
                  {/* Gasoil (35%) -> Orange */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#F97316"
                    strokeWidth="16"
                    strokeDasharray="83.5 238.7"
                    strokeDashoffset="-95.5"
                  />
                  {/* Gaz Butane (15%) -> Green */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="16"
                    strokeDasharray="35.8 238.7"
                    strokeDashoffset="-179"
                  />
                  {/* Boutique (10%) -> Purple */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#8B5CF6"
                    strokeWidth="16"
                    strokeDasharray="23.9 238.7"
                    strokeDashoffset="-214.8"
                  />
                </svg>
                {/* Center Total Text (Screen 03) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  <span className="text-xs font-black text-[#0F172A] leading-tight">
                    2 850 000
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">FCFA</span>
                </div>
              </div>

              {/* Legend (Screen 03) */}
              <div className="space-y-1.5 text-xs flex-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                    <span>Carburant Super</span>
                  </span>
                  <span className="font-bold text-slate-800">40%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                    <span>Gasoil</span>
                  </span>
                  <span className="font-bold text-slate-800">35%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <span>Gaz Butane</span>
                  </span>
                  <span className="font-bold text-slate-800">15%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                    <span>Boutique</span>
                  </span>
                  <span className="font-bold text-slate-800">10%</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Middle: Alertes & Notifications (4 cols, Screen 03) */}
        <div className="lg:col-span-4">
          <SectionCard
            title="Alertes & Notifications"
            icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
            badge={3}
            actionLabel="Voir tout"
            actionHref="/personnel/chef-de-poste/incidents"
          >
            <div className="space-y-3">
              {/* Alert 1 */}
              <div className="flex items-start gap-2.5 text-xs pb-2 border-b border-slate-100">
                <img src={ASSETS.official.uiActions.stockFaible} alt="" className="w-4 h-4 object-contain shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#0F172A] truncate">
                      Pompe 5 : niveau bas Super
                    </h4>
                    <span className="text-[10px] text-slate-400">09:40</span>
                  </div>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="flex items-start gap-2.5 text-xs pb-2 border-b border-slate-100">
                <img src={ASSETS.official.uiActions.information} alt="" className="w-4 h-4 object-contain shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#0F172A] truncate">
                      Livraison Gaz Butane prévue
                    </h4>
                    <span className="text-[10px] text-slate-400">11:00</span>
                  </div>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="flex items-start gap-2.5 text-xs">
                <img src={ASSETS.official.uiActions.disponible} alt="" className="w-4 h-4 object-contain shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#0F172A] truncate">
                      Caisse n°1 : OK
                    </h4>
                    <span className="text-[10px] text-slate-400">09:30</span>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right: Performance du jour (4 cols, Screen 03) */}
        <div className="lg:col-span-4">
          <SectionCard
            title="Performance du jour"
            icon={<TrendingUp className="w-4 h-4" />}
          >
            <div className="space-y-4">
              {/* 3 Metric Columns (Screen 03) */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                  <img src={ASSETS.official.carburantsGaz.super} alt="" className="w-5 h-5 object-contain mb-1" />
                  <div className="text-xs font-bold text-slate-800">243 500</div>
                  <div className="text-[10px] text-slate-400">FCFA Carburant</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                  <img src={ASSETS.official.services.panierBoutique} alt="" className="w-5 h-5 object-contain mb-1" />
                  <div className="text-xs font-bold text-slate-800">410 200</div>
                  <div className="text-[10px] text-slate-400">FCFA Boutique</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                  <img src={ASSETS.official.services.recu} alt="" className="w-5 h-5 object-contain mb-1" />
                  <div className="text-xs font-bold text-[#0B3A82]">653 700</div>
                  <div className="text-[10px] text-slate-400">FCFA Total</div>
                </div>
              </div>

              {/* Bottom Trend Pill (Screen 03: +12% vs hier) */}
              <div className="flex items-center justify-center gap-2 p-2 bg-[#E6F7EF] rounded-xl text-emerald-700 font-extrabold text-sm border border-emerald-100">
                <TrendingUp className="w-4 h-4" />
                <span>+12% vs hier</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Clôture de poste Modal */}
      {closeShiftModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setCloseShiftModalOpen(false)}
          title="Clôturer le poste de travail"
          subtitle="Génération du rapport de fin de service et validation des caisses"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-sm">
              <div className="flex justify-between font-bold text-slate-800 pb-2 border-b border-slate-200">
                <span>Total Chiffre d'Affaires :</span>
                <span className="text-[#0B3A82]">2 850 000 FCFA</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Ventes Carburant :</span>
                <span>2 439 800 FCFA</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Ventes Boutique :</span>
                <span>410 200 FCFA</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Transactions enregistrées :</span>
                <span>243</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-700 font-bold">
                <span>Écart de caisse :</span>
                <span>0 FCFA (Conforme)</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              En confirmant, vous validez l'arrêté des index de compteurs et transmettez le rapport comptable au Gérant.
            </p>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setCloseShiftModalOpen(false)}
              >
                Annuler
              </Button>
              <Button
                variant="navy"
                fullWidth
                onClick={handleConfirmCloseShift}
              >
                Confirmer la clôture
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Success Notification Toast */}
      {shiftClosedSuccess && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6" />
            <div>
              <h4 className="font-bold text-sm">Clôture de poste validée avec succès !</h4>
              <p className="text-xs text-emerald-100">Le rapport journalier a été archivé et transmis au Gérant.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShiftClosedSuccess(false)}
            className="text-white/80 hover:text-white"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
};
