import React from 'react';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Coffee, ClipboardList, CheckCircle2, Clock } from 'lucide-react';

export const AgentComptoirDashboardPage: React.FC = () => {
  const pendingOrders = [
    { id: 'cmd-1', time: '09:49', item: 'Café Espresso x2 + Croissant', customer: 'Client Piste #2', total: 3500 },
    { id: 'cmd-2', time: '09:44', item: 'Thé Citron + Bouteille Eau 50cl', customer: 'Client Boutique', total: 2000 },
    { id: 'cmd-3', time: '09:36', item: 'Sandwich Poulet + Jus d’Orange', customer: 'Chauffeur VTC', total: 3800 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Boissons servies</div>
              <div className="text-2xl font-extrabold text-[#0F172A] mt-0.5">38</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Commandes en cours</div>
              <div className="text-2xl font-extrabold text-blue-600 mt-0.5">3</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Chiffre Café</div>
              <div className="text-2xl font-extrabold text-[#0B3A82] mt-0.5">92 500 F</div>
            </div>
          </div>
        </div>
      </div>

      <SectionCard title="Commandes Café & Restauration" icon={<ClipboardList className="w-5 h-5" />}>
        <div className="space-y-3">
          {pendingOrders.map(order => (
            <div key={order.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{order.customer}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {order.time}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#0B3A82] mt-0.5">{order.item}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-extrabold text-sm text-slate-900">
                  {new Intl.NumberFormat('fr-FR').format(order.total)} FCFA
                </span>
                <Button variant="yellow" size="sm">
                  Prête
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

