import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Gauge, Activity, ShieldCheck, Loader2, Trash2, Edit3, Upload } from 'lucide-react';

const Garage = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [newVehicle, setNewVehicle] = useState({
    name: '',
    registry: '',
    tagline: 'UNIDAD_LISTA_PARA_DESPLIEGUE',
    odometer: 0,
    image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800'
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setVehicles(data);
    setLoading(false);
  };

  const uploadImage = async (file: File) => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `vehicle-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vehicles') // Cambia esto al nombre de tu bucket en Supabase
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('vehicles')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      alert('Error subiendo imagen: Asegúrate de tener un bucket llamado "vehicles" en Supabase con acceso público.');
      console.error(error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'new' | 'edit') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const publicUrl = await uploadImage(file);

    if (publicUrl) {
      if (mode === 'new') {
        setNewVehicle({ ...newVehicle, image_url: publicUrl });
      } else {
        setSelectedVehicle({ ...selectedVehicle, image_url: publicUrl });
      }
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('vehicles')
      .insert([{ ...newVehicle, user_id: user?.id }])
      .select();

    if (error) {
      console.error('Error al registrar vehículo:', error.message);
      alert(`Error: ${error.message}`);
      return;
    }

    if (data && data.length > 0) {
      setVehicles([data[0], ...vehicles]);
      setIsModalOpen(false);
      setNewVehicle({
        name: '',
        registry: '',
        tagline: 'UNIDAD_LISTA_PARA_DESPLIEGUE',
        odometer: 0,
        image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800'
      });
    }
  };

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('vehicles')
      .update({
        name: selectedVehicle.name,
        registry: selectedVehicle.registry,
        odometer: selectedVehicle.odometer,
        tagline: selectedVehicle.tagline,
        image_url: selectedVehicle.image_url
      })
      .eq('id', selectedVehicle.id);

    if (error) {
      alert(`Error al actualizar: ${error.message}`);
      return;
    }

    setVehicles(vehicles.map(v => v.id === selectedVehicle.id ? selectedVehicle : v));
    setIsEditModalOpen(false);
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleToDelete.id);

    if (error) {
      alert(`Error al eliminar: ${error.message}`);
      return;
    }

    setVehicles(vehicles.filter(v => v.id !== vehicleToDelete.id));
    setIsDeleteModalOpen(false);
    setVehicleToDelete(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10">
        <h1 className="text-white font-industrial font-bold italic tracking-tighter text-2xl sm:text-3xl md:text-5xl mb-2 leading-tight uppercase">SERVICIOS TÉCNICOS</h1>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center glass-card border-dashed">
            <Loader2 className="text-[var(--color-neon-blue)] animate-spin mb-4" size={40} />
            <span className="text-white font-mono text-xs tracking-widest uppercase animate-pulse">Consultando_Cifrado_Flota...</span>
          </div>
        ) : vehicles.map((vehicle) => (
          <div key={vehicle.id} className={`${vehicle.id === 1 ? 'premium-border' : 'glass-card overflow-hidden group'} min-w-0 w-full`}>
            <div className={`${vehicle.id === 1 ? 'premium-border-inner' : ''} p-5 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 relative`}>
              {/* Vehicle Image Container */}
              <div className="w-full md:w-48 lg:w-56 h-64 md:h-56 rounded-xl overflow-hidden bg-black/40 border border-white/5 shrink-0 relative">
                <img
                  src={vehicle.image_url || vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                  <span className="text-white font-bold text-[12px] md:text-[10px] tracking-widest uppercase">{vehicle.registry}</span>
                </div>
              </div>

              {/* Details */}
              <div className="flex-[1.5] flex flex-col justify-between min-w-0">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-white font-industrial font-bold italic text-xl md:text-2xl lg:text-3xl leading-tight mb-1 line-clamp-2 md:line-clamp-1">
                      {vehicle.name}
                    </h2>
                    <p className="text-[var(--color-neon-blue)] font-mono text-[10px] tracking-widest uppercase font-bold">{vehicle.tagline}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[8px] font-bold tracking-[0.2em] border ${vehicle.health === 'OPTIMAL'
                    ? 'bg-[var(--color-neon-green)]/10 text-[var(--color-neon-green)] border-[var(--color-neon-green)]/30'
                    : 'bg-[var(--color-neon-orange)]/10 text-[var(--color-neon-orange)] border-[var(--color-neon-orange)]/30'
                    }`}>
                    {vehicle.health || 'ÓPTIMO'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-3 md:gap-x-8 mb-6">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <Gauge size={16} className="text-[var(--color-text-secondary)]" />
                    <div>
                      <div className="text-[8px] text-[var(--color-text-secondary)] uppercase font-mono tracking-widest">Odómetro</div>
                      <div className="text-white text-xs font-bold font-mono">{vehicle.odometer.toLocaleString()} KM</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <MapPin size={16} className="text-[var(--color-text-secondary)]" />
                    <div>
                      <div className="text-[8px] text-[var(--color-text-secondary)] uppercase font-mono tracking-widest">Sector</div>
                      <div className="text-white text-xs font-bold font-mono">{vehicle.region || 'CENTRAL'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <Activity size={16} className="text-[var(--color-text-secondary)]" />
                    <div>
                      <div className="text-[8px] text-[var(--color-text-secondary)] uppercase font-mono tracking-widest">Motor</div>
                      <div className="text-white text-[10px] font-bold line-clamp-1">{vehicle.engine?.split(' ')[0] || 'BOXER'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={16} className="text-[var(--color-text-secondary)]" />
                    <div>
                      <div className="text-[8px] text-[var(--color-text-secondary)] uppercase font-mono tracking-widest">Sincro</div>
                      <div className="text-white text-xs font-bold font-mono">{new Date(vehicle.updated_at || vehicle.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Botón Inspeccionar: flex-1 para que crezca igual que el otro */}
                  <button
                    onClick={() => { setSelectedVehicle(vehicle); setIsEditModalOpen(true); }}
                    className="flex-1 py-3 md:py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[10px] font-bold tracking-widest hover:bg-white/10 transition-all uppercase flex items-center justify-center gap-2"
                  >
                    <Edit3 size={12} /> Inspeccionar
                  </button>

                  {/* Botón Desplegar: flex-1 para que en móvil sea igual de ancho */}
                  <button className="flex-1 py-3 md:py-2 rounded-lg bg-[var(--color-neon-green)] text-black text-[10px] font-bold tracking-widest hover:scale-105 transition-all uppercase shadow-[var(--shadow-neon)]">
                    Desplegar
                  </button>

                  {/* Botón Eliminar: Se mantiene icono, pero le damos más tamaño de click en móvil */}
                  <button
                    onClick={() => { setVehicleToDelete(vehicle); setIsDeleteModalOpen(true); }}
                    className="py-3 px-4 md:p-2 rounded-lg bg-[var(--color-neon-orange)]/10 border border-[var(--color-neon-orange)]/30 text-[var(--color-neon-orange)] hover:bg-[var(--color-neon-orange)] hover:text-white transition-all flex items-center justify-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Botón Añadir Unidad */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="glass-card border-dashed border-2 border-white/10 flex flex-col items-center justify-center p-12 hover:border-[var(--color-neon-green)]/30 hover:bg-white/5 transition-all group min-h-[250px]"
        >
          <div className="w-16 h-16 rounded-full border border-white/10 flex justify-center items-center mb-4 group-hover:scale-110 transition-transform">
            <span className="text-3xl text-white group-hover:text-[var(--color-neon-green)] transition-all font-light">+</span>
          </div>
          <span className="text-white font-industrial font-bold italic tracking-[0.2em] text-sm uppercase">INICIAR_NUEVO_PROTOCOLO</span>
          <span className="text-[var(--color-text-secondary)] text-[8px] font-mono mt-2 tracking-widest uppercase opacity-60">Agregar vehículo a la flota</span>
        </button>
      </div>

      {/* Modal CRUD - Nuevo Vehículo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-lg p-8 border border-[var(--color-neon-blue)]/30 shadow-[0_0_50px_rgba(0,209,255,0.1)]">
            <h2 className="text-3xl font-industrial font-bold italic text-white tracking-tighter mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-[var(--color-neon-blue)] inline-block"></span>
              NUEVO_REGISTRO_UNIDAD
            </h2>

            <form onSubmit={handleAddVehicle} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Identificación / Modelo</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: YAMAHA MT-07"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-blue)] focus:outline-none transition-colors font-sans"
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Placa / Registro</label>
                  <input
                    required
                    type="text"
                    placeholder="ABC-123"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-blue)] focus:outline-none transition-colors font-sans"
                    value={newVehicle.registry}
                    onChange={(e) => setNewVehicle({ ...newVehicle, registry: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Kilometraje Inicial</label>
                  <input
                    required
                    type="number"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-blue)] focus:outline-none transition-colors font-sans"
                    value={newVehicle.odometer}
                    onChange={(e) => setNewVehicle({ ...newVehicle, odometer: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Foto de la Unidad</label>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-lg bg-black/40 border border-white/10 overflow-hidden flex-shrink-0">
                    <img src={newVehicle.image_url} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full bg-black/40 border border-dashed border-white/20 rounded-lg p-3 flex flex-col items-center justify-center hover:border-[var(--color-neon-blue)]/50 transition-colors group">
                      {isUploading ? (
                        <Loader2 className="animate-spin text-[var(--color-neon-blue)]" size={16} />
                      ) : (
                        <>
                          <Upload size={16} className="text-white/40 group-hover:text-[var(--color-neon-blue)] mb-1" />
                          <span className="text-[8px] text-white/40 font-mono uppercase tracking-widest group-hover:text-white">Subir Foto</span>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'new')} disabled={isUploading} />
                  </label>
                </div>
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
                  className="flex-1 py-3 rounded-xl bg-[var(--color-neon-blue)] text-black text-xs font-bold tracking-widest hover:scale-105 transition-all uppercase shadow-[0_0_20px_rgba(0,209,255,0.4)]"
                >
                  REGISTRAR UNIDAD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal CRUD - Editar Vehículo */}
      {isEditModalOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-lg p-8 border border-[var(--color-neon-blue)]/30 shadow-[0_0_50px_rgba(0,209,255,0.1)]">
            <h2 className="text-3xl font-industrial font-bold italic text-white tracking-tighter mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-[var(--color-neon-blue)] inline-block"></span>
              MODIFICAR_REGISTRO_UNIDAD
            </h2>

            <form onSubmit={handleUpdateVehicle} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Identificación / Modelo</label>
                <input
                  required
                  type="text"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-blue)] focus:outline-none transition-colors font-sans"
                  value={selectedVehicle.name}
                  onChange={(e) => setSelectedVehicle({ ...selectedVehicle, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Placa / Registro</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-blue)] focus:outline-none transition-colors font-sans"
                    value={selectedVehicle.registry}
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, registry: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Odómetro (KM)</label>
                  <input
                    required
                    type="number"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-blue)] focus:outline-none transition-colors font-sans"
                    value={selectedVehicle.odometer}
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, odometer: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Foto de la Unidad</label>
                <div className="flex gap-4 items-center">
                  <div className="w-24 h-24 rounded-lg bg-black/40 border border-white/10 overflow-hidden flex-shrink-0">
                    <img src={selectedVehicle.image_url} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full bg-black/40 border border-dashed border-white/20 rounded-lg p-6 flex flex-col items-center justify-center hover:border-[var(--color-neon-blue)]/50 transition-colors group">
                      {isUploading ? (
                        <Loader2 className="animate-spin text-[var(--color-neon-blue)]" size={24} />
                      ) : (
                        <>
                          <Upload size={20} className="text-white/40 group-hover:text-[var(--color-neon-blue)] mb-2" />
                          <span className="text-xs text-white/40 font-mono uppercase tracking-widest group-hover:text-white text-center">Reemplazar Imagen del Dispositivo</span>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'edit')} disabled={isUploading} />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">O pegar URL directa</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-blue)] focus:outline-none transition-colors font-sans text-[10px]"
                  value={selectedVehicle.image_url}
                  onChange={(e) => setSelectedVehicle({ ...selectedVehicle, image_url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Tagline / Estado Personalizado</label>
                <input
                  type="text"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-blue)] focus:outline-none transition-colors font-sans"
                  value={selectedVehicle.tagline}
                  onChange={(e) => setSelectedVehicle({ ...selectedVehicle, tagline: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold tracking-widest hover:bg-white/10 transition-all uppercase"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[var(--color-neon-blue)] text-black text-xs font-bold tracking-widest hover:scale-105 transition-all uppercase shadow-[0_0_20px_rgba(0,209,255,0.4)]"
                >
                  GUARDAR CAMBIOS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Confirmación de Eliminación */}
      {isDeleteModalOpen && vehicleToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className="glass-card w-full max-w-md p-8 border border-[var(--color-neon-orange)]/40 text-center relative overflow-hidden">
            {/* Background Hazard Pattern */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,var(--color-neon-orange)_10px,var(--color-neon-orange)_20px)] opacity-30"></div>

            <div className="w-20 h-20 bg-[var(--color-neon-orange)]/10 rounded-full flex justify-center items-center mx-auto mb-6 border border-[var(--color-neon-orange)]/30">
              <Trash2 className="text-[var(--color-neon-orange)]" size={40} />
            </div>

            <h2 className="text-2xl font-industrial font-bold italic text-white mb-2 uppercase tracking-tighter">¿CONFIRMAR ELIMINACIÓN?</h2>
            <p className="text-[var(--color-text-secondary)] text-xs font-mono mb-8 uppercase tracking-widest leading-relaxed">
              ESTÁS A PUNTO DE ELIMINAR LA UNIDAD <span className="text-white font-bold">{vehicleToDelete.name}</span>.<br />
              ESTA ACCIÓN ES IRREVERSIBLE Y BORRARÁ TODA LA TELEMETRÍA ASOCIADA.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold tracking-widest hover:bg-white/10 transition-all uppercase"
              >
                ABORTAR
              </button>
              <button
                onClick={handleDeleteVehicle}
                className="flex-1 py-3 rounded-xl bg-[var(--color-neon-orange)] text-white text-xs font-bold tracking-widest hover:scale-105 transition-all uppercase shadow-[0_0_25px_rgba(255,90,0,0.4)]"
              >
                CONFIRMAR_BORRADO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Garage;
