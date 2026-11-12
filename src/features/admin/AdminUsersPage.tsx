import React, { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { ROLE_DEFINITIONS } from '@/data/fixtures';
import {
  Users,
  Search,
  KeyRound,
  Building,
  Filter,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { employees, stations } = useAppStore(s => ({
    employees: s.employees || [],
    stations: s.stations || [],
  }));

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [stationFilter, setStationFilter] = useState('all');

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.pin.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
    const matchesStation = stationFilter === 'all' || emp.stationId === stationFilter;
    return matchesSearch && matchesRole && matchesStation;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Users className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Ressources Humaines</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0A1D37]">
            Gestion des Utilisateurs & Équipes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Supervisez tous les employés, rôles, codes PIN et affectations du réseau StationPro
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs">
            {employees.length} employés actifs
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, rôle, PIN..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtres :</span>
          </div>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none"
          >
            <option value="all">Tous les rôles</option>
            {ROLE_DEFINITIONS.map(r => (
              <option key={r.role} value={r.role}>
                {r.title}
              </option>
            ))}
          </select>

          <select
            value={stationFilter}
            onChange={e => setStationFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none"
          >
            <option value="all">Toutes les stations</option>
            {stations.map(st => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Employé</th>
                <th className="py-3 px-4">Rôle & Fonction</th>
                <th className="py-3 px-4">Station Affectée</th>
                <th className="py-3 px-4">Périmètre / Pompes</th>
                <th className="py-3 px-4">Code PIN</th>
                <th className="py-3 px-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map(emp => {
                const station = stations.find(s => s.id === emp.stationId) || stations[0];
                return (
                  <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* User Profile */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-blue-50"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{emp.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">ID: {emp.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold text-[11px]">
                          {emp.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{emp.subtitle}</p>
                    </td>

                    {/* Station */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{station?.name || 'Station Liberté'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{station?.city || 'Libreville'}</p>
                    </td>

                    {/* Scope */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-600">
                        {emp.assignedScope || (emp.assignedPumps ? `Pompe #${emp.assignedPumps.join(', ')}` : 'Global Station')}
                      </span>
                    </td>

                    {/* PIN */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md w-max">
                        <KeyRound className="w-3 h-3 text-amber-500" />
                        <span>{emp.pin}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          emp.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{emp.status === 'active' ? 'En service' : 'Pause'}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
