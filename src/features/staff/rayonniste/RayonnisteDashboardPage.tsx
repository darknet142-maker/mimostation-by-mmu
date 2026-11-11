import React from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { Layers, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const RayonnisteDashboardPage: React.FC = () => {
  const { products } = useAppStore(s => ({
    products: s.products,
  }));

  const boutiqueProducts = products.filter(p => p.category === 'boutique');
  const lowStockCount = boutiqueProducts.filter(p => p.stockQuantity <= p.minStockThreshold).length;

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
              <div className="text-xs font-semibold text-slate-500">Rayons contrôlés</div>
              <div className="text-2xl font-extrabold text-[#0F172A] mt-0.5">4 / 4</div>
            </div>
          </div>
          <span className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center text-xs">✓</span>
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
              <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">98%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rayons & Stocks list */}
      <SectionCard title="État des rayons et inventaire boutique" icon={<Package className="w-5 h-5" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {boutiqueProducts.map(p => (
            <div key={p.id} className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={p.image} alt="" className="w-10 h-10 object-contain" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                  <p className="text-[11px] text-slate-500">En rayon : {p.stockQuantity} {p.unit}</p>
                </div>
              </div>
              <StatusPill
                type={p.stockQuantity <= p.minStockThreshold ? 'stock-faible' : 'stock-ok'}
                size="sm"
              />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};
