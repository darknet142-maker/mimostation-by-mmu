import React, { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { QRCodeCanvas } from '@/components/ui/QRCodeCanvas';
import { Modal } from '@/components/ui/Modal';
import {
  ShoppingCart,
  Search,
  ScanLine,
  X,
  Banknote,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Info,
} from 'lucide-react';

export const CaissiereDashboardPage: React.FC = () => {
  const { products, cart, boutiqueSales, lastCompletedSale } = useAppStore(s => ({
    products: s.products,
    cart: s.cart,
    boutiqueSales: s.boutiqueSales,
    lastCompletedSale: s.lastCompletedSale,
  }));

  const [searchQuery, setSearchQuery] = useState('');
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [cashGiven, setCashGiven] = useState('');
  const [barcodeScannerOpen, setBarcodeScannerOpen] = useState(false);

  // Filter 10 POS products
  const posProducts = products
    .filter(p => p.id.startsWith('pos-'))
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Calculate cart total
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.priceFCFA * item.quantity,
    0
  );

  const handleCheckout = (paymentMethod: 'Mobile Money' | 'Espèces') => {
    store.checkoutBoutiqueSale(paymentMethod);
    setCashModalOpen(false);
    setCashGiven('');
  };

  // Stock alert items
  const alertProducts = products.filter(p => p.id.startsWith('pos-')).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* ================= TOP WORKSPACE: CATALOGUE (LEFT) + PANIER (RIGHT) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Catalogue Produits (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#DCE4F0] shadow-station-card p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Top Bar: Nouvelle Vente + N° VTE */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#1668E3]" />
                <h2 className="text-base font-extrabold text-[#0F172A]">Nouvelle Vente</h2>
              </div>
              <span className="font-mono text-xs font-bold bg-[#EEF4FD] text-[#0B3A82] px-3 py-1 rounded-full border border-[#DCE8FB]">
                N° VTE-20261110-048
              </span>
            </div>

            {/* Search Bar + Barcode Scanner Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F1F5F9] rounded-xl text-xs sm:text-sm border-0 focus:ring-2 focus:ring-[#1668E3] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setBarcodeScannerOpen(true)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                title="Scanner code-barres"
              >
                <ScanLine className="w-5 h-5 text-[#1668E3]" />
              </button>
            </div>

            {/* Grid of 10 Products (Screen 02) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
              {posProducts.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => store.addToCart(prod)}
                  className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col items-center text-center hover:border-blue-500 hover:shadow-md cursor-pointer transition-all active:scale-95 group"
                >
                  <div className="w-14 h-16 flex items-center justify-center mb-1">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="max-h-14 max-w-14 object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="text-xs font-bold text-[#0F172A] leading-tight mt-1 line-clamp-1">
                    {prod.name}
                  </h3>
                  <p className="text-[11px] font-extrabold text-[#0B3A82] mt-0.5">
                    {new Intl.NumberFormat('fr-FR').format(prod.priceFCFA)} FCFA
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Panier (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#DCE4F0] shadow-station-card p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Panier Title */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#0B3A82]" />
                <h2 className="text-base font-extrabold text-[#0F172A]">Panier</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {cart.length} article(s)
              </span>
            </div>

            {/* Cart Items List (Screen 02) */}
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <ShoppingCart className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">Panier vide. Cliquez sur un produit pour l'ajouter.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                {cart.map(item => (
                  <div
                    key={item.product.id}
                    className="py-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <img
                        src={item.product.image}
                        alt=""
                        className="w-8 h-8 object-contain shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#0F172A] truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {new Intl.NumberFormat('fr-FR').format(item.product.priceFCFA)} FCFA
                        </p>
                      </div>
                    </div>

                    <QuantityStepper
                      value={item.quantity}
                      onChange={qty =>
                        store.updateCartQuantity(item.product.id, qty - item.quantity)
                      }
                      size="sm"
                    />

                    <div className="w-20 text-right font-extrabold text-xs text-[#0F172A]">
                      {new Intl.NumberFormat('fr-FR').format(
                        item.product.priceFCFA * item.quantity
                      )}{' '}
                      FCFA
                    </div>

                    <button
                      type="button"
                      onClick={() => store.removeFromCart(item.product.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded-full"
                      aria-label="Supprimer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Bottom: Total à payer & Payment Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Total à payer :</span>
              <span className="text-2xl font-extrabold text-[#1668E3] tracking-tight">
                {new Intl.NumberFormat('fr-FR').format(cartTotal)} FCFA
              </span>
            </div>

            {/* 2 Payment Buttons (Screen 02) */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="soft-blue"
                size="lg"
                disabled={cart.length === 0}
                icon={<Banknote className="w-5 h-5 text-[#1668E3]" />}
                onClick={() => setCashModalOpen(true)}
              >
                Espèces
              </Button>

              <Button
                variant="primary"
                size="lg"
                disabled={cart.length === 0}
                icon={<Smartphone className="w-5 h-5 text-white" />}
                onClick={() => handleCheckout('Mobile Money')}
              >
                Mobile Money
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM ROW (3 CARDS from Screen 02) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Ventes récentes (Bottom Left) */}
        <SectionCard
          title="Ventes récentes"
          icon={<RotateCw className="w-4 h-4" />}
          actionLabel="Voir tout"
          actionHref="/personnel/caissiere/rapports"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-2.5">Heure</th>
                  <th className="pb-2.5">Produit(s)</th>
                  <th className="pb-2.5">Montant</th>
                  <th className="pb-2.5">Paiement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {boutiqueSales.slice(0, 5).map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 font-semibold text-slate-800">{sale.time}</td>
                    <td className="py-2.5 font-semibold text-slate-700 truncate max-w-[90px]">
                      {sale.items.map(i => i.productName).join(' + ')}
                    </td>
                    <td className="py-2.5 font-bold text-[#0B3A82]">
                      {new Intl.NumberFormat('fr-FR').format(sale.totalFCFA)} FCFA
                    </td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-slate-700">
                        {sale.paymentMethod === 'Mobile Money' ? (
                          <>
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold">
                              ✓
                            </span>
                            <span>Mobile Money</span>
                          </>
                        ) : (
                          <>
                            <Banknote className="w-3.5 h-3.5 text-blue-600" />
                            <span>Espèces</span>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Card 2: Alertes Stock (Bottom Middle) */}
        <SectionCard
          title="Alertes Stock"
          icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
          actionLabel="Voir tout"
          actionHref="/personnel/caissiere/stocks"
        >
          <div className="space-y-2.5">
            {alertProducts.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <img src={p.image} alt="" className="w-7 h-7 object-contain" />
                  <span className="text-xs font-bold text-slate-800">{p.name}</span>
                </div>
                <StatusPill
                  type={p.stockQuantity <= p.minStockThreshold ? 'stock-faible' : 'stock-ok'}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Card 3: Paiement confirmé ! (Bottom Right, Screen 02) */}
        <div className="bg-white rounded-2xl border border-[#DCE4F0] shadow-station-card p-5 flex flex-col justify-between items-center text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#E6F7EF] text-[#10B981] flex items-center justify-center mb-2">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-extrabold text-[#0F172A]">
              Paiement confirmé !
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Présentez le reçu au client</p>
          </div>

          {/* Real QR Code of ticket */}
          <div className="my-3">
            <QRCodeCanvas
              value={lastCompletedSale ? lastCompletedSale.ticketNumber : 'TKT-20261110-048'}
              size={120}
            />
          </div>

          {/* Ticket Number Pill */}
          <div className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#EEF4FD] rounded-xl text-xs font-semibold text-[#0B3A82] border border-[#DCE8FB]">
            <Info className="w-4 h-4 text-[#1668E3]" />
            <span>Ticket N° : <span className="font-mono font-bold">{lastCompletedSale ? lastCompletedSale.ticketNumber : 'TKT-20261110-048'}</span></span>
          </div>
        </div>
      </div>

      {/* Cash Payment Change Calculator Modal */}
      {cashModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setCashModalOpen(false)}
          title="Encaissement Espèces"
          subtitle={`Total commande : ${new Intl.NumberFormat('fr-FR').format(cartTotal)} FCFA`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Montant reçu du client (FCFA)
              </label>
              <input
                type="number"
                step="100"
                value={cashGiven}
                onChange={e => setCashGiven(e.target.value)}
                placeholder="Ex : 2000, 5000, 10000"
                className="w-full p-3 rounded-xl border border-slate-300 text-lg font-bold"
              />
            </div>

            {/* Quick cash pills */}
            <div className="flex gap-2">
              {[2000, 5000, 10000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCashGiven(String(amt))}
                  className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  {amt} F
                </button>
              ))}
            </div>

            {Number(cashGiven) > 0 && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-sm">
                <span className="font-semibold text-emerald-800">Monnaie à rendre :</span>
                <span className="text-lg font-extrabold text-emerald-700">
                  {new Intl.NumberFormat('fr-FR').format(
                    Math.max(0, Number(cashGiven) - cartTotal)
                  )}{' '}
                  FCFA
                </span>
              </div>
            )}

            <Button
              variant="yellow"
              size="lg"
              fullWidth
              onClick={() => handleCheckout('Espèces')}
            >
              Valider le paiement et imprimer reçu
            </Button>
          </div>
        </Modal>
      )}

      {/* Barcode scanner simulation */}
      {barcodeScannerOpen && (
        <Modal
          isOpen={true}
          onClose={() => setBarcodeScannerOpen(false)}
          title="Lecteur Code-Barres"
          subtitle="Pointez la douchette ou caméra vers l'article"
          maxWidth="sm"
        >
          <div className="space-y-3 text-center">
            <div className="p-8 bg-slate-900 rounded-2xl flex items-center justify-center border-2 border-dashed border-blue-400">
              <ScanLine className="w-16 h-16 text-blue-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500">
              Sélectionnez un article pour simuler la lecture du code-barres :
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {posProducts.slice(0, 4).map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    store.addToCart(p);
                    setBarcodeScannerOpen(false);
                  }}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-blue-50 text-left font-semibold truncate"
                >
                  + {p.name}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
