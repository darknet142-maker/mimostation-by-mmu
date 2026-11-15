import React, { useState } from 'react';
import { HelpCircle, Phone, Mail, BookOpen, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { Modal } from '@/components/ui/Modal';

export const AdminSupportPage: React.FC = () => {
  const networkConfig = useAppStore(s => s.networkConfig);
  const [showDocModal, setShowDocModal] = useState(false);

  const supportPhone = networkConfig?.supportPhone || '+241 011 88 99 00';
  const supportEmail = networkConfig?.supportEmail || 'support@stationpro.ga';

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-blue-600 mb-1">
          <HelpCircle className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Assistance Technique</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#0A1D37]">
          Support &amp; Maintenance {networkConfig?.platformName || 'StationPro'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Centre d&apos;assistance dédié aux gérants et administrateurs réseau
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Assistance Téléphonique 24/7</h3>
          <p className="text-xs text-slate-500">Pour tout incident urgent sur les pompes ou automates.</p>
          <p className="text-xs font-mono font-bold text-blue-700 pt-2">{supportPhone}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Support par Email</h3>
          <p className="text-xs text-slate-500">Questions de configuration ou demande d&apos;assistance réseau.</p>
          <p className="text-xs font-mono font-bold text-emerald-700 pt-2">{supportEmail}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Guide Administrateur v2.5</h3>
          <p className="text-xs text-slate-500">Documentation complète pour l&apos;habillage et la gestion des stations.</p>
          <button
            type="button"
            onClick={() => setShowDocModal(true)}
            className="inline-block text-xs font-bold text-purple-700 pt-2 hover:underline"
          >
            Consulter la documentation →
          </button>
        </div>
      </div>

      <Modal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
        title="Guide Administrateur StationPro"
        subtitle="Procédures opérationnelles et sécurité réseau"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block">1. Isolation &amp; Sécurité des Postes</strong>
              Chaque collaborateur accède uniquement à sa station et à ses pompes assignées. Les tarifs ne peuvent être modifiés que depuis la console Admin.
            </div>
          </div>
          <div>
            <strong className="text-slate-900 block mb-1">2. Personnalisation 360° par Enseigne</strong>
            Dans <em>Personnalisation</em>, choisissez l&apos;enseigne (TotalEnergies, OLA Energy, PetroGabon, Engen, Gab&apos;Oil), importez un logo ou une couverture SVG nettoyée (&lt; 128 Ko), et réglez le style de disposition client.
          </div>
          <div>
            <strong className="text-slate-900 block mb-1">3. Réservations &amp; Paiement Mobile Money</strong>
            Toute réservation client décrémente le stock immédiatement pendant 30 minutes et le libère automatiquement à expiration ou annulation.
          </div>
          <div>
            <strong className="text-slate-900 block mb-1">4. Journal d&apos;Audit Cryptographique SHA-256</strong>
            Chaque action critique est scellée avec chaînage sur l&apos;empreinte précédente (`previousHash` → `hash`) dans le registre d&apos;audit.
          </div>
        </div>
      </Modal>
    </div>
  );
};
