import React, { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { ROLE_DEFINITIONS } from '@/data/fixtures';
import { Employee, StaffRole } from '@/types';
import {
  Users,
  Search,
  KeyRound,
  Building,
  Filter,
  Plus,
  CheckCircle2,
  Trash2,
  Edit2,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { employees, stations } = useAppStore(s => ({
    employees: s.employees || [],
    stations: s.stations || [],
  }));

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [stationFilter, setStationFilter] = useState('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Employee Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<StaffRole>('pompiste');
  const [newStationId, setNewStationId] = useState(stations[0]?.id || 'station-liberte');
  const [newPin, setNewPin] = useState('2026');
  const [newScope, setNewScope] = useState('Pompe #1 (Super)');

  // Quick PIN Edit Modal
  const [editingEmpPin, setEditingEmpPin] = useState<Employee | null>(null);
  const [customPinInput, setCustomPinInput] = useState('');

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.pin.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
    const matchesStation = stationFilter === 'all' || emp.stationId === stationFilter;
    return matchesSearch && matchesRole && matchesStation;
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const roleInfo = ROLE_DEFINITIONS.find(r => r.role === newRole) || ROLE_DEFINITIONS[0];

    store.addEmployee({
      name: newName.trim(),
      role: newRole,
      title: roleInfo.title,
      subtitle: roleInfo.subtitle,
      avatar: roleInfo.avatar,
      stationId: newStationId,
      pin: newPin || '1234',
      status: 'active',
      assignedScope: newScope,
    });

    setSuccessToast(`Collaborateur "${newName}" ajouté avec succès avec le code PIN ${newPin} !`);
    setShowAddModal(false);
    setNewName('');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmpPin || !customPinInput) return;

    store.updateEmployee(editingEmpPin.id, { pin: customPinInput });
    setSuccessToast(`Code PIN de ${editingEmpPin.name} mis à jour avec succès : ${customPinInput}`);
    setEditingEmpPin(null);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Révoquer et désactiver le compte de ${name} ?`)) {
      store.deleteEmployee(id, 'Révocation administrative');
      setSuccessToast(`Compte de ${name} supprimé avec succès.`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Users className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Ressources Humaines Réseau (360°)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0A1D37]">
            Gestion des Utilisateurs & Équipes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Supervisez tous les employés, rôles, codes PIN et affectations du réseau StationPro
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B4DB3] hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Ajouter un Collaborateur</span>
        </button>
      </div>

      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs sm:text-sm font-semibold shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

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
                <th className="py-3 px-4">Code PIN Sécurisé</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
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
                        {emp.assignedScope || (emp.assignedPumps ? `Pompe #${emp.assignedPumps.join(', ')}` : 'Global')}
                      </span>
                    </td>

                    {/* PIN */}
                    <td className="py-3 px-4">
                      <div
                        onClick={() => {
                          setEditingEmpPin(emp);
                          setCustomPinInput(emp.pin);
                        }}
                        className="flex items-center gap-1.5 font-mono font-bold text-slate-800 bg-slate-100 hover:bg-amber-100 px-2 py-1 rounded-md w-max cursor-pointer transition-colors"
                        title="Cliquer pour changer le code PIN"
                      >
                        <KeyRound className="w-3 h-3 text-amber-500" />
                        <span>{emp.pin}</span>
                        <Edit2 className="w-3 h-3 text-slate-400 ml-1" />
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => store.toggleEmployeeStatus(emp.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                          emp.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                        title="Cliquer pour basculer En service / En pause"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{emp.status === 'active' ? 'En service' : 'Pause'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(emp.id, emp.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Révoquer l'accès"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD EMPLOYEE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900">Ajouter un Collaborateur</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="ex: Patrick ONDO"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rôle *</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as StaffRole)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-semibold"
                  >
                    {ROLE_DEFINITIONS.map(r => (
                      <option key={r.role} value={r.role}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Station Affectée *</label>
                  <select
                    value={newStationId}
                    onChange={e => setNewStationId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-semibold"
                  >
                    {stations.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Code PIN (4 chiffres) *</label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={newPin}
                    onChange={e => setNewPin(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono font-bold text-center text-sm tracking-widest"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Périmètre assigné</label>
                  <input
                    type="text"
                    value={newScope}
                    onChange={e => setNewScope(e.target.value)}
                    placeholder="ex: Pompe #2 (Gasoil)"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                >
                  Créer le collaborateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PIN MODAL */}
      {editingEmpPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-bold text-slate-900">
                Modifier le Code PIN • {editingEmpPin.name}
              </h2>
              <button onClick={() => setEditingEmpPin(null)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePin} className="space-y-4">
              <p className="text-slate-500">
                Définissez un nouveau code à 4 chiffres pour permettre à l'employé d'accéder à son poste :
              </p>

              <input
                type="text"
                maxLength={4}
                required
                autoFocus
                value={customPinInput}
                onChange={e => setCustomPinInput(e.target.value)}
                className="w-full px-4 py-3 border rounded-2xl bg-slate-50 font-mono text-2xl font-black text-center tracking-widest text-slate-900 focus:bg-white"
              />

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingEmpPin(null)}
                  className="px-4 py-2 rounded-xl border font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                >
                  Enregistrer PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
