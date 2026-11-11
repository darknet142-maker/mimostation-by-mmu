import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { Button } from '@/components/ui/Button';
import {
  User,
  Shield,
  MapPin,
  RefreshCw,
  Bell,
  HelpCircle,
  Phone,
} from 'lucide-react';

export const ClientProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { stations, selectedStationId } = useAppStore(s => ({
    stations: s.stations,
    selectedStationId: s.selectedStationId,
  }));

  const activeStation = stations.find(s => s.id === selectedStationId) || stations[0];

  const handleResetDemoData = () => {
    if (window.confirm('Réinitialiser toutes les données de démonstration locales ?')) {
      store.resetAll();
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-white min-h-full max-w-2xl mx-auto lg:rounded-3xl lg:border lg:border-slate-200/80 lg:shadow-xs lg:my-4">
      {/* Profile Header */}
      <div className="flex items-center gap-3.5 p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200">
        <div className="w-14 h-14 rounded-full bg-[#1668E3] text-white flex items-center justify-center font-bold text-xl">
          <User className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">Client StationPro</h2>
          <p className="text-xs text-slate-500">+241 77 00 11 22 • Libreville</p>
          <span className="inline-block mt-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
            Compte actif
          </span>
        </div>
      </div>

      {/* Staff Login Quick Entry (Crucial for Staff Access) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0B3A82] to-[#041638] text-white space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#F7B928]" />
            <h3 className="text-sm font-bold">Espace Personnel</h3>
          </div>
          <span className="text-[10px] font-bold bg-[#F7B928] text-[#0A162B] px-2 py-0.5 rounded-full">
            Réservé Staff
          </span>
        </div>
        <p className="text-xs text-blue-100/80">
          Vous travaillez en station ? Accédez à votre poste pompiste, caissière, chef de poste ou gérant.
        </p>
        <div className="pt-1">
          <Button
            variant="yellow"
            size="sm"
            fullWidth
            onClick={() => navigate('/personnel')}
          >
            Accéder à l'Espace Personnel →
          </Button>
        </div>
      </div>

      {/* Preferences & Settings */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase px-1">Préférences</h3>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-3.5 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-[#1668E3]" />
              <span className="text-xs font-semibold text-slate-700">Ma station favorite</span>
            </div>
            <span className="text-xs font-bold text-slate-900">{activeStation.name}</span>
          </div>

          <Link
            to="/notifications"
            className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-[#1668E3]" />
              <span className="text-xs font-semibold text-slate-700">Notifications</span>
            </div>
            <span className="text-xs text-slate-400">Activées →</span>
          </Link>

          <div className="p-3.5 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#1668E3]" />
              <span className="text-xs font-semibold text-slate-700">Assistance StationPro</span>
            </div>
            <span className="text-xs font-bold text-[#1668E3]">800 12 34 (Gratuit)</span>
          </div>
        </div>
      </div>

      {/* Demo Mode & Local Reset */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Mode Démonstration Local (Phase 1)</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Toutes les opérations (réservations, ventes, encaissements) sont synchronisées localement dans votre navigateur avant le passage sur Supabase.
        </p>
        <button
          type="button"
          onClick={handleResetDemoData}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-600 font-semibold mt-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Réinitialiser les données démo</span>
        </button>
      </div>
    </div>
  );
};
