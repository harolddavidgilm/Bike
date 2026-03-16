import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Plus, Calendar, Loader2, Trash2, Edit3, ExternalLink, Upload, AlertCircle, CheckCircle2, Circle } from 'lucide-react';

const Documents = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editDoc, setEditDoc] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const [newDoc, setNewDoc] = useState({
    vehicle_id: '',
    owner_name: '',
    category: 'SOAT',
    document_name: '',
    issue_date: '',
    expiry_date: '',
    file_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [dRes, vRes] = await Promise.all([
      supabase.from('vehicle_documents').select('*, vehicles(name)').order('expiry_date', { ascending: true }),
      supabase.from('vehicles').select('*')
    ]);

    if (dRes.data) setDocuments(dRes.data);
    if (vRes.data) setVehicles(vRes.data);
    setLoading(false);
  };

  const getStatusInfo = (expiry: string) => {
    const today = new Date();
    const expiryDate = new Date(expiry);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: 'VENCIDO',
        color: '#ef4444',
        shadow: '0 0 12px rgba(239, 68, 68, 0.8)',
        badge: 'text-red-500 border-red-500/30 bg-red-500/5'
      };
    }
    if (diffDays <= 30) {
      return {
        label: 'PRÓXIMO',
        color: '#eab308',
        shadow: '0 0 12px rgba(234, 179, 8, 0.8)',
        badge: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5'
      };
    }
    return {
      label: 'VIGENTE',
      color: '#39ff14', // Neon Green core
      shadow: '0 0 12px rgba(57, 255, 20, 0.8)',
      badge: 'text-[var(--color-neon-green)] border-[var(--color-neon-green)]/30 bg-[var(--color-neon-green)]/5'
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (error) {
      setAlertInfo({
        message: 'Error subiendo documento. Asegura que el bucket "documents" exista en Supabase.',
        type: 'error'
      });
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName);
    setNewDoc({ ...newDoc, file_url: publicUrl });
    setIsUploading(false);
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('vehicle_documents').insert([newDoc]);
    if (error) {
      setAlertInfo({ message: error.message, type: 'error' });
    } else {
      fetchData();
      setIsModalOpen(false);
      setNewDoc({
        vehicle_id: '',
        owner_name: '',
        category: 'SOAT',
        document_name: '',
        issue_date: '',
        expiry_date: '',
        file_url: ''
      });
    }
  };

  const handleIssueDateChange = (date: string, isEdit = false) => {
    if (!date) return;
    const issue = new Date(date);
    const expiry = new Date(issue);
    expiry.setDate(issue.getDate() + 360);
    const expiryStr = expiry.toISOString().split('T')[0];

    if (isEdit && editDoc) {
      setEditDoc({
        ...editDoc,
        issue_date: date,
        expiry_date: expiryStr
      });
    } else {
      setNewDoc({
        ...newDoc,
        issue_date: date,
        expiry_date: expiryStr
      });
    }
  };

  const handleEditSubmit = async () => {
    if (!editDoc) return;
    const { error } = await supabase
      .from('vehicle_documents')
      .update({
        vehicle_id: editDoc.vehicle_id,
        owner_name: editDoc.owner_name,
        category: editDoc.category,
        document_name: editDoc.document_name,
        issue_date: editDoc.issue_date,
        expiry_date: editDoc.expiry_date,
        file_url: editDoc.file_url
      })
      .eq('id', editDoc.id);

    if (error) {
      setAlertInfo({ message: error.message, type: 'error' });
    } else {
      setAlertInfo({ message: 'DOCUMENTO ACTUALIZADO CORRECTAMENTE', type: 'success' });
      setIsEditModalOpen(false);
      setShowEditConfirm(false);
      fetchData();
    }
  };

  const startEdit = (doc: any) => {
    setEditDoc({ ...doc });
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await supabase.from('vehicle_documents').delete().eq('id', deleteConfirmId);
      setDeleteConfirmId(null);
      fetchData();
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-white font-industrial font-bold italic tracking-tighter text-5xl mb-2">GESTIÓN_DOCUMENTAL</h1>
          <p className="text-[var(--color-text-secondary)] text-[10px] font-mono tracking-[0.3em] uppercase opacity-70">
            CONTROL_LEGAL_Y_VIGENCIA • {documents.length} ARCHIVOS_ACTIVOS
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--color-neon-green)] hover:scale-105 active:scale-95 text-black font-bold uppercase text-[10px] py-3 px-8 rounded-full tracking-widest transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.4)]"
        >
          <Plus size={14} /> ADJUNTAR_DOCUMENTO
        </button>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <div className="glass-card overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-[11px] uppercase tracking-[0.2em] font-mono text-[var(--color-text-secondary)]">
                  <th className="px-6 py-5 font-bold w-[15%]">Estado</th>
                  <th className="px-6 py-5 font-bold w-[35%]">Documento / Tipo</th>
                  <th className="px-6 py-5 font-bold w-[20%]">Referencia</th>
                  <th className="px-6 py-5 font-bold w-[18%] text-center">Vencimiento</th>
                  <th className="px-6 py-5 font-bold w-[12%] text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <Loader2 className="animate-spin text-[var(--color-neon-green)] mx-auto mb-4" size={32} />
                      <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">Sincronizando_Bóveda...</span>
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center opacity-40">
                      <FileText className="mx-auto mb-4" size={32} />
                      <p className="text-xs font-mono uppercase tracking-[0.2em]">Bóveda_Documental_Vacía</p>
                    </td>
                  </tr>
                ) : documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors group border-b border-white/5">
                    <td className="px-6 py-6 align-middle">
                      <div className="flex items-center gap-3">
                        <Circle
                          size={10}
                          fill={getStatusInfo(doc.expiry_date).color}
                          className="shrink-0"
                          style={{
                            color: getStatusInfo(doc.expiry_date).color,
                            filter: `drop-shadow(0 0 5px ${getStatusInfo(doc.expiry_date).color})`
                          }}
                        />
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border shrink-0 ${getStatusInfo(doc.expiry_date).badge}`}>
                          {getStatusInfo(doc.expiry_date).label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 align-middle">
                      <div className="flex flex-col justify-center">
                        <span className="text-white font-bold text-sm tracking-tight uppercase leading-none mb-2">{doc.document_name}</span>
                        <span className="text-[var(--color-neon-blue)] text-[14px] font-mono font-bold tracking-widest uppercase">{doc.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 align-middle">
                      <span className="text-white/60 text-[11px] font-mono uppercase tracking-widest truncate block">
                        {doc.vehicle_id ? doc.vehicles?.name : doc.owner_name}
                      </span>
                    </td>
                    <td className="px-6 py-6 align-middle text-center">
                      <div className="flex items-center justify-center gap-2 text-white font-mono text-[11px]">
                        <Calendar size={13} className="text-[var(--color-neon-green)]" />
                        {new Date(doc.expiry_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-6 align-middle">
                      <div className="flex gap-2 justify-center">
                        {doc.file_url && (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded bg-white/5 border border-white/10 text-white/40 hover:text-[var(--color-neon-blue)] transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => startEdit(doc)}
                          className="p-2 rounded bg-white/5 border border-white/10 text-white/40 hover:text-[var(--color-neon-green)] transition-all"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(doc.id)}
                          className="p-2 rounded bg-white/5 border border-white/10 text-white/40 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal - Nuevo Documento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-lg p-8 border border-[var(--color-neon-green)]/30">
            <h2 className="text-3xl font-industrial font-bold italic text-white tracking-tighter mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-[var(--color-neon-green)] inline-block"></span>
              ADJUNTAR_CONTROL_VIGENCIA
            </h2>

            <form onSubmit={handleAddDocument} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Categoría</label>
                  <select
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-green)] focus:outline-none transition-colors font-sans appearance-none"
                    value={newDoc.category}
                    onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                  >
                    <option value="SOAT">SOAT</option>
                    <option value="LICENCIA_CONDUCCION">LICENCIA CONDUCCIÓN</option>
                    <option value="TARJETA_PROPIEDAD">TARJETA PROPIEDAD</option>
                    <option value="TECNOMECANICA">TECNOMECÁNICA</option>
                    <option value="SEGURO_TODO_RIESGO">TODO RIESGO</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Nombre / Identificación</label>
                  <input
                    required
                    type="text"
                    placeholder="Ej: Licencia Alex..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-green)] focus:outline-none font-sans"
                    value={newDoc.document_name}
                    onChange={(e) => setNewDoc({ ...newDoc, document_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Vínculo con Unidad</label>
                  <select
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-green)] focus:outline-none transition-colors font-sans appearance-none"
                    value={newDoc.vehicle_id}
                    onChange={(e) => setNewDoc({ ...newDoc, vehicle_id: e.target.value, owner_name: '' })}
                  >
                    <option value="">- PERTENECER A CONDUCTOR -</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                {!newDoc.vehicle_id && (
                  <div className="space-y-2">
                    <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Nombre de Propietario</label>
                    <input
                      type="text"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-green)] focus:outline-none font-sans"
                      value={newDoc.owner_name}
                      onChange={(e) => setNewDoc({ ...newDoc, owner_name: e.target.value })}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Fecha Expedición</label>
                  <input
                    required
                    type="date"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-green)] focus:outline-none font-mono"
                    value={newDoc.issue_date}
                    onChange={(e) => handleIssueDateChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white/40 text-[10px] uppercase font-mono tracking-widest pl-1">Vencimiento (Auto 360d)</label>
                  <input
                    readOnly
                    type="date"
                    className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-3 text-white/40 focus:outline-none font-mono cursor-not-allowed"
                    value={newDoc.expiry_date}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Documento Digital</label>
                <div className="flex gap-4 items-center">
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full bg-black/40 border border-dashed border-white/20 rounded-lg p-6 flex flex-col items-center justify-center hover:border-[var(--color-neon-green)]/50 transition-colors group">
                      {isUploading ? (
                        <Loader2 className="animate-spin text-[var(--color-neon-green)]" size={24} />
                      ) : (
                        <>
                          <Upload size={24} className="text-white/40 group-hover:text-[var(--color-neon-green)] mb-2" />
                          <span className="text-[10px] text-white/40 font-mono uppercase tracking-[0.2em] group-hover:text-white">Subir Archivo (PDF/IMG)</span>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                </div>
                {newDoc.file_url && (
                  <p className="text-[10px] text-[var(--color-neon-green)] font-mono text-center">✓ DOCUMENTO_LISTO_PARA_ARCHIVAR</p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold tracking-widest hover:bg-white/10 transition-all uppercase"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-3 rounded-xl bg-[var(--color-neon-green)] text-black text-xs font-bold tracking-widest hover:scale-105 transition-all uppercase shadow-[0_0_20px_rgba(57,255,20,0.4)] disabled:opacity-50"
                >
                  ARCHIVAR_DOCUMENTO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal - Editar Documento */}
      {isEditModalOpen && editDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-lg p-8 border border-[var(--color-neon-blue)]/30">
            <h2 className="text-3xl font-industrial font-bold italic text-white tracking-tighter mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-[var(--color-neon-blue)] inline-block"></span>
              EDITAR_EXPEDIENTE_DIGITAL
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Categoría</label>
                  <select
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-blue)] focus:outline-none transition-colors appearance-none font-sans"
                    value={editDoc.category}
                    onChange={(e) => setEditDoc({ ...editDoc, category: e.target.value })}
                  >
                    <option value="SOAT">SOAT</option>
                    <option value="LICENCIA_CONDUCCION">LICENCIA CONDUCCIÓN</option>
                    <option value="TARJETA_PROPIEDAD">TARJETA PROPIEDAD</option>
                    <option value="TECNOMECANICA">TECNOMECÁNICA</option>
                    <option value="SEGURO_TODO_RIESGO">TODO RIESGO</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Nombre / ID</label>
                  <input
                    type="text"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-blue)] focus:outline-none font-sans"
                    value={editDoc.document_name}
                    onChange={(e) => setEditDoc({ ...editDoc, document_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Vínculo</label>
                  <select
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-blue)] focus:outline-none transition-colors appearance-none font-sans"
                    value={editDoc.vehicle_id || ''}
                    onChange={(e) => setEditDoc({ ...editDoc, vehicle_id: e.target.value, owner_name: e.target.value ? '' : editDoc.owner_name })}
                  >
                    <option value="">CONDUCTOR</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                {!editDoc.vehicle_id && (
                  <div className="space-y-2">
                    <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Propietario</label>
                    <input
                      type="text"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-blue)] focus:outline-none font-sans"
                      value={editDoc.owner_name}
                      onChange={(e) => setEditDoc({ ...editDoc, owner_name: e.target.value })}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Expedición</label>
                  <input
                    type="date"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-blue)] focus:outline-none font-mono"
                    value={editDoc.issue_date || ''}
                    onChange={(e) => handleIssueDateChange(e.target.value, true)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white/20 text-[10px] uppercase font-mono tracking-widest pl-1">Vencimiento (Auto)</label>
                  <input
                    readOnly
                    type="date"
                    className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-3 text-white/30 font-mono"
                    value={editDoc.expiry_date || ''}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold tracking-widest hover:bg-white/10 transition-all uppercase"
                >
                  CANCELAR
                </button>
                <button
                  onClick={() => setShowEditConfirm(true)}
                  className="flex-1 py-3 rounded-xl bg-[var(--color-neon-blue)] text-white text-xs font-bold tracking-widest hover:scale-105 transition-all uppercase shadow-[0_0_20px_rgba(0,210,255,0.3)]"
                >
                  GUARDAR_CAMBIOS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Confirmación de Edición */}
      {showEditConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0a0a0c] w-[260px] p-6 border border-white/10 text-center rounded-3xl shadow-2xl relative">
            <div className="w-12 h-12 bg-[var(--color-neon-blue)]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--color-neon-blue)]/20">
              <Edit3 size={20} className="text-[var(--color-neon-blue)]" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1 tracking-tight uppercase">ACTUALIZAR_DATOS</h3>
            <p className="text-white/40 text-[9px] font-mono uppercase tracking-[0.2em] mb-6 leading-tight">
              ¿CONFIRMAR CAMBIOS EN EL EXPEDIENTE?
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleEditSubmit}
                className="w-full py-3 rounded-xl bg-[var(--color-neon-blue)] text-white text-[10px] font-black tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,210,255,0.2)]"
              >
                SÍ, ACTUALIZAR
              </button>
              <button
                onClick={() => setShowEditConfirm(false)}
                className="w-full py-2.5 rounded-xl bg-transparent text-white/30 text-[9px] font-bold tracking-[0.2em] hover:text-white transition-all uppercase"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Confirmación de Eliminación (Minimalist Dark) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0a0a0c] w-[260px] p-6 border border-white/10 text-center rounded-3xl shadow-2xl relative">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Trash2 size={20} className="text-white" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1 tracking-tight uppercase">ELIMINAR_REGISTRO</h3>
            <p className="text-white/40 text-[9px] font-mono uppercase tracking-[0.2em] mb-6 leading-tight">
              ¿CONFIRMAR ELIMINACIÓN DEFINITIVA?
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleDelete}
                className="w-full py-3 rounded-xl bg-[var(--color-neon-green)] text-black text-[10px] font-black tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)]"
              >
                SÍ, ELIMINAR
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="w-full py-2.5 rounded-xl bg-transparent text-white/30 text-[9px] font-bold tracking-[0.2em] hover:text-white transition-all uppercase"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Alert / Info */}
      {alertInfo && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`glass-card w-full max-w-sm p-8 border ${alertInfo.type === 'error' ? 'border-red-500/30' : 'border-[var(--color-neon-green)]/30'} text-center`}>
            {alertInfo.type === 'error' ? (
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} className="text-red-500" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-[var(--color-neon-green)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} className="text-[var(--color-neon-green)]" />
              </div>
            )}
            <h3 className="text-xl font-industrial font-bold italic text-white mb-2 uppercase tracking-tighter">
              {alertInfo.type === 'error' ? 'ERROR_SISTEMA' : 'EXITO_OPERACION'}
            </h3>
            <p className="text-[var(--color-text-secondary)] text-[11px] font-mono mb-8 opacity-70 leading-relaxed uppercase">{alertInfo.message}</p>

            <button
              onClick={() => setAlertInfo(null)}
              className={`w-full py-3 rounded-lg font-bold text-[10px] tracking-[0.2em] transition-all ${alertInfo.type === 'error'
                ? 'bg-red-600 text-white hover:bg-red-500'
                : 'bg-[var(--color-neon-green)] text-black hover:scale-105'
                }`}
            >
              ENTENDIDO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
