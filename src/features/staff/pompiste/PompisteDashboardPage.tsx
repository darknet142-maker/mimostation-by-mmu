import React, { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { QRCodeCanvas } from '@/components/ui/QRCodeCanvas';
import { ASSETS } from '@/config/assets';
import {
  Fuel,
  Droplet,
  Coins,
  CreditCard,
  Smartphone,
  Banknote,
  Check,
  CheckCircle2,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const PompisteDashboardPage: React.FC = () => {
  const { pumps, currentEmployee, tanks } = useAppStore(s => ({
    pumps: s.pumps,
    currentEmployee: s.currentEmployee,
    tanks: s.tanks,
  }));

  // Pompiste's assigned pump (defaults to Pompe #1 or first assigned pump)
  const assignedPumpNumbers =
    currentEmployee?.assignedPumps && currentEmployee.assignedPumps.length > 0
      ? currentEmployee.assignedPumps
      : [1];

  const [selectedPumpNumber, setSelectedPumpNumber] = useState<number>(assignedPumpNumbers[0] || 1);
  const activePump = pumps.find(p => p.number === selectedPumpNumber) || pumps[0];
  const associatedTank = tanks.find(t => t.fuelType === activePump.fuelType) || tanks[0];

  // Official fixed tariff (non-editable by pompiste)
  const pricePerLiter = activePump.fuelType === 'Super' ? 700 : 650;

  // Distribution configuration states
  const [inputMode, setInputMode] = useState<'liters' | 'amount'>('liters');
  const [selectedPresetLiters, setSelectedPresetLiters] = useState<number | null>(10);
  const [customLiters, setCustomLiters] = useState<string>('2.50');
  const [selectedPresetAmount, setSelectedPresetAmount] = useState<number | null>(null);

  // Computed values
  const currentVolumeLiters =
    inputMode === 'liters'
      ? (selectedPresetLiters !== null ? selectedPresetLiters : parseFloat(customLiters) || 0)
      : ((selectedPresetAmount || 0) / pricePerLiter);

  const currentTotalAmount = Math.round(currentVolumeLiters * pricePerLiter);

  // Payment mode state ('Mobile Money' | 'Espèces' | 'Carte bancaire')
  const [paymentMethod, setPaymentMethod] = useState<'Mobile Money' | 'Espèces' | 'Carte bancaire'>('Mobile Money');

  // Success toast state
  const [successToast, setSuccessToast] = useState<{
    show: boolean;
    liters: number;
    amount: number;
    method: string;
  } | null>(null);

  // Underground tank projection after current service
  const projectedRemainingLiters = Math.max(0, associatedTank.currentLiters - currentVolumeLiters);
  const projectedPercent = Math.round((projectedRemainingLiters / associatedTank.capacityLiters) * 100);

  // Dynamic QR Code content representing the live transaction
  const qrPayload = `STATIONPRO-P${activePump.number}-${currentVolumeLiters.toFixed(2)}L-${currentTotalAmount}FCFA-${paymentMethod}-${Date.now()}`;

  // Handle preset selection in Liters mode
  const handleSelectLitersPreset = (liters: number) => {
    setSelectedPresetLiters(liters);
    setCustomLiters(liters.toFixed(2));
  };

  // Handle custom manual input
  const handleCustomLitersChange = (val: string) => {
    setSelectedPresetLiters(null);
    setCustomLiters(val);
  };

  // Handle preset selection in Amount mode
  const handleSelectAmountPreset = (amt: number) => {
    setSelectedPresetAmount(amt);
  };

  // Handle transaction validation
  const handleValidateTransaction = () => {
    if (currentVolumeLiters <= 0) return;

    store.recordFuelTransaction({
      pumpNumber: activePump.number,
      product: activePump.fuelType,
      quantityLiters: currentVolumeLiters,
      amountFCFA: currentTotalAmount,
      paymentMethod: paymentMethod === 'Carte bancaire' ? 'Carte' : paymentMethod,
    });

    setSuccessToast({
      show: true,
      liters: currentVolumeLiters,
      amount: currentTotalAmount,
      method: paymentMethod,
    });

    // Auto-dismiss toast after 4 seconds
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* ================= SUCCESS BANNER NOTIFICATION ================= */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="text-sm font-extrabold flex items-center gap-2">
                <span>Distribution Pompe #{activePump.number} validée avec succès !</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div className="text-xs text-emerald-100 font-medium">
                {successToast.liters.toFixed(2)} L servis • {new Intl.NumberFormat('fr-FR').format(successToast.amount)} FCFA encaissés via {successToast.method}.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl font-bold transition-colors"
          >
            Fermer
          </button>
        </div>
      )}

      {/* ================= MAIN OPERATIONAL WORKSPACE (2 COLUMNS: ZERO CLUTTER) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: PUMP INFO & DISTRIBUTION (7 COLS) ================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Pompe #1 (Super) & Fixed Price Badge */}
          <div className="bg-white rounded-3xl border border-[#DCE4F0] p-6 shadow-station-card flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
            {/* 3D Fuel Nozzle Visual with droplets */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
              <img
                src={ASSETS.products.super}
                alt={activePump.fuelType}
                className="max-h-28 max-w-28 object-contain drop-shadow-md"
              />
            </div>

            {/* Details & Official Fixed Price */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
                  Pompe #{activePump.number} ({activePump.fuelType})
                </h2>
                <span className="inline-flex items-center gap-1 bg-[#10B981] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Tarif fixe</span>
                </span>
              </div>

              <div className="text-xs text-slate-500 font-semibold">Tarif fixé :</div>

              {/* High-visibility Blue Price Badge */}
              <div className="inline-block bg-[#0052CC] hover:bg-[#0047b3] text-white font-extrabold text-2xl sm:text-3xl px-6 py-2.5 rounded-2xl shadow-md tracking-tight transition-colors">
                {pricePerLiter} FCFA / Litre
              </div>
            </div>

            {/* Multiple pumps switcher if pompiste has more than 1 pump */}
            {assignedPumpNumbers.length > 1 && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {assignedPumpNumbers.map(pNum => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setSelectedPumpNumber(pNum)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      selectedPumpNumber === pNum
                        ? 'bg-[#1668E3] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pompe #{pNum}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Fuel Distribution Configuration & Calculated Output */}
          <div className="bg-white rounded-3xl border border-[#DCE4F0] p-6 shadow-station-card space-y-5">
            {/* Mode Switch Tabs (Litres vs Montant FCFA) */}
            <div className="grid grid-cols-2 gap-2 bg-[#F1F5F9] p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setInputMode('liters')}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                  inputMode === 'liters'
                    ? 'bg-[#0052CC] text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Fuel className="w-4 h-4" />
                <span>Saisir en Litres (L)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputMode('amount');
                  setSelectedPresetAmount(selectedPresetAmount || 10000);
                }}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                  inputMode === 'amount'
                    ? 'bg-[#0052CC] text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>Saisir en Montant (FCFA)</span>
              </button>
            </div>

            {/* Section Title */}
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A]">
                {inputMode === 'liters'
                  ? 'Volume de carburant à servir (Litres)'
                  : 'Montant de carburant à servir (FCFA)'}
              </h3>
            </div>

            {/* Preset Buttons Grid */}
            {inputMode === 'liters' ? (
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                {[10, 20, 30, 50].map(liters => {
                  const isSelected = selectedPresetLiters === liters;
                  return (
                    <button
                      key={liters}
                      type="button"
                      onClick={() => handleSelectLitersPreset(liters)}
                      className={`relative py-3.5 sm:py-4 px-2 rounded-2xl font-black text-base sm:text-lg transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#0052CC] text-white shadow-md scale-[1.02]'
                          : 'bg-white border-2 border-[#DCE4F0] text-[#0F172A] hover:border-blue-400 active:scale-95'
                      }`}
                    >
                      <span>{liters} L</span>
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white text-[#0052CC] flex items-center justify-center text-xs font-black shadow-xs">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                {[2000, 5000, 10000, 20000].map(amt => {
                  const isSelected = selectedPresetAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectAmountPreset(amt)}
                      className={`relative py-3.5 sm:py-4 px-2 rounded-2xl font-black text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#0052CC] text-white shadow-md scale-[1.02]'
                          : 'bg-white border-2 border-[#DCE4F0] text-[#0F172A] hover:border-blue-400 active:scale-95'
                      }`}
                    >
                      <span>{new Intl.NumberFormat('fr-FR').format(amt)} F</span>
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white text-[#0052CC] flex items-center justify-center text-xs font-black shadow-xs">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Optional Manual Stepper / Input Field */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">Saisie précise ou libre :</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={inputMode === 'liters' ? (selectedPresetLiters !== null ? selectedPresetLiters : customLiters) : (selectedPresetAmount || 0)}
                  onChange={e => {
                    if (inputMode === 'liters') handleCustomLitersChange(e.target.value);
                    else setSelectedPresetAmount(parseFloat(e.target.value) || 0);
                  }}
                  className="w-24 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono text-center text-[#0B3A82] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="font-bold text-slate-500">
                  {inputMode === 'liters' ? 'Litres' : 'FCFA'}
                </span>
              </div>
            </div>

            {/* Calculated Values Container (Light Blue Box) */}
            <div className="bg-[#EEF4FD] rounded-2xl border border-[#DCE8FB] p-5 space-y-4">
              {/* Row 1: Quantité calculée */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1668E3] flex items-center justify-center shrink-0">
                  <Droplet className="w-6 h-6 fill-[#1668E3]" />
                </div>
                <div>
                  <div className="text-xs text-slate-600 font-semibold">Quantité calculée :</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0B3A82] font-mono tracking-tight">
                    {currentVolumeLiters.toFixed(2)} Litres
                  </div>
                </div>
              </div>

              {/* Row 2: Total à encaisser */}
              <div className="flex items-center gap-3 pt-1 border-t border-blue-200/50">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-600 font-semibold">Total à encaisser :</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0B3A82] font-mono tracking-tight">
                    {new Intl.NumberFormat('fr-FR').format(currentTotalAmount)} FCFA
                  </div>
                </div>
              </div>
            </div>

            {/* Underground Tank Level Simulator Bar */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs">
                  🛢️
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Niveau cuve après service :</div>
                  <div className="text-sm font-extrabold text-emerald-600 font-mono">
                    {projectedRemainingLiters.toLocaleString('fr-FR', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}{' '}
                    L restants
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-28 sm:w-32 bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    style={{ width: `${projectedPercent}%` }}
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  />
                </div>
                <span className="text-xs font-bold text-slate-700">≈ {projectedPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: PAYMENT MODE, QR CODE & VALIDATE (5 COLS) ================= */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#DCE4F0] p-6 shadow-station-card space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Card Header: Mode d'encaissement */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <CreditCard className="w-5 h-5 text-[#0B3A82]" />
              <h2 className="text-base font-extrabold text-[#0F172A]">Mode d'encaissement</h2>
            </div>

            {/* 3 Payment Method Selectors */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Option 1: Mobile Money */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Mobile Money')}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center justify-between transition-all relative ${
                  paymentMethod === 'Mobile Money'
                    ? 'border-2 border-[#1668E3] bg-[#F0F5FD] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="relative my-1">
                  <Smartphone className="w-7 h-7 text-[#1668E3]" />
                  {paymentMethod === 'Mobile Money' && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[9px] font-black">
                      ✓
                    </span>
                  )}
                </div>
                <div className="text-xs font-extrabold text-[#0F172A] mt-1">Mobile Money</div>
                <div className="text-[9px] text-slate-500 leading-tight mt-0.5">
                  (Airtel Money / Moov Money)
                </div>
              </button>

              {/* Option 2: Espèces */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Espèces')}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center justify-between transition-all ${
                  paymentMethod === 'Espèces'
                    ? 'border-2 border-[#1668E3] bg-[#F0F5FD] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="my-1">
                  <Banknote className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="text-xs font-extrabold text-[#0F172A] mt-1">Espèces</div>
                <div className="text-[9px] text-slate-400 leading-tight mt-0.5">Cash direct</div>
              </button>

              {/* Option 3: Carte bancaire */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Carte bancaire')}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center justify-between transition-all ${
                  paymentMethod === 'Carte bancaire'
                    ? 'border-2 border-[#1668E3] bg-[#F0F5FD] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="my-1">
                  <CreditCard className="w-7 h-7 text-blue-600" />
                </div>
                <div className="text-xs font-extrabold text-[#0F172A] mt-1">Carte bancaire</div>
                <div className="text-[9px] text-slate-400 leading-tight mt-0.5">TPE / Visa</div>
              </button>
            </div>

            {/* Instruction Banner */}
            <div className="bg-[#EEF4FD] border border-[#DCE8FB] p-3 rounded-2xl flex items-center gap-2.5">
              <Info className="w-5 h-5 text-[#1668E3] shrink-0" />
              <p className="text-xs font-semibold text-[#0B3A82]">
                Scannez le QR Code ou présentez-le au caissier.
              </p>
            </div>

            {/* Dynamic Scannable QR Code */}
            <div className="p-4 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center my-2 shadow-2xs">
              <QRCodeCanvas value={qrPayload} size={155} />
              <div className="text-[10px] text-slate-400 font-mono mt-2">
                REF : P{activePump.number}-{currentVolumeLiters.toFixed(1)}L-{currentTotalAmount}F
              </div>
            </div>
          </div>

          {/* Large Action CTA Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleValidateTransaction}
              className="w-full bg-[#10B981] hover:bg-[#059669] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base py-4 px-5 rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-black">
                  ✓
                </span>
                <span>Valider la distribution & Encaisser</span>
              </div>
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
