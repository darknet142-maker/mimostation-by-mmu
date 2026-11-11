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
  Info,
  CheckCircle2,
  Layers,
  FileText,
} from 'lucide-react';

export const ChefDePisteDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { pumps, employees, alerts, dailyMetrics } = useAppStore(s => ({
    pumps: s.pumps,
    employees: s.employees,
    alerts: s.alerts,
    dailyMetrics: s.dailyMetrics,
  }));

  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');

  // 4 piste team members from Screen 07
  const teamPiste = employees
    .filter(e => e.role === 'pompiste' || e.role === 'chef-de-piste')
    .slice(0, 4);

  const availablePumpsCount = pumps.filter(p => p.status === 'available').length;

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentTitle) return;
    store.reportIncident(incidentTitle, incidentDesc || 'Signalé par Chef de Piste');
    setIncidentTitle('');
    setIncidentDesc('');
    setIncidentModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ================= TOP 4 KPI CARDS (Screen 07) ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 6 / 6 Pompes opérationnelles */}
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

        {/* Card 3: Gasoil */}
        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ASSETS.icons.barrel} alt="" className="w-9 h-9 object-contain" />
            <div>
              <div className="text-sm font-bold text-[#0F172A]">Gasoil</div>
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

      {/* ================= MIDDLE ROW: ÉTAT DES POMPES + ÉQUIPE DE PISTE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: État des pompes (7 cols) */}
        <div className="lg:col-span-7">
          <SectionCard
            title="État des pompes"
            icon={<Fuel className="w-5 h-5" />}
            actionLabel="Voir tout"
            actionHref="/personnel/chef-de-piste/pompes"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {pumps.map(pump => (
                <div
                  key={pump.id}
                  onClick={() => {
                    // Toggle pump status
                    const next = pump.status === 'available' ? 'maintenance' : 'available';
                    store.updatePumpStatus(pump.number, next);
                  }}
                  className="bg-white rounded-2xl border border-[#DCE4F0] p-3 flex flex-col items-center text-center hover:border-blue-400 hover:shadow-md cursor-pointer transition-all duration-150 relative group"
                >
                  <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-[#1668E3] text-white font-bold text-xs flex items-center justify-center">
                    {pump.number}
                  </span>

                  <div className="w-14 h-16 my-1 flex items-center justify-center">
                    <img
                      src={ASSETS.icons.pump}
                      alt=""
                      className="max-h-14 object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="w-full mb-1">
                    <StatusPill
                      type={pump.status === 'available' ? 'disponible' : 'maintenance'}
                      size="sm"
                      label={pump.status === 'available' ? 'Disponible' : 'Maintenance'}
                    />
                  </div>

                  <div className="text-xs font-bold text-slate-700">
                    {pump.fuelType}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Right: Équipe de piste (5 cols, Screen 07) */}
        <div className="lg:col-span-5">
          <SectionCard
            title="Équipe de piste"
            icon={<Users className="w-5 h-5" />}
            actionLabel="Voir équipe"
            actionHref="/personnel/chef-de-piste/equipe"
          >
            <div className="space-y-3">
              {teamPiste.map(member => (
                <div
                  key={member.id}
                  onClick={() => store.toggleEmployeeStatus(member.id)}
                  className="flex items-center justify-between p-2.5 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#0F172A]">{member.name}</h4>
                      <p className="text-[11px] text-slate-500">{member.title}</p>
                    </div>
                  </div>

                  <StatusPill
                    type={member.status === 'active' ? 'active' : 'maintenance'}
                    label={member.status === 'active' ? 'En service' : 'Pause'}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ================= BOTTOM ROW (3 CARDS from Screen 07) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Alertes & Notifications (4 cols, Screen 07) */}
        <div className="lg:col-span-4">
          <SectionCard
            title="Alertes & Notifications"
            icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
            badge={2}
            actionLabel="Voir tout"
            actionHref="/personnel/chef-de-piste/alertes"
          >
            <div className="space-y-3">
              {alerts.slice(0, 3).map(alt => (
                <div key={alt.id} className="flex items-start gap-2.5 text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="mt-0.5 shrink-0">
                    {alt.type === 'danger' ? (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    ) : alt.type === 'info' ? (
                      <Info className="w-4 h-4 text-blue-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#0F172A] truncate">{alt.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-1">{alt.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{alt.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Middle: Ventes du jour (4 cols, Screen 07) */}
        <div className="lg:col-span-4">
          <SectionCard
            title="Ventes du jour"
            icon={<TrendingUp className="w-4 h-4" />}
          >
            <div className="flex items-center justify-between gap-4">
              {/* CSS/SVG Bar Chart */}
              <div className="flex items-end gap-1.5 h-28 pt-2">
                {[
                  { h: '08h', pct: 40 },
                  { h: '10h', pct: 60 },
                  { h: '12h', pct: 85 },
                  { h: '14h', pct: 70 },
                  { h: '16h', pct: 95 },
                  { h: '18h', pct: 100 },
                ].map(b => (
                  <div key={b.h} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-blue-100 rounded-t-sm relative flex items-end h-20">
                      <div
                        style={{ height: `${b.pct}%` }}
                        className="w-full bg-[#3B82F6] hover:bg-[#1D4ED8] rounded-t-sm transition-all"
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium">{b.h}</span>
                  </div>
                ))}
              </div>

              {/* Right Details */}
              <div className="space-y-2 text-right">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Total ventes</div>
                  <div className="text-base font-extrabold text-[#0B3A82] leading-tight">
                    {new Intl.NumberFormat('fr-FR').format(dailyMetrics.totalRevenueFCFA)} FCFA
                  </div>
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full mt-0.5">
                    ↑ +{dailyMetrics.growthPercentVsYesterday}%
                  </span>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <div className="text-[10px] text-slate-400">Transactions</div>
                  <div className="text-sm font-extrabold text-slate-800">
                    {dailyMetrics.transactionsCount}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right: Actions rapides 2x2 Grid (4 cols, Screen 07) */}
        <div className="lg:col-span-4">
          <SectionCard
            title="Actions rapides"
            icon={<Zap className="w-4 h-4 text-amber-500 fill-amber-500" />}
          >
            <div className="grid grid-cols-2 gap-2.5">
              {/* Action 1: Servir un client */}
              <button
                type="button"
                onClick={() => navigate('/personnel/chef-de-piste/pompes')}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs flex flex-col items-center text-center transition-all"
              >
                <img src={ASSETS.products.gazoil} alt="" className="w-7 h-7 object-contain mb-1" />
                <span className="text-xs font-bold text-[#0F172A] leading-tight">
                  Servir un client
                </span>
              </button>

              {/* Action 2: Contrôler les stocks */}
              <button
                type="button"
                onClick={() => navigate('/personnel/chef-de-piste/stocks')}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs flex flex-col items-center text-center transition-all"
              >
                <Layers className="w-6 h-6 text-[#1668E3] mb-1" />
                <span className="text-xs font-bold text-[#0F172A] leading-tight">
                  Contrôler les stocks
                </span>
              </button>

              {/* Action 3: Signaler un incident */}
              <button
                type="button"
                onClick={() => setIncidentModalOpen(true)}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-xs flex flex-col items-center text-center transition-all"
              >
                <AlertTriangle className="w-6 h-6 text-[#EF4444] mb-1" />
                <span className="text-xs font-bold text-[#0F172A] leading-tight">
                  Signaler un incident
                </span>
              </button>

              {/* Action 4: Voir les rapports */}
              <button
                type="button"
                onClick={() => navigate('/personnel/chef-de-piste/rapports')}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs flex flex-col items-center text-center transition-all"
              >
                <FileText className="w-6 h-6 text-[#1668E3] mb-1" />
                <span className="text-xs font-bold text-[#0F172A] leading-tight">
                  Voir les rapports
                </span>
              </button>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Incident Modal */}
      {incidentModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIncidentModalOpen(false)}
          title="Signaler un incident de piste"
          maxWidth="sm"
        >
          <form onSubmit={handleIncidentSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Titre de l'incident
              </label>
              <input
                type="text"
                required
                value={incidentTitle}
                onChange={e => setIncidentTitle(e.target.value)}
                placeholder="Ex : Alerte fuite Pistolet Pompe 4"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Détails
              </label>
              <textarea
                rows={3}
                value={incidentDesc}
                onChange={e => setIncidentDesc(e.target.value)}
                placeholder="Détails techniques, niveau d'urgence..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <Button variant="danger" size="lg" fullWidth type="submit">
              Publier l'alerte
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
