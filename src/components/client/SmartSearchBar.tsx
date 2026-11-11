import React, { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { ASSETS } from '@/config/assets';
import { Product } from '@/types';
import { ProductStationAlternativesModal } from './ProductStationAlternativesModal';
import {
  Search,
  X,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export interface SmartSearchBarProps {
  mode?: 'floating' | 'embedded';
  className?: string;
}

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  mode = 'floating',
  className = '',
}) => {
  const { products } = useAppStore(s => ({
    products: s.products,
  }));

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  // Accessible visual category tiles for non-readers / visual searching (bouteille de gaz, carburant, épicerie...)
  const visualCategories = [
    {
      id: 'gaz',
      label: 'Gaz Butane',
      image: ASSETS.products.gazButane,
      filterId: 'gaz-butane-6kg',
      color: 'bg-blue-50 border-blue-200 text-blue-900',
    },
    {
      id: 'super',
      label: 'Carburant Super',
      image: ASSETS.products.super,
      filterId: 'carburant-super',
      color: 'bg-amber-50 border-amber-200 text-amber-900',
    },
    {
      id: 'gazoil',
      label: 'Gasoil Diesel',
      image: ASSETS.products.gazoil,
      filterId: 'carburant-gazoil',
      color: 'bg-amber-50 border-amber-200 text-amber-900',
    },
    {
      id: 'eau',
      label: 'Eau 50 cl / Pack',
      image: ASSETS.products.eau50cl,
      filterId: 'pos-eau-50cl',
      color: 'bg-cyan-50 border-cyan-200 text-cyan-900',
    },
    {
      id: 'chips',
      label: 'Snacks & Chips',
      image: ASSETS.products.chips,
      filterId: 'pos-chips',
      color: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    },
    {
      id: 'huile',
      label: 'Huile Moteur',
      image: ASSETS.products.huileMoteur,
      filterId: 'huile-moteur-5w40',
      color: 'bg-slate-100 border-slate-200 text-slate-900',
    },
    {
      id: 'boissons',
      label: 'Boissons fraîches',
      image: ASSETS.products.cocaCola,
      filterId: 'pos-coca-cola',
      color: 'bg-red-50 border-red-200 text-red-900',
    },
    {
      id: 'cafe',
      label: 'Café & Boissons chaudes',
      image: ASSETS.products.cafe,
      filterId: 'pos-cafe',
      color: 'bg-orange-50 border-orange-200 text-orange-900',
    },
  ];

  // Filter products based on search query
  const filteredProducts = query.trim()
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleVisualClick = (productId: string) => {
    const prod = products.find(p => p.id === productId) || products[0];
    setSelectedProductForModal(prod);
    setIsOpen(false);
  };

  return (
    <>
      {/* Search Bar Trigger Button */}
      {mode === 'floating' ? (
        <div className={`fixed bottom-[74px] left-0 right-0 z-30 px-4 max-w-md md:max-w-xl lg:max-w-2xl mx-auto ${className}`}>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-full h-12 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-[#1668E3] shadow-lg shadow-blue-500/15 px-4 flex items-center justify-between text-left group hover:bg-white transition-all active:scale-[0.99]"
            aria-label="Recherche intelligente et visuelle"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1668E3] flex items-center justify-center">
                <Search className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 group-hover:text-slate-900">
                Rechercher un produit, du gaz, ou cliquer une icône...
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#EEF4FD] text-[#1668E3] px-2.5 py-1 rounded-xl text-[10px] font-bold">
              <Sparkles className="w-3 h-3" />
              <span>Visuelle</span>
            </div>
          </button>
        </div>
      ) : (
        <div className={`w-full ${className}`}>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-full h-11 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 px-3.5 flex items-center justify-between text-left transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">
                Rechercher par texte ou cliquer sur une icône visuelle...
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#1668E3] bg-blue-50 px-2 py-0.5 rounded-md">
              Recherche rapide
            </span>
          </button>
        </div>
      )}

      {/* Full Accessible Visual Search Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[88vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Header */}
            <div className="p-4 bg-gradient-to-r from-[#0B3A82] to-[#041638] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-[#F7B928]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Recherche Intelligente & Visuelle</h3>
                  <p className="text-[10px] text-blue-200">Cliquez sur une image ou tapez un mot</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input field */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Tapez le nom d'un produit (Gaz, Super, Eau, Chips...)"
                  className="w-full pl-10 pr-9 py-2.5 bg-white rounded-xl text-sm border border-slate-300 focus:ring-2 focus:ring-[#1668E3] focus:border-[#1668E3] focus:outline-none font-medium text-slate-900"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Content area: Visual icon tiles + Text search results */}
            <div className="p-4 overflow-y-auto space-y-5 flex-1">
              {/* Section 1: Non-text Visual Search Icons (Accessible pour personnes illettrées) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Recherche par image (Sans lecture de texte)
                  </span>
                  <span className="text-[10px] text-slate-400">1 clic = stations trouvées</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {visualCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleVisualClick(cat.filterId)}
                      className={`p-3 rounded-2xl border flex flex-col items-center text-center hover:scale-105 active:scale-95 transition-all shadow-xs ${cat.color}`}
                    >
                      <div className="w-12 h-14 flex items-center justify-center mb-1">
                        <img
                          src={cat.image}
                          alt={cat.label}
                          className="max-h-12 max-w-12 object-contain drop-shadow-xs"
                        />
                      </div>
                      <span className="text-[11px] font-bold leading-tight line-clamp-1">
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 2: Text search results if query is typed */}
              {query.trim() && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      Résultats correspondants ({filteredProducts.length})
                    </span>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      Aucun produit ne correspond à votre recherche.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredProducts.map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedProductForModal(p);
                            setIsOpen(false);
                          }}
                          className="p-3 bg-white hover:bg-blue-50/60 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt="" className="w-9 h-9 object-contain" />
                            <div>
                              <h5 className="text-xs font-bold text-slate-900">{p.name}</h5>
                              <p className="text-[10px] text-slate-500">{p.subtitle}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0B3A82]">
                              {new Intl.NumberFormat('fr-FR').format(p.priceFCFA)} FCFA
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alternatives Stations Modal triggered by visual search */}
      <ProductStationAlternativesModal
        product={selectedProductForModal}
        isOpen={Boolean(selectedProductForModal)}
        onClose={() => setSelectedProductForModal(null)}
      />
    </>
  );
};

