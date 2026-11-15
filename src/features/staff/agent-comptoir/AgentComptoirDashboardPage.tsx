import React, { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatusPill } from '@/components/ui/StatusPill';
import { Coffee, ClipboardList, CheckCircle2, Clock, Plus } from 'lucide-react';

export const AgentComptoirDashboardPage: React.FC = () => {
  const { counterOrders, selectedStationId, currentEmployee } = useAppStore(s => ({
    counterOrders: s.counterOrders || [],
    selectedStationId: s.selectedStationId,
    currentEmployee: s.currentEmployee,
  }));

  const activeStationId = currentEmployee?.stationId || selectedStationId;
  const stationOrders = counterOrders.filter(o => o.stationId === activeStationId);

  const servedCount = stationOrders.filter(o => o.status === 'served').length;
  const inProgressCount = stationOrders.filter(o => o.status !== 'served').length;
  const totalRevenue = stationOrders.reduce((acc, o) => acc + o.totalFCFA, 0);

  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [orderItem, setOrderItem] = useState('');
  const [orderTotal, setOrderTotal] = useState(2500);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderItem.trim() || !customerName.trim() || orderTotal <= 0) return;
    store.addCounterOrder({
      item: orderItem.trim(),
      customer: customerName.trim(),
      totalFCFA: Number(orderTotal),
      stationId: activeStationId,
    });
    setCustomerName('');
    setOrderItem('');
    setOrderTotal(2500);
    setShowNewOrderModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Commandes servies</div>
              <div className="text-2xl font-extrabold text-[#0F172A] mt-0.5">{servedCount}</div>
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
              <div className="text-2xl font-extrabold text-blue-600 mt-0.5">{inProgressCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Chiffre Café &amp; Comptoir</div>
              <div className="text-2xl font-extrabold text-[#0B3A82] mt-0.5">
                {new Intl.NumberFormat('fr-FR').format(totalRevenue)} F
              </div>
            </div>
          </div>
        </div>
      </div>

      <SectionCard
        title="Commandes Café & Restauration"
        icon={<ClipboardList className="w-5 h-5" />}
        headerRight={
          <Button
            variant="outline-blue"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowNewOrderModal(true)}
          >
            Nouvelle commande
          </Button>
        }
      >
        {stationOrders.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            Aucune commande enregistrée pour cette station aujourd&apos;hui.
          </p>
        ) : (
          <div className="space-y-3">
            {stationOrders.map(order => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">{order.customer}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {order.time}
                    </span>
                    <StatusPill
                      type={
                        order.status === 'served'
                          ? 'disponible'
                          : order.status === 'ready'
                          ? 'active'
                          : 'stock-faible'
                      }
                      size="sm"
                      label={
                        order.status === 'served'
                          ? 'Servie'
                          : order.status === 'ready'
                          ? 'Prête au comptoir'
                          : 'En préparation'
                      }
                    />
                  </div>
                  <p className="text-sm font-semibold text-[#0B3A82] mt-0.5">{order.item}</p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="font-extrabold text-sm text-slate-900">
                    {new Intl.NumberFormat('fr-FR').format(order.totalFCFA)} FCFA
                  </span>
                  {order.status !== 'served' && (
                    <Button
                      variant={order.status === 'pending' ? 'yellow' : 'navy'}
                      size="sm"
                      onClick={() => store.advanceCounterOrder(order.id)}
                    >
                      {order.status === 'pending' ? 'Marquer prête' : 'Remettre au client'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <Modal
        isOpen={showNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        title="Nouvelle commande comptoir"
        subtitle="Enregistrer une commande café ou snack pour suivi en temps réel"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
          <div>
            <label htmlFor="order-customer" className="block font-bold text-slate-700 mb-1">
              Client / Piste
            </label>
            <input
              id="order-customer"
              type="text"
              required
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="ex: Client Piste #3"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
            />
          </div>
          <div>
            <label htmlFor="order-item" className="block font-bold text-slate-700 mb-1">
              Articles commandés
            </label>
            <input
              id="order-item"
              type="text"
              required
              value={orderItem}
              onChange={e => setOrderItem(e.target.value)}
              placeholder="ex: Café Latte + Croissant"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
            />
          </div>
          <div>
            <label htmlFor="order-total" className="block font-bold text-slate-700 mb-1">
              Montant total (FCFA)
            </label>
            <input
              id="order-total"
              type="number"
              required
              min={100}
              step={50}
              value={orderTotal}
              onChange={e => setOrderTotal(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowNewOrderModal(false)}>
              Annuler
            </Button>
            <Button variant="yellow" size="sm" type="submit">
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
