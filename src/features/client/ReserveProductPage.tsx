import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { QRCodeCanvas } from '@/components/ui/QRCodeCanvas';
import { Reservation } from '@/types';
import {
  Info,
  Calendar,
  Banknote,
  Smartphone,
  Clock,
  RotateCw,
  MapPin,
  ChevronRight,
  ArrowRightLeft,
  Navigation,
} from 'lucide-react';

export const ReserveProductPage: React.FC = () => {
  const { stationId, productId } = useParams<{ stationId: string; productId: string }>();
  const navigate = useNavigate();

  const { products, stations, selectedStationId } = useAppStore(s => ({
    products: s.products,
    stations: s.stations,
    selectedStationId: s.selectedStationId,
  }));

  const product =
    products.find(p => p.id === productId) || products[0];
  const currentStation =
    stations.find(s => s.id === stationId) ||
    stations.find(s => s.id === selectedStationId) ||
    stations[0];

  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'place' | 'mobile_money'>('place');
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Alternative stations offering this same product
  const alternativeStations = stations.filter(s => s.id !== currentStation.id);

  const handleConfirmReservation = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const res = store.createReservation({
        productId: product.id,
        stationId: currentStation.id,
        quantity,
        paymentMethod,
      });

      setIsSubmitting(false);

      if (paymentMethod === 'mobile_money') {
        navigate(`/reservations/${res.id}/paiement`);
      } else {
        setConfirmedReservation(res);
      }
    }, 400);
  };

  const handleSwitchStation = (newStationId: string) => {
    store.setSelectedStation(newStationId);
    navigate(`/stations/${newStationId}/reserver/${product.id}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white min-h-full pb-16 max-w-5xl mx-auto">
      {/* Station information pill */}
      <div className="flex items-center justify-between p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl mb-6 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1668E3] text-white flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Station sélectionnée</div>
            <div className="text-sm font-bold text-[#0B3A82]">{currentStation.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#1668E3] bg-white px-2.5 py-1 rounded-xl border border-blue-100">
            {currentStation.distanceKm} km
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">{currentStation.address}</span>
        </div>
      </div>

      {/* Responsive layout: 1 col on mobile, 2 cols on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 lg:items-start">
        {/* ================= LEFT COLUMN: PRODUCT HERO & ALTERNATIVES ================= */}
        <div className="space-y-6">
          {/* Product Display Card (Screen 04B / 05C) */}
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white rounded-3xl border border-[#DCE4F0] shadow-station-card text-center relative">
            <div className="w-32 h-36 flex items-center justify-center mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-32 max-w-32 object-contain drop-shadow-md"
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">{product.name}</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{product.subtitle}</p>
            <div className="mt-4 flex items-center gap-2.5">
              <StatusPill type="disponible" size="md" />
              <span className="text-sm font-extrabold text-[#0B3A82] bg-slate-100 px-3 py-1 rounded-full">
                {new Intl.NumberFormat('fr-FR').format(product.priceFCFA)} FCFA / {product.unit}
              </span>
            </div>
          </div>

          {/* Alternative stations list */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-[#1668E3]" />
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Stations alternatives pour ce produit
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                {alternativeStations.length} disponibles
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ce même produit est disponible dans d'autres stations proches. Vous pouvez basculer votre réservation en 1 clic :
            </p>

            <div className="space-y-2.5">
              {alternativeStations.map(altStation => (
                <div
                  key={altStation.id}
                  className="p-3.5 bg-slate-50 hover:bg-blue-50/50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#1668E3] shrink-0">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#0F172A] truncate">
                        {altStation.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {altStation.address} • <span className="text-[#1668E3] font-semibold">{altStation.distanceKm} km</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSwitchStation(altStation.id)}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-[#0B3A82] hover:bg-[#1668E3] text-white text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-2xs"
                  >
                    <span>Changer</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: QUANTITY, PAYMENT & CONFIRMATION ================= */}
        <div className="space-y-5 lg:sticky lg:top-24">
          {/* Section Quantité */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#0F172A]">Quantité à réserver</label>
            <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs">
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={20}
                unitLabel={product.unit}
                size="md"
              />
              <div className="text-right">
                <div className="text-xs text-slate-400">Total estimé</div>
                <div className="text-base sm:text-lg font-extrabold text-[#0B3A82]">
                  {new Intl.NumberFormat('fr-FR').format(product.priceFCFA * quantity)} FCFA
                </div>
              </div>
            </div>
          </div>

          {/* Info Blue Alert Box (Screen 04B) */}
          <div className="flex items-center gap-3 p-3.5 bg-[#EEF4FD] rounded-2xl border border-[#D8E6FC] text-[#1668E3]">
            <div className="w-6 h-6 rounded-full bg-[#1668E3] text-white flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 stroke-[2.5]" />
            </div>
            <p className="text-xs font-semibold text-[#1668E3]">
              Votre réservation est valable pendant <span className="font-extrabold">30 minutes</span> à compter de la confirmation.
            </p>
          </div>

          {/* Section Mode de paiement */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#0F172A]">Mode de paiement</label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Payer sur place */}
              <div
                onClick={() => setPaymentMethod('place')}
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all duration-150 min-h-[110px] ${
                  paymentMethod === 'place'
                    ? 'border-[#1668E3] bg-[#F5F8FE] shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'place' ? 'border-[#1668E3]' : 'border-slate-300'
                    }`}
                  >
                    {paymentMethod === 'place' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1668E3]" />
                    )}
                  </span>
                  <Banknote className="w-6 h-6 text-[#10B981]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A] mt-2">Payer sur place</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    Présentez votre réservation à la station
                  </div>
                </div>
              </div>

              {/* Option 2: Mobile Money */}
              <div
                onClick={() => setPaymentMethod('mobile_money')}
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all duration-150 min-h-[110px] ${
                  paymentMethod === 'mobile_money'
                    ? 'border-[#1668E3] bg-[#F5F8FE] shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'mobile_money' ? 'border-[#1668E3]' : 'border-slate-300'
                    }`}
                  >
                    {paymentMethod === 'mobile_money' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1668E3]" />
                    )}
                  </span>
                  <Smartphone className="w-6 h-6 text-[#1668E3]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A] mt-2">Mobile Money</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    Payez via MTN ou Airtel Money
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Yellow Confirm Button (Screen 04B / 05C) */}
          <Button
            variant="yellow"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            icon={<Calendar className="w-5 h-5" />}
            onClick={handleConfirmReservation}
          >
            Confirmer la réservation
          </Button>

          {/* ================= RESULT: QR CODE DE RÉSERVATION (Screen 05C) ================= */}
          {confirmedReservation && (
            <div className="p-5 rounded-3xl border border-[#DCE4F0] bg-white shadow-station-card space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center">
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Votre QR Code de réservation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Présentez ce code à la station pour confirmer votre retrait.
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 pt-2">
                <QRCodeCanvas value={confirmedReservation.code} size={120} />

                <div className="flex flex-col justify-center space-y-2.5">
                  <div className="p-3 bg-[#EEF4FD] rounded-xl border border-[#DCE8FB]">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1668E3]">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Réservation N°</span>
                    </div>
                    <div className="text-xs font-extrabold text-[#0B3A82] mt-0.5 font-mono">
                      {confirmedReservation.code}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold px-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Expire dans : <span className="font-mono font-bold text-[#1668E3]">29:45</span></span>
                  </div>
                </div>
              </div>

              <Button
                variant="navy"
                size="md"
                fullWidth
                onClick={() => navigate('/reservations')}
              >
                Voir mes réservations
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
