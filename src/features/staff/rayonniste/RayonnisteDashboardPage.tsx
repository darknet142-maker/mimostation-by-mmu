import React, { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import { Layers, Package, AlertTriangle, CheckCircle2, Bell } from 'lucide-react';

export const RayonnisteDashboardPage: React.FC = () => {
  const { products, selectedStationId, currentEmployee } = useAppStore(s => ({
    products: s.products,
    selectedStationId: s.selectedStationId,
    currentEmployee: s.currentEmployee,
  }));

  const [reportedIds, setReportedIds] = useState<Record<string, boolean>>({});
  const activeStationId = currentEmployee?.stationId || selectedStationId;

  const boutiqueProducts = products.filter(p => p.category === 'boutique');
  const lowStockCount = boutiqueProducts.filter(p => p.stockQuantity <= p.minStockThreshold).length;
  const compliancePct = Math.round(
    ((boutiqueProducts.length - lowStockCount) / Math.max(1, boutiqueProducts.length)) * 100
  );

  const handleRequestRestock = (productId: string, name: string, qty: number) => {
    store.requestRestockAlert(name, qty, activeStationId);
    setReportedIds(prev => ({ ...prev, [productId]: true }));
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1668E3] flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Références suivies</div>
              <div className="text-2xl font-extrabold text-[#0F172A] mt-0.5">
                {boutiqueProducts.length}
              </div>
            </div>
          </div>
          <span className="w-6 h-6 rounded-full bg-[#10B981] text-white flex items-center justify-center text-xs font-bold">
            ✓
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Articles à réassortir</div>
              <div className="text-2xl font-extrabold text-amber-600 mt-0.5">{lowStockCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Conformité rayon</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">{compliancePct}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rayons & Stocks list */}
      <SectionCard title="État des rayons et inventaire boutique" icon={<Package className="w-5 h-5" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {boutiqueProducts.map(p => {
            const isLow = p.stockQuantity <= p.minStockThreshold;
            const alreadyReported = Boolean(reportedIds[p.id]);
            return (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={p.image} alt="" className="w-10 h-10 object-contain shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        En rayon : {p.stockQuantity} {p.unit} (seuil {p.minStockThreshold})
                      </p>
                    </div>
                  </div>
                  <StatusPill
                    type={p.stockQuantity <= 0 ? 'rupture' : isLow ? 'stock-faible' : 'stock-ok'}
                    size="sm"
                  />
                </div>

                {isLow && (
                  <Button
                    variant={alreadyReported ? 'ghost' : 'outline-blue'}
                    size="sm"
                    fullWidth
                    disabled={alreadyReported}
                    icon={<Bell className="w-3.5 h-3.5" />}
                    onClick={() => handleRequestRestock(p.id, p.name, p.stockQuantity)}
                  >
                    {alreadyReported ? 'Réassort signalé au gérant' : 'Signaler réassort'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
};
