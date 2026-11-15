import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { Button } from '@/components/ui/Button';
import { QRCodeCanvas } from '@/components/ui/QRCodeCanvas';
import { Clock, CheckCircle2, Smartphone } from 'lucide-react';
import { ASSETS } from '@/config/assets';

function computeRemainingSeconds(expiresAt?: string): number {
  if (!expiresAt) return 0;
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

export const PaymentMobileMoneyPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();

  const { reservations, stations } = useAppStore(s => ({
    reservations: s.reservations,
    stations: s.stations,
  }));

  const reservation =
    reservations.find(r => r.id === reservationId) ||
    reservations[0];

  const station = stations.find(s => s.id === reservation?.stationId) || stations[0];
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() =>
    computeRemainingSeconds(reservation?.expiresAt)
  );

  useEffect(() => {
    setSecondsRemaining(computeRemainingSeconds(reservation?.expiresAt));
    const timer = setInterval(() => {
      const rem = computeRemainingSeconds(reservation?.expiresAt);
      setSecondsRemaining(rem);
      if (rem === 0) {
        store.sweepExpiredReservations();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [reservation?.expiresAt]);

  const formatCountdown = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const airtelNum = station?.advancedSettings?.airtelMoneyNumber || '+241 074 00 00 00';
  const moovNum = station?.advancedSettings?.moovMoneyNumber || '+241 066 00 00 00';

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
          {reservation?.status === 'paid' ? 'Paiement Mobile Money confirmé !' : 'Réservation confirmée !'}
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          {reservation?.status === 'paid'
            ? 'Votre QR code est validé. Présentez-le directement à la station pour retirer votre commande.'
            : 'Veuillez effectuer votre paiement via Airtel Money ou Moov Money vers le compte marchand de la station.'}
        </p>
      </div>

      {/* Large Centered QR Code (Screen 04C) */}
      <div className="flex flex-col items-center">
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <QRCodeCanvas
            value={reservation ? reservation.code : 'STP-AUCUNE-RESERVATION'}
            size={180}
          />
        </div>

        {/* Status or Countdown Box */}
        {reservation?.status === 'paid' ? (
          <div className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold">Paiement Mobile Money confirmé</span>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#EEF4FD] text-[#0B3A82] rounded-full border border-[#DCE8FB]">
            <Clock className="w-4 h-4 text-[#1668E3]" />
            <span className="text-xs font-semibold">Temps restant :</span>
            <span className="font-mono text-sm font-extrabold text-[#1668E3]">
              {formatCountdown(secondsRemaining)}
            </span>
          </div>
        )}

        <p className="text-[11px] text-slate-500 mt-3 max-w-xs leading-relaxed">
          Présentez ce QR Code à la station pour confirmer votre paiement et retirer votre commande.
        </p>
      </div>

      {/* Numéros marchands de la station */}
      <div className="w-full bg-blue-50/70 rounded-2xl border border-blue-100 p-3.5 text-left space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0B3A82]">
          <Smartphone className="w-4 h-4 text-[#1668E3]" />
          <span>Comptes marchands Mobile Money ({station?.name || 'Station'})</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-white rounded-xl p-2.5 border border-blue-100 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Airtel Money</span>
            <span className="font-mono font-bold text-slate-900">{airtelNum}</span>
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-blue-100 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Moov Money</span>
            <span className="font-mono font-bold text-slate-900">{moovNum}</span>
          </div>
        </div>
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

      {/* Actions */}
      <div className="w-full pt-2 space-y-2.5">
        {reservation && reservation.status !== 'paid' && secondsRemaining > 0 && (
          <Button
            variant="yellow"
            size="lg"
            fullWidth
            icon={<CheckCircle2 className="w-5 h-5" />}
            onClick={() => store.confirmReservationPayment(reservation.id)}
          >
            Confirmer le paiement Mobile Money
          </Button>
        )}
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

