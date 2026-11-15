import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROLE_DEFINITIONS } from '@/data/fixtures';
import { store } from '@/services/store';
import { useAppStore } from '@/hooks/useAppStore';
import { StaffRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { PinInput } from '@/components/ui/PinInput';
import { Modal } from '@/components/ui/Modal';
import {
  Lock,
  ArrowRight,
  AlertCircle,
  Camera,
  KeyRound,
  MapPin,
} from 'lucide-react';

import { ASSETS } from '@/config/assets';

export const StaffPinLoginPage: React.FC = () => {
  const { role } = useParams<{ role: StaffRole }>();
  const navigate = useNavigate();

  const { stations, selectedStationId } = useAppStore(s => ({
    stations: s.stations || [],
    selectedStationId: s.selectedStationId,
  }));

  const roleDef = ROLE_DEFINITIONS.find(r => r.role === role) || ROLE_DEFINITIONS[0];

  const [pin, setPin] = useState<string>('');
  const [stationId, setStationId] = useState<string>(selectedStationId || stations[0]?.id || 'station-liberte');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [scannerModalOpen, setScannerModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setPin('');
    setErrorMsg('');
  }, [role]);

  const handleLogin = (pinToUse = pin) => {
    const cleanPin = pinToUse.replace(/\s+/g, '');
    if (cleanPin.length !== 4) {
      setErrorMsg('Veuillez entrer un code PIN à 4 chiffres.');
      return;
    }

    setIsLoggingIn(true);
    setErrorMsg('');

    setTimeout(() => {
      const res = store.login(roleDef.role, cleanPin, stationId);
      setIsLoggingIn(false);

      if (res.success) {
        navigate(`/personnel/${roleDef.role}`);
      } else {
        setErrorMsg(res.message || 'Code PIN incorrect.');
      }
    }, 300);
  };

  const handleBadgeScanned = () => {
    setScannerModalOpen(false);
    setPin(roleDef.defaultPin);
    handleLogin(roleDef.defaultPin);
  };

  return (
    <div className="min-h-screen bg-[#F0F4FB] flex flex-col justify-between items-center">
      {/* Responsive centered container */}
      <div className="w-full max-w-md md:max-w-xl lg:max-w-xl bg-white min-h-screen flex flex-col shadow-2xl relative">
        {/* Navy Header Bar (Screen 01B) */}
        <header className="bg-[#0A285F] text-white px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-md">
          <BackButton
            fallbackTo="/personnel"
            label="Postes"
            ariaLabel="Retour au choix du poste"
            variant="ghost-dark"
            compactOnMobile
          />
          <h1 className="text-base sm:text-lg font-bold text-white text-center flex-1 pr-6">
            Connexion
          </h1>
          <div className="w-2" />
        </header>

        {/* Form Body (Screen 01B) */}
        <div className="flex-1 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Avatar & Role Info */}
            <div className="flex flex-col items-center text-center pt-2">
              <div className="w-24 h-24 rounded-full border-4 border-blue-100 shadow-md bg-blue-500 overflow-hidden mb-3">
                <img
                  src={roleDef.avatar}
                  alt={roleDef.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-extrabold text-[#0F172A]">
                {roleDef.title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {roleDef.subtitle}
              </p>
            </div>

            {/* Light Blue Instruction Box (Screen 01B) */}
            <div className="flex items-center gap-3 p-3.5 bg-[#EEF4FD] rounded-2xl border border-[#D8E6FC] text-[#0A285F]">
              <div className="w-7 h-7 rounded-full bg-[#1668E3] text-white flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold leading-snug">
                Entrez votre code de connexion pour accéder à votre poste
              </p>
            </div>

            {/* Station selection */}
            <div className="space-y-1.5">
              <label htmlFor="staff-station-select" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1668E3]" />
                <span>Station d&apos;affectation</span>
              </label>
              <select
                id="staff-station-select"
                value={stationId}
                onChange={e => {
                  setStationId(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1668E3]"
              >
                {stations.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} — {st.city}
                  </option>
                ))}
              </select>
            </div>

            {/* 4 Square PIN Boxes */}
            <div className="pt-1 space-y-3">
              <PinInput
                value={pin}
                onChange={val => {
                  setPin(val);
                  setErrorMsg('');
                  if (val.replace(/\s+/g, '').length === 4) {
                    handleLogin(val);
                  }
                }}
              />

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setPin(roleDef.defaultPin);
                    setErrorMsg('');
                    handleLogin(roleDef.defaultPin);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tester en 1 clic — PIN Démo ({roleDef.defaultPin})</span>
                </button>
              </div>

              {errorMsg && (
                <div role="alert" className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 mt-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* On-Screen Keypad for Fast Touch Input */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    if (k === 'C') {
                      setPin('');
                    } else if (k === '⌫') {
                      setPin(prev => prev.slice(0, -1));
                    } else {
                      if (pin.length < 4) {
                        const next = pin + k;
                        setPin(next);
                        if (next.length === 4) {
                          handleLogin(next);
                        }
                      }
                    }
                  }}
                  className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-blue-50 border border-slate-200 text-lg font-bold text-slate-800 transition-colors flex items-center justify-center"
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Prominent Yellow Button (Screen 01B: Se connecter) */}
            <div className="pt-2">
              <Button
                variant="yellow"
                size="lg"
                fullWidth
                isLoading={isLoggingIn}
                icon={
                  <span className="w-6 h-6 rounded-full bg-[#0A162B] text-white flex items-center justify-center text-xs">
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                }
                onClick={() => handleLogin()}
              >
                Se connecter
              </Button>
            </div>

            {/* "ou" Divider Line */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">ou</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Outlined Blue Button: Scanner votre badge (Screen 01B) */}
            <Button
              variant="outline-blue"
              size="lg"
              fullWidth
              icon={<img src={ASSETS.official.services.qrCode} alt="" className="w-5 h-5 object-contain" />}
              onClick={() => setScannerModalOpen(true)}
            >
              Scanner votre badge
            </Button>
          </div>

          {/* Bottom Status (Screen 01B) */}
          <div className="pt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
            <img src={ASSETS.official.uiActions.disponible} alt="" className="w-5 h-5 object-contain" />
            <span>Accès sécurisé réservé au personnel</span>
          </div>
        </div>
      </div>

      {/* Badge Scanner Simulation Modal */}
      {scannerModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setScannerModalOpen(false)}
          title="Scanner votre badge"
          subtitle="Placez votre QR Code ou badge devant l'objectif"
          maxWidth="sm"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative w-56 h-56 bg-slate-900 rounded-2xl flex items-center justify-center border-4 border-[#1668E3] overflow-hidden">
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 animate-pulse shadow-md shadow-red-500" />
              <Camera className="w-12 h-12 text-slate-600" />
              <span className="absolute bottom-3 text-[10px] text-white/60">
                Caméra active / Détection automatique
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Badge détecté : <span className="font-bold text-[#0B3A82]">{roleDef.title} ({roleDef.defaultEmployeeName})</span>
            </p>

            <Button
              variant="yellow"
              size="md"
              fullWidth
              onClick={handleBadgeScanned}
            >
              Valider le scan du badge (Simuler)
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

