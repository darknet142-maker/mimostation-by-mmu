import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { QRCodeCanvas } from '@/components/ui/QRCodeCanvas';
import { ASSETS } from '@/config/assets';
import { resolveStationBranding } from '@/config/operators';
import { Reservation } from '@/types';
import {
  Calendar,
  Clock,
  QrCode,
  MapPin,
  Ban,
} from 'lucide-react';

export const ReservationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { reservations, products, stations } = useAppStore(s => ({
    reservations: s.reservations,
    products: s.products,
    stations: s.stations,
  }));

  const [selectedResForQr, setSelectedResForQr] = useState<Reservation | null>(null);
  const [resToCancel, setResToCancel] = useState<Reservation | null>(null);

  const getProductImage = (res: Reservation): string => {
    if (res.productImage) return res.productImage;
    const matched = products.find(p => p.id === res.productId);
    return matched?.image || ASSETS.official.services.panier;
  };

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
            En attente
          </span>
        );
      case 'awaiting_payment':
        return (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
            Paiement requis
          </span>
        );
      case 'paid':
        return (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Payée
          </span>
        );
      case 'collected':
        return (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            Retirée
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
            Annulée
          </span>
        );
      case 'expired':
        return (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
            Expirée
          </span>
        );
    }
  };

  return (
    <div className="p-4 space-y-4 bg-white min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A]">Mes réservations</h2>
          <p className="text-xs text-slate-500">Historique et réservations en cours</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
          {reservations.length} total
        </span>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Aucune réservation</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Vous n'avez pas encore effectué de réservation de carburant ou gaz.
          </p>
          <Button variant="navy" size="sm" onClick={() => navigate('/')}>
            Réserver maintenant
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reservations.map(res => {
            const productImg = getProductImage(res);
            const stationObj = stations.find(s => s.id === res.stationId);
            const stationBrand = stationObj ? resolveStationBranding(stationObj) : null;

            return (
              <div
                key={res.id}
                className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3.5"
              >
                {/* Header: Large visual Product Image + Name + Price + Status */}
                <div className="flex items-start gap-3.5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#F8FAFC] border border-slate-200 p-2 flex items-center justify-center shrink-0">
                    <img
                      src={productImg}
                      alt={res.productName}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      {getStatusBadge(res.status)}
                      <span className="font-mono text-[11px] font-extrabold text-[#1668E3] bg-blue-50 px-2 py-0.5 rounded-md">
                        {res.code}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-[#0F172A] leading-snug">
                      {res.productName}
                    </h3>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                        Quantité : {res.quantity} {res.unit}
                      </span>
                      <span className="text-base font-black text-[#0B3A82]">
                        {new Intl.NumberFormat('fr-FR').format(res.totalFCFA)} FCFA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Station Brand + Validity Row */}
                <div className="flex items-center justify-between gap-2 text-xs text-slate-600 pt-2.5 border-t border-slate-100">
                  <div className="flex items-center gap-2 min-w-0">
                    {stationBrand ? (
                      <img
                        src={stationBrand.logo}
                        alt={stationBrand.operator?.name || res.stationName}
                        className="w-5 h-5 rounded object-contain bg-white border border-slate-200 p-0.5 shrink-0"
                      />
                    ) : (
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="font-bold text-slate-800 truncate">
                      {stationBrand?.operator ? `${stationBrand.operator.name} • ` : ''}
                      {res.stationName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 font-semibold text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>30 min</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-0.5">
                  <Button
                    variant="soft-blue"
                    size="sm"
                    fullWidth
                    icon={<QrCode className="w-4 h-4" />}
                    onClick={() => setSelectedResForQr(res)}
                  >
                    Afficher QR
                  </Button>

                  {res.status === 'pending' || res.status === 'awaiting_payment' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      icon={<Ban className="w-4 h-4" />}
                      onClick={() => setResToCancel(res)}
                    >
                      Annuler
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Viewer Modal */}
      {selectedResForQr && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedResForQr(null)}
          title="QR Code de réservation"
          subtitle={`Code : ${selectedResForQr.code}`}
          maxWidth="sm"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <QRCodeCanvas value={selectedResForQr.code} size={200} />
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3 w-full text-left">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shrink-0">
                <img
                  src={getProductImage(selectedResForQr)}
                  alt={selectedResForQr.productName}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{selectedResForQr.productName}</h4>
                <p className="text-xs font-semibold text-slate-600">
                  {selectedResForQr.quantity} {selectedResForQr.unit} • {selectedResForQr.stationName}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 bg-blue-50 p-3 rounded-xl border border-blue-100">
              Présentez ce QR Code au personnel de la station pour finaliser votre retrait.
            </p>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Dialog */}
      {resToCancel && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setResToCancel(null)}
          onConfirm={() => store.cancelReservation(resToCancel.id)}
          title="Annuler la réservation"
          message={`Êtes-vous sûr de vouloir annuler la réservation ${resToCancel.code} ? Cette action est irréversible.`}
          confirmLabel="Oui, annuler"
          variant="danger"
        />
      )}
    </div>
  );
};
