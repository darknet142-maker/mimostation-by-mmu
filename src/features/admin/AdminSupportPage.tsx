import React from 'react';
import { HelpCircle, Phone, Mail, BookOpen } from 'lucide-react';

export const AdminSupportPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-blue-600 mb-1">
          <HelpCircle className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Assistance Technique</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#0A1D37]">
          Support & Maintenance StationPro
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Centre d'assistance dédié aux gérants et administrateurs réseau
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Assistance Téléphonique 24/7</h3>
          <p className="text-xs text-slate-500">Pour tout incident urgent sur les pompes ou automates.</p>
          <p className="text-xs font-mono font-bold text-blue-700 pt-2">+241 011 88 99 00</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Support par Email</h3>
          <p className="text-xs text-slate-500">Questions de configuration ou demande de nouvelles fonctionnalités.</p>
          <p className="text-xs font-mono font-bold text-emerald-700 pt-2">support@stationpro.ga</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Guide Administrateur v2.0</h3>
          <p className="text-xs text-slate-500">Documentation complète pour l'habillage et la gestion des stations.</p>
          <a href="#" className="inline-block text-xs font-bold text-purple-700 pt-2 hover:underline">
            Consulter la documentation →
          </a>
        </div>
      </div>
    </div>
  );
};
