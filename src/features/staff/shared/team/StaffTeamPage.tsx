import React, { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ASSETS } from '@/config/assets';
import { Employee, StaffRole } from '@/types';
import {
  Plus,
  Pencil,
  Trash2,
  Lock,
  MapPin,
  ChevronDown,
} from 'lucide-react';

export const StaffTeamPage: React.FC = () => {
  const { employees, stations, selectedStationId, currentEmployee } = useAppStore(s => ({
    employees: s.employees,
    stations: s.stations,
    selectedStationId: s.selectedStationId,
    currentEmployee: s.currentEmployee,
  }));

  const isGerant = currentEmployee?.role === 'gerant';
  const activeStation = stations.find(s => s.id === selectedStationId) || stations[0];
  const authorName = currentEmployee?.name || 'Direction Station';

  // Station filter state
  const [stationFilter, setStationFilter] = useState<string>(selectedStationId);
  const [stationDropdownOpen, setStationDropdownOpen] = useState(false);

  // Employees filtered by station
  const stationEmployees = stationFilter === 'all'
    ? employees
    : employees.filter(e => e.stationId === stationFilter);

  const activeCount = stationEmployees.filter(e => e.status === 'active').length;

  // --- MODAL STATES ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [deletingEmpId, setDeletingEmpId] = useState<string | null>(null);

  // New employee form
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState<StaffRole>('pompiste');
  const [newEmpTitle, setNewEmpTitle] = useState('Pompiste de piste');
  const [newEmpPin, setNewEmpPin] = useState('1927');
  const [newEmpStationId, setNewEmpStationId] = useState(selectedStationId);
  const [newEmpAssignedPumps, setNewEmpAssignedPumps] = useState<number[]>([1]);
  const [newEmpAssignedScope, setNewEmpAssignedScope] = useState('Pompe #1 (Piste)');

  // Edit employee form
  const [editEmpTitle, setEditEmpTitle] = useState('');
  const [editEmpPin, setEditEmpPin] = useState('');
  const [editEmpStatus, setEditEmpStatus] = useState<Employee['status']>('active');
  const [editEmpStationId, setEditEmpStationId] = useState('');
  const [editEmpReason, setEditEmpReason] = useState('');
  const [editEmpAssignedPumps, setEditEmpAssignedPumps] = useState<number[]>([]);
  const [editEmpAssignedScope, setEditEmpAssignedScope] = useState('');

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    let avatar: string = ASSETS.avatars.pompiste;
    if (newEmpRole === 'chef-de-piste') avatar = ASSETS.avatars.chefDePiste;
    else if (newEmpRole === 'caissiere') avatar = ASSETS.avatars.caissiere;
    else if (newEmpRole === 'chef-de-poste') avatar = ASSETS.avatars.chefDePoste;
    else if (newEmpRole === 'rayonniste') avatar = ASSETS.avatars.rayonniste;
    else if (newEmpRole === 'agent-comptoir') avatar = ASSETS.avatars.agentComptoir;
    else if (newEmpRole === 'gerant') avatar = ASSETS.avatars.gerant;

    store.addEmployee(
      {
        name: newEmpName.trim(),
        role: newEmpRole,
        title: newEmpTitle || 'Agent de service',
        subtitle: `Affecté à ${activeStation.name}`,
        avatar,
        status: 'active',
        stationId: newEmpStationId || selectedStationId,
        pin: newEmpPin || '1927',
        assignedPumps: newEmpRole === 'pompiste' ? newEmpAssignedPumps : undefined,
        assignedScope: newEmpAssignedScope.trim() || undefined,
      },
      authorName
    );

    setNewEmpName('');
    setNewEmpAssignedPumps([1]);
    setNewEmpAssignedScope('Pompe #1 (Piste)');
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setEditEmpTitle(emp.title);
    setEditEmpPin(emp.pin);
    setEditEmpStatus(emp.status);
    setEditEmpStationId(emp.stationId);
    setEditEmpAssignedPumps(emp.assignedPumps || []);
    setEditEmpAssignedScope(emp.assignedScope || '');
    setEditEmpReason('Ajustement des habilitations et affectations');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;

    store.updateEmployee(
      editingEmp.id,
      {
        title: editEmpTitle,
        pin: editEmpPin,
        status: editEmpStatus,
        stationId: editEmpStationId,
        assignedPumps: editEmpAssignedPumps,
        assignedScope: editEmpAssignedScope.trim() || undefined,
      },
      authorName,
      editEmpReason.trim() || 'Modification fiche collaborateur'
    );

    setEditingEmp(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingEmpId) return;
    store.deleteEmployee(
      deletingEmpId,
      authorName,
      'Révocation d’accès et départ validé par la direction'
    );
    setDeletingEmpId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Station Selector & Add Employee */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#DBE5F1] shadow-xs">
        <div className="relative">
          <div className="text-xs text-slate-400 font-medium mb-1">Filtrer par station</div>
          <button
            type="button"
            onClick={() => setStationDropdownOpen(!stationDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-left hover:bg-blue-100/60 transition-colors"
          >
            <MapPin className="w-4 h-4 text-[#1668E3]" />
            <span className="text-sm font-extrabold text-[#0B3A82]">
              {stationFilter === 'all'
                ? 'Toutes les stations'
                : stations.find(s => s.id === stationFilter)?.name || activeStation.name}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {stationDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-30 p-2 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setStationFilter('all');
                  setStationDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                  stationFilter === 'all' ? 'bg-[#1668E3] text-white' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                🌐 Toutes les stations ({employees.length} agents)
              </button>
              <div className="border-t border-slate-100 my-1" />
              {stations.map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setStationFilter(st.id);
                    store.setSelectedStation(st.id);
                    setStationDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between ${
                    st.id === stationFilter ? 'bg-[#1668E3] text-white font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{st.name}</span>
                  <span className="text-[10px] opacity-80">
                    {employees.filter(e => e.stationId === st.id).length} agents
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isGerant ? (
            <Button
              variant="yellow"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Recruter un agent
            </Button>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Organigramme en consultation (Gestion RH réservée au Gérant)</span>
            </div>
          )}
        </div>
      </div>

      {/* Team Roster Grid */}
      <SectionCard
        title={`Équipe en service (${activeCount} actif(s) sur ${stationEmployees.length})`}
        icon={<img src={ASSETS.official.services.restauration} alt="" className="w-5 h-5 object-contain" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stationEmployees.map(emp => {
            const empStation = stations.find(s => s.id === emp.stationId);
            return (
              <div
                key={emp.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-3 shadow-2xs hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar || ASSETS.avatars.pompiste}
                      alt={emp.name}
                      className="w-12 h-12 rounded-full border-2 border-slate-200 object-cover bg-blue-500"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{emp.name}</h4>
                      <p className="text-xs text-[#0B3A82] font-semibold">{emp.title}</p>
                      <p className="text-[10px] text-slate-400">
                        {empStation?.name || 'Station Liberté'}
                      </p>
                    </div>
                  </div>

                  <StatusPill
                    type={emp.status === 'active' ? 'active' : 'maintenance'}
                    label={emp.status === 'active' ? 'En service' : 'En pause'}
                    size="sm"
                  />
                </div>

                {/* Scope of Responsibility */}
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs">
                  <span className="text-[10px] font-bold text-blue-500 uppercase block">Périmètre sous gestion</span>
                  <span className="font-extrabold text-[#0B3A82]">{emp.assignedScope || (emp.assignedPumps ? `Pompe #${emp.assignedPumps.join(', #')}` : 'Service de station')}</span>
                </div>

                {/* PIN Code & Status Bar (Gérant Only) */}
                {isGerant && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>PIN Connexion :</span>
                    </div>
                    <span className="font-mono font-bold text-[#0B3A82] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {emp.pin || '••••'}
                    </span>
                  </div>
                )}

                {/* Actions (Gérant Only) */}
                {isGerant && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => store.toggleEmployeeStatus(emp.id)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
                        emp.status === 'active'
                          ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {emp.status === 'active' ? 'Pause' : 'Activer'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(emp)}
                        className="p-1.5 rounded-lg bg-blue-50 text-[#1668E3] hover:bg-blue-100 transition-colors"
                        title="Modifier les informations"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingEmpId(emp.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        title="Révoquer / Désactiver l'agent"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ================= MODAL: AJOUTER UN EMPLOYÉ ================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Recruter un agent dans l'équipe"
        subtitle="Création de profil agent avec traçabilité d'audit"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nom et prénom de l'agent</label>
            <input
              type="text"
              required
              value={newEmpName}
              onChange={e => setNewEmpName(e.target.value)}
              placeholder="Ex: Christian NGUEMA, Patricia ONDO..."
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#1668E3] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rôle Système</label>
              <select
                value={newEmpRole}
                onChange={e => {
                  const r = e.target.value as StaffRole;
                  setNewEmpRole(r);
                  if (r === 'pompiste') setNewEmpTitle('Pompiste de piste');
                  else if (r === 'chef-de-piste') setNewEmpTitle('Chef de Piste');
                  else if (r === 'caissiere') setNewEmpTitle('Caissière de Boutique');
                  else if (r === 'chef-de-poste') setNewEmpTitle('Chef de Poste');
                  else if (r === 'rayonniste') setNewEmpTitle('Rayonniste');
                  else if (r === 'agent-comptoir') setNewEmpTitle('Agent de Comptoir Café');
                }}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
              >
                <option value="pompiste">Pompiste</option>
                <option value="chef-de-piste">Chef de Piste</option>
                <option value="caissiere">Caissière de Boutique</option>
                <option value="chef-de-poste">Chef de Poste</option>
                <option value="rayonniste">Rayonniste</option>
                <option value="agent-comptoir">Agent de Comptoir</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Code PIN (4 chiffres)</label>
              <input
                type="text"
                maxLength={4}
                required
                value={newEmpPin}
                onChange={e => setNewEmpPin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm font-mono text-center tracking-widest font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Intitulé du poste</label>
              <input
                type="text"
                required
                value={newEmpTitle}
                onChange={e => setNewEmpTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Station d'affectation</label>
              <select
                value={newEmpStationId}
                onChange={e => setNewEmpStationId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
              >
                {stations.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Périmètre / Zone de responsabilité</label>
            <input
              type="text"
              value={newEmpAssignedScope}
              onChange={e => setNewEmpAssignedScope(e.target.value)}
              placeholder="Ex: Pompe #1 (Piste), Caisse Boutique, Piste centrale..."
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          {newEmpRole === 'pompiste' && (
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 space-y-2">
              <label className="block text-xs font-bold text-[#0B3A82]">
                Pompe(s) assignée(s) en gestion active exclusive :
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map(pNum => (
                  <label
                    key={pNum}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                      newEmpAssignedPumps.includes(pNum)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={newEmpAssignedPumps.includes(pNum)}
                      onChange={e => {
                        if (e.target.checked) {
                          setNewEmpAssignedPumps([...newEmpAssignedPumps, pNum]);
                        } else {
                          setNewEmpAssignedPumps(newEmpAssignedPumps.filter(p => p !== pNum));
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span>Pompe #{pNum}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="md" onClick={() => setIsAddModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="yellow" size="md" type="submit">
              Enregistrer l'agent
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: MODIFIER EMPLOYÉ ================= */}
      <Modal
        isOpen={Boolean(editingEmp)}
        onClose={() => setEditingEmp(null)}
        title={`Modifier la fiche de ${editingEmp?.name}`}
        subtitle="Mise à jour des habilitations et affectation"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Intitulé du poste</label>
            <input
              type="text"
              required
              value={editEmpTitle}
              onChange={e => setEditEmpTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Code PIN</label>
              <input
                type="text"
                maxLength={4}
                required
                value={editEmpPin}
                onChange={e => setEditEmpPin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm font-mono text-center font-bold tracking-widest"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Statut</label>
              <select
                value={editEmpStatus}
                onChange={e => setEditEmpStatus(e.target.value as Employee['status'])}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
              >
                <option value="active">En service</option>
                <option value="break">En pause</option>
                <option value="offline">Hors service</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Station d'affectation</label>
            <select
              value={editEmpStationId}
              onChange={e => setEditEmpStationId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
            >
              {stations.map(st => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Périmètre / Zone de responsabilité</label>
            <input
              type="text"
              value={editEmpAssignedScope}
              onChange={e => setEditEmpAssignedScope(e.target.value)}
              placeholder="Ex: Pompe #1 (Super), Caisse #1, Piste Sud..."
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          {editingEmp?.role === 'pompiste' && (
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 space-y-2">
              <label className="block text-xs font-bold text-[#0B3A82]">
                Pompe(s) assignée(s) en gestion active exclusive :
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map(pNum => (
                  <label
                    key={pNum}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                      editEmpAssignedPumps.includes(pNum)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={editEmpAssignedPumps.includes(pNum)}
                      onChange={e => {
                        if (e.target.checked) {
                          setEditEmpAssignedPumps([...editEmpAssignedPumps, pNum]);
                        } else {
                          setEditEmpAssignedPumps(editEmpAssignedPumps.filter(p => p !== pNum));
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span>Pompe #{pNum}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Motif de modification <span className="text-red-500">* (Obligatoire pour l'audit)</span>
            </label>
            <input
              type="text"
              required
              value={editEmpReason}
              onChange={e => setEditEmpReason(e.target.value)}
              placeholder="Ex: Changement de poste, réinitialisation PIN..."
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="md" onClick={() => setEditingEmp(null)}>
              Annuler
            </Button>
            <Button variant="navy" size="md" type="submit">
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Delete */}
      <ConfirmDialog
        isOpen={Boolean(deletingEmpId)}
        onClose={() => setDeletingEmpId(null)}
        onConfirm={handleConfirmDelete}
        title="Révoquer cet employé ?"
        message="L'accès au poste sera immédiatement révoqué et cette action sera enregistrée dans le journal d'audit immuable."
        confirmLabel="Révoquer l'accès"
        variant="danger"
      />
    </div>
  );
};
