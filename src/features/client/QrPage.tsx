import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { QRCodeCanvas } from '@/components/ui/QRCodeCanvas';
import { Button } from '@/components/ui/Button';
import { QrCode, Clock } from 'lucide-react';

export const QrPage: React.FC = () => {
  const navigate = useNavigate();
  const { reservations } = useAppStore(s => ({
    reservations: s.reservations,
  }));

  const activeReservations = reservations.filter(
    r => r.status === 'pending' || r.status === 'awaiting_payment' || r.status === 'paid'
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 bg-white min-h-full max-w-xl mx-auto lg:rounded-3xl lg:border lg:border-slate-200/80 lg:shadow-xs lg:my-4">
      <div className="text-center pt-2 pb-1">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1668E3] flex items-center justify-center mx-auto mb-2">
          <QrCode className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#0F172A]">Mes QR Codes</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Vos codes actifs à présenter directement à la borne ou au guichet
        </p>
      </div>

      {activeReservations.length === 0 ? (
        <div className="text-center py-12 space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
          <QrCode className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Aucun QR code actif</h3>
          <p className="text-xs text-slate-500">
            Faites une réservation de bouteille de gaz ou carburant pour générer votre QR.
          </p>
          <Button variant="yellow" size="sm" onClick={() => navigate('/')}>
            Réserver maintenant
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {activeReservations.map(res => (
            <div
              key={res.id}
              className="p-5 rounded-3xl border border-[#DCE4F0] bg-white shadow-station-card flex flex-col items-center text-center space-y-3"
            >
              <div className="flex items-center justify-between w-full pb-2 border-b border-slate-100">
                <span className="font-mono text-xs font-extrabold text-[#1668E3]">
                  {res.code}
                </span>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {res.status === 'paid' ? 'Payé' : 'Actif'}
                </span>
              </div>

              <QRCodeCanvas value={res.code} size={160} />

              <div>
                <h3 className="text-base font-bold text-[#0F172A]">{res.productName}</h3>
                <p className="text-xs text-slate-500">
                  {res.quantity} {res.unit} • {res.stationName}
                </p>
              </div>

              <div className="w-full flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  30 min
                </span>
                <span className="font-extrabold text-[#0B3A82]">
                  {new Intl.NumberFormat('fr-FR').format(res.totalFCFA)} FCFA
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
