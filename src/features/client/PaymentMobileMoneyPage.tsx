import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { Button } from '@/components/ui/Button';
import { QRCodeCanvas } from '@/components/ui/QRCodeCanvas';
import { Clock } from 'lucide-react';
import { ASSETS } from '@/config/assets';

export const PaymentMobileMoneyPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();

  const { reservations } = useAppStore(s => ({
    reservations: s.reservations,
  }));

  const reservation =
    reservations.find(r => r.id === reservationId) ||
    reservations[0];

  // 30 minute countdown ticking every second
  const [secondsRemaining, setSecondsRemaining] = useState<number>(29 * 60 + 45);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-between p-5 sm:p-8 bg-white min-h-full space-y-6 text-center max-w-lg mx-auto lg:my-6 lg:rounded-3xl lg:border lg:border-slate-200 lg:shadow-md">
      {/* Top Success Badge (Screen 04C) */}
      <div className="flex flex-col items-center pt-2">
        <div className="w-16 h-16 flex items-center justify-center mb-2">
          <img
            src={ASSETS.official.uiActions.disponible}
            alt="Confirmé"
            className="w-16 h-16 object-contain drop-shadow-sm"
          />
        </div>
        <h2 className="text-xl font-extrabold text-[#0F172A]">
          Réservation confirmée !
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Veuillez effectuer votre paiement via Mobile Money.
        </p>
      </div>

      {/* Large Centered QR Code (Screen 04C) */}
      <div className="flex flex-col items-center">
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <QRCodeCanvas
            value={reservation ? reservation.code : 'STP-20261110-458'}
            size={180}
          />
        </div>

        {/* Blue Countdown Box */}
        <div className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#EEF4FD] text-[#0B3A82] rounded-full border border-[#DCE8FB]">
          <Clock className="w-4 h-4 text-[#1668E3]" />
          <span className="text-xs font-semibold">Temps restant :</span>
          <span className="font-mono text-sm font-extrabold text-[#1668E3]">
            {formatCountdown(secondsRemaining)}
          </span>
        </div>

        <p className="text-[11px] text-slate-500 mt-3 max-w-xs leading-relaxed">
          Présentez ce QR Code à la station pour confirmer votre paiement.
        </p>
      </div>

      {/* Détails de votre réservation Card */}
      <div className="w-full bg-[#F8FAFC] rounded-2xl border border-slate-200 p-4 text-left space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] pb-1 border-b border-slate-200">
          <img src={ASSETS.official.services.recu} alt="" className="w-4 h-4 object-contain" />
          <span>Détails de votre réservation</span>
        </div>

        <div className="flex justify-between text-xs py-0.5">
          <span className="text-slate-500">Produit :</span>
          <span className="font-semibold text-slate-800">
            {reservation ? reservation.productName : 'Gaz Butane'}
          </span>
        </div>

        <div className="flex justify-between text-xs py-0.5">
          <span className="text-slate-500">Quantité :</span>
          <span className="font-semibold text-slate-800">
            {reservation ? `${reservation.quantity} ${reservation.unit}` : '1 bouteille (6 kg)'}
          </span>
        </div>

        <div className="flex justify-between text-xs py-0.5">
          <span className="text-slate-500">Station :</span>
          <span className="font-semibold text-slate-800">
            {reservation ? reservation.stationName : 'Ma Station'}
          </span>
        </div>

        <div className="flex justify-between text-xs pt-1.5 border-t border-slate-200">
          <span className="font-bold text-slate-700">Total :</span>
          <span className="font-bold text-[#0B3A82]">
            {reservation
              ? new Intl.NumberFormat('fr-FR').format(reservation.totalFCFA)
              : '6 000'}{' '}
            FCFA
          </span>
        </div>
      </div>

      {/* Bottom Button Navy (Screen 04C) */}
      <div className="w-full pt-2">
        <Button
          variant="navy"
          size="lg"
          fullWidth
          onClick={() => navigate('/reservations')}
        >
          Voir mes réservations
        </Button>
      </div>
    </div>
  );
};

