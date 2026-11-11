import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, Station } from '@/types';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { Modal } from '@/components/ui/Modal';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import {
  MapPin,
  Calendar,
} from 'lucide-react';

export interface ProductStationAlternativesModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductStationAlternativesModal: React.FC<ProductStationAlternativesModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { stations, selectedStationId } = useAppStore(s => ({
    stations: s.stations,
    selectedStationId: s.selectedStationId,
  }));

  if (!product) return null;

  const currentStation = stations.find(s => s.id === selectedStationId) || stations[0];
  const alternativeStations = stations.filter(s => s.id !== selectedStationId);

  const handleSelectStationAndReserve = (station: Station) => {
    store.setSelectedStation(station.id);
    onClose();
    navigate(`/stations/${station.id}/reserver/${product.id}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      subtitle="Disponibilité et stations proposant ce produit"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Product presentation hero */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100">
          <div className="w-16 h-16 rounded-xl bg-white p-2 border border-blue-200/60 shadow-xs flex items-center justify-center shrink-0">
            <img src={product.image} alt={product.name} className="max-h-12 max-w-12 object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#0F172A]">{product.name}</h3>
              <StatusPill type="disponible" size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{product.subtitle}</p>
            <p className="text-sm font-extrabold text-[#0B3A82] mt-1">
              {new Intl.NumberFormat('fr-FR').format(product.priceFCFA)} FCFA / {product.unit}
            </p>
          </div>
        </div>

        {/* 1. Station actuellement sélectionnée */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Station sélectionnée
            </h4>
            <span className="text-[10px] font-bold bg-[#1668E3] text-white px-2 py-0.5 rounded-full">
              Votre choix actuel
            </span>
          </div>

          <div className="p-4 rounded-2xl border-2 border-[#1668E3] bg-[#F7FAFF] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1668E3] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 fill-[#1668E3]" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-[#0F172A]">{currentStation.name}</h5>
                <p className="text-xs text-slate-500">{currentStation.address}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold text-[#1668E3]">{currentStation.distanceKm} km</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">En stock ({product.stockQuantity})</span>
                </div>
              </div>
            </div>

            <Button
              variant="yellow"
              size="sm"
              icon={<Calendar className="w-4 h-4" />}
              onClick={() => handleSelectStationAndReserve(currentStation)}
            >
              Réserver ici
            </Button>
          </div>
        </div>

        {/* 2. Stations alternatives proposant le même produit */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Stations alternatives disponibles
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              {alternativeStations.length} autre(s) station(s)
            </span>
          </div>

          <div className="space-y-2">
            {alternativeStations.map(altStation => (
              <div
                key={altStation.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-[#0F172A] truncate">
                      {altStation.name}
                    </h5>
                    <p className="text-[11px] text-slate-500 truncate">{altStation.address}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-700">{altStation.distanceKm} km</span>
                      <span className="text-slate-300">•</span>
                      <StatusPill type="disponible" size="sm" label="Disponible" />
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline-blue"
                  size="sm"
                  onClick={() => handleSelectStationAndReserve(altStation)}
                >
                  Choisir cette station
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

