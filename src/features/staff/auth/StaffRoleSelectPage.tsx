import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE_DEFINITIONS } from '@/data/fixtures';
import { ASSETS } from '@/config/assets';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Shield, ChevronRight } from 'lucide-react';

export const StaffRoleSelectPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A285F] flex flex-col justify-between items-center">
      {/* Responsive centered container */}
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl bg-white min-h-screen flex flex-col shadow-2xl relative">
        {/* Top Header with StationPro Logo */}
        <div className="bg-[#0A285F] pt-6 pb-4 px-4 flex flex-col items-center text-center">
          <BrandLogo theme="dark" mode="staff" size="md" />
        </div>

        {/* 3D Gas Station Hero Banner (Screen 01A) */}
        <div className="relative w-full h-44 bg-gradient-to-b from-blue-300 to-blue-100 overflow-hidden shrink-0">
          <img
            src={ASSETS.scenes.staffHero}
            alt="StationPro"
            className="w-full h-full object-cover"
          />
        </div>

        {/* White Rounded Card Container overlapping hero (Screen 01A) */}
        <div className="px-5 py-5 -mt-6 bg-white rounded-t-3xl relative z-10 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Center Shield Badge & Title */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#1668E3] text-white flex items-center justify-center shadow-md shadow-blue-500/20 mb-2">
                <Shield className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                Espace Personnel
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                Accédez à votre poste avec votre code sécurisé
              </p>
            </div>

            {/* Section: Choisissez votre poste */}
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] mb-2.5">
                Choisissez votre poste
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ROLE_DEFINITIONS.map(roleItem => (
                  <div
                    key={roleItem.role}
                    onClick={() => navigate(`/personnel/connexion/${roleItem.role}`)}
                    className="flex items-center justify-between p-3 bg-white rounded-2xl border border-[#DCE4F0] hover:border-blue-400 hover:shadow-md cursor-pointer transition-all duration-150 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={roleItem.avatar}
                        alt={roleItem.title}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 bg-blue-50 shrink-0"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-[#0F172A] leading-tight">
                          {roleItem.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {roleItem.subtitle}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Admin Console Shortcut Card */}
          <div
            onClick={() => navigate('/admin')}
            className="p-3.5 bg-gradient-to-r from-[#0A1D37] to-[#123668] text-white rounded-2xl border border-blue-500/30 flex items-center justify-between cursor-pointer hover:shadow-lg hover:border-amber-400/50 transition-all duration-150 active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                <Shield className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    Console d'administration Réseau
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Créer, habiller et piloter toutes les stations
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Bottom Info Banner (Screen 01A) */}
          <div className="mt-4 pt-2">
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EEF4FD] rounded-xl text-[#1668E3] text-xs font-semibold">
              <img src={ASSETS.official.uiActions.information} alt="" className="w-4 h-4 object-contain shrink-0" />
              <span>Votre accès est sécurisé et personnel.</span>
            </div>

            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 underline"
              >
                ← Retourner à l'espace Client
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

