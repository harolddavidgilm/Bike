import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Wrench, Clock, FileText, ChevronRight, Activity, Plus, CheckCircle2, Loader2, Calendar } from 'lucide-react';

const Maintenance = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const [newLog, setNewLog] = useState({
    vehicle_id: '',
    type: 'REPAIR',
    title: '',
    detail: '',
    value: '',
    odometer_at_entry: 0,
    service_date: new Date().toISOString().split('T')[0]
  });

  const [newTask, setNewTask] = useState({
    vehicle_id: '',
    type: 'PREVENTIVE',
    description: '',
    eta: '',
    severity: 'NORMAL',
    wear_coefficient: 0,
    scheduled_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [vRes, tRes, lRes] = await Promise.all([
      supabase.from('vehicles').select('*').eq('user_id', user?.id),
      supabase.from('scheduled_tasks').select('*, vehicles(name)').eq('user_id', user?.id),
      supabase.from('vehicle_logs').select('*, vehicles(name)').eq('user_id', user?.id).order('created_at', { ascending: false })
    ]);

    if (vRes.data) setVehicles(vRes.data);
    if (tRes.data) setTasks(tRes.data);
    if (lRes.data) setLogs(lRes.data);
    setLoading(false);
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Insertar el Log
    const { error: logError } = await supabase.from('vehicle_logs').insert([{
      vehicle_id: newLog.vehicle_id,
      type: newLog.type,
      title: newLog.title,
      value: newLog.value,
      odometer_at_entry: newLog.odometer_at_entry,
      created_at: newLog.service_date,
      user_id: user?.id
    }]);

    if (logError) {
      alert(`Error en log: ${logError.message}`);
      return;
    }

    // 2. Sincronizar Odómetro en el Vehículo
    const { error: vehError } = await supabase
      .from('vehicles')
      .update({ odometer: newLog.odometer_at_entry })
      .eq('id', newLog.vehicle_id);

    if (vehError) {
      console.error('Error sincronizando odómetro:', vehError.message);
    }

    fetchData();
    setIsLogModalOpen(false);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('scheduled_tasks').insert([{ ...newTask, user_id: user?.id }]);
    if (error) {
      alert(error.message);
    } else {
      fetchData();
      setIsTaskModalOpen(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-white font-industrial font-bold italic tracking-tighter text-5xl mb-2">CENTRO_MANTENIMIENTO</h1>
          <p className="text-[var(--color-text-secondary)] text-[10px] font-mono tracking-[0.3em] uppercase opacity-70">
            PREVENCIÓN_ESTRATÉGICA • {tasks.length} TAREAS_PROGRAMADAS
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsLogModalOpen(true)}
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase text-[10px] py-3 px-6 rounded-full tracking-widest transition-all flex items-center gap-2"
          >
             <Plus size={14} /> REGISTRAR_HISTORIAL
          </button>
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-[var(--color-neon-blue)] hover:scale-105 active:scale-95 text-black font-bold uppercase text-[10px] py-3 px-8 rounded-full tracking-widest transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,209,255,0.4)]"
          >
             <Calendar size={14} /> AGENDAR_REVISIÓN
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Scheduled Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-[var(--color-text-secondary)] text-xs font-mono tracking-[0.3em] uppercase border-l-2 border-[var(--color-neon-blue)] pl-4 mb-6">Cola_de_Ejecución</h2>
          
          {loading ? (
            <div className="glass-card p-20 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-[var(--color-neon-blue)] mb-4" size={32} />
              <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">Sincronizando_Servicios...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="glass-card p-12 text-center border-dashed border-2 border-white/5 opacity-50">
              <CheckCircle2 size={40} className="mx-auto mb-4 text-[var(--color-neon-green)]" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-white">Todas las unidades en estado óptimo</p>
            </div>
          ) : tasks.map((task) => (
            <div key={task.id} className={`glass-card p-8 relative overflow-hidden group ${task.severity === 'CRITICAL' ? 'border-l-4 border-l-[var(--color-neon-orange)]' : 'border-l-4 border-l-[var(--color-neon-blue)]'}`}>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div className="flex gap-6 items-start">
                   <div className={`p-4 rounded-xl border ${task.severity === 'CRITICAL' ? 'bg-[var(--color-neon-orange)]/10 border-[var(--color-neon-orange)]/30' : 'bg-[var(--color-neon-blue)]/10 border-[var(--color-neon-blue)]/30'}`}>
                      <Wrench size={24} className={task.severity === 'CRITICAL' ? 'text-[var(--color-neon-orange)]' : 'text-[var(--color-neon-blue)]'} />
                   </div>
                   <div>
                      <div className="flex items-center gap-3 mb-1">
                        <div className="flex flex-col">
                          <h3 className="text-2xl font-industrial font-bold italic text-white uppercase tracking-tight leading-none mb-1">{task.type}</h3>
                          <span className="text-[var(--color-neon-blue)] text-[9px] font-mono font-bold tracking-widest uppercase mb-1">UNIDAD: {task.vehicles?.name}</span>
                        </div>
                        <span className={`text-[8px] font-bold tracking-widest px-2 py-0.5 rounded uppercase ${task.severity === 'CRITICAL' ? 'bg-[var(--color-neon-orange)] text-black' : 'bg-white/10 text-white'}`}>
                          {task.severity}
                        </span>
                      </div>
                      <p className="text-[var(--color-text-secondary)] text-xs font-mono tracking-wider opacity-60 mb-4">{task.description}</p>
                      
                      <div className="flex gap-6">
                         <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                            <Clock size={14} />
                            <span className="text-[10px] font-bold tracking-widest uppercase">ETA: {task.eta}</span>
                         </div>
                         <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                            <Activity size={14} className="text-[var(--color-neon-green)]" />
                            <span className="text-[10px] font-bold tracking-widest uppercase">SYSCK_ID: {task.id.slice(0, 5)}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col items-end">
                   <div className="mb-4 text-right">
                      <div className="text-[10px] font-bold text-white mb-1 uppercase tracking-widest">Coeficiente Desgaste</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold font-industrial text-white">{task.wear_coefficient || 0}%</span>
                      </div>
                   </div>
                   <button className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[9px] font-bold tracking-widest hover:bg-white/10 transition-all uppercase flex items-center gap-2 border-r-4 border-r-[var(--color-neon-green)]">
                      Completar <ChevronRight size={12} />
                   </button>
                </div>
              </div>

              {/* Progress Background Deco */}
              <div className="absolute right-0 bottom-0 top-0 w-1 bg-white/5">
                 <div 
                   className={`absolute bottom-0 w-full rounded-t ${task.severity === 'CRITICAL' ? 'bg-[var(--color-neon-orange)]' : 'bg-[var(--color-neon-blue)]'}`} 
                   style={{ height: `${task.wear_coefficient}%` }}
                 ></div>
              </div>
            </div>
          ))}

          {/* Historial de Servicios (Logs) */}
          <div className="pt-10">
            <h2 className="text-[var(--color-text-secondary)] text-xs font-mono tracking-[0.3em] uppercase border-l-2 border-[var(--color-neon-green)] pl-4 mb-6">Bitácora_Estratégica</h2>
            
            <div className="space-y-4">
              {logs.length === 0 ? (
                <div className="glass-card p-12 flex flex-col items-center justify-center opacity-40 border-dashed border border-white/10">
                  <FileText size={32} className="mb-4" />
                  <p className="text-xs font-mono tracking-[0.2em] font-bold italic uppercase">HISTORIAL_VACÍO</p>
                </div>
              ) : logs.map((log) => (
                <div key={log.id} className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 border-white/5 hover:bg-white/[0.07] transition-colors">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-[var(--color-neon-green)]/60" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-white font-bold text-sm tracking-tight uppercase leading-none">{log.title}</h4>
                        <span className="text-[8px] bg-white/10 text-[var(--color-text-secondary)] px-1.5 py-0.5 rounded font-mono uppercase">{log.type}</span>
                      </div>
                      <p className="text-[10px] text-[var(--color-text-secondary)] font-mono uppercase tracking-widest mt-1">
                        {log.vehicles?.name} • <span className="text-white/40">{log.odometer_at_entry} KM</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[var(--color-neon-green)] font-mono font-bold text-xs">{log.value}</div>
                    <div className="text-[9px] text-white/30 font-mono mt-0.5">{new Date(log.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Fleet Stats & Recommendations */}
        <div className="space-y-8">
           <div className="glass-card p-8">
              <h3 className="text-white font-industrial font-bold italic tracking-widest text-lg mb-6 flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-[var(--color-neon-green)]"></div>
                 CBR_PREDICTIVO
              </h3>
              <div className="space-y-6">
                 <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="text-[9px] font-bold text-[var(--color-neon-blue)] uppercase tracking-widest mb-2 font-mono">Salida del Algoritmo</div>
                    <p className="text-[10px] text-white/80 leading-relaxed font-sans mb-4">
                      Basado en acústica actual del motor y ciclos de lubricación, se recomienda cambio de filtro en <span className="text-[var(--color-neon-green)] font-bold">1,200km</span>.
                    </p>
                    <div className="flex justify-between items-center text-[10px] font-mono text-[var(--color-text-secondary)]">
                       <span>PUNTAJE_CONFIANZA</span>
                       <span className="text-[var(--color-neon-green)]">92.4%</span>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                       <span className="text-[var(--color-text-secondary)]">AIR_INTAKE_QUALITY</span>
                       <span className="text-white">OPTIMAL</span>
                    </div>
                    <div className="h-1 bg-white/5 w-full rounded-full">
                       <div className="h-full bg-[var(--color-neon-green)] w-[95%] rounded-full shadow-[0_0_8px_var(--color-neon-green)]"></div>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                       <span className="text-[var(--color-text-secondary)]">LUBRICATION_VISC</span>
                       <span className="text-white">STABLE</span>
                    </div>
                    <div className="h-1 bg-white/5 w-full rounded-full">
                       <div className="h-full bg-[var(--color-neon-blue)] w-[70%] rounded-full shadow-[0_0_8px_var(--color-neon-blue)]"></div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="premium-border">
              <div className="premium-border-inner p-8">
                 <h4 className="text-white font-industrial font-bold italic tracking-widest text-sm mb-4 uppercase">AVISO_DE_ANULACIÓN</h4>
                 <p className="text-[10px] text-[var(--color-text-secondary)] font-mono leading-relaxed mb-6">
                    LA ANULACIÓN MANUAL RECALIBRARÁ LOS MODELOS PREDICTIVOS. PROCEDA CON PRECAUCIÓN.
                 </p>
                 <button className="w-full py-3 bg-white/5 border border-white/10 text-white text-[10px] font-bold tracking-widest hover:bg-white/10 transition-all uppercase">
                   FORZAR_RECALIBRACIÓN
                 </button>
              </div>
           </div>
        </div>
      </div>
      {/* Modal - Registrar Historial (Log) */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-lg p-8 border border-[var(--color-neon-green)]/30">
            <h2 className="text-3xl font-industrial font-bold italic text-white tracking-tighter mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-[var(--color-neon-green)] inline-block"></span>
              REGISTRAR_SERVICIO_EJECUTADO
            </h2>
            
            <form onSubmit={handleAddLog} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Seleccionar Unidad</label>
                  <select 
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-green)] focus:outline-none transition-colors font-sans appearance-none"
                    value={newLog.vehicle_id}
                    onChange={(e) => setNewLog({...newLog, vehicle_id: e.target.value})}
                  >
                    <option value="">- SELECCIONAR -</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.registry})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Tipo de Servicio</label>
                  <select 
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-green)] focus:outline-none transition-colors font-sans appearance-none"
                    value={newLog.type}
                    onChange={(e) => setNewLog({...newLog, type: e.target.value})}
                  >
                    <option value="REFILL">TANQUEO</option>
                    <option value="ANALYSIS">ANÁLISIS TÉCNICO</option>
                    <option value="DETAILING">DETAILING / LIMPIEZA</option>
                    <option value="REPAIR">REPARACIÓN / MTTO</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Título del Registro</label>
                <input 
                  required
                  type="text" 
                  placeholder="Ej: Cambio de Aceite Sintético..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-green)] focus:outline-none transition-colors font-sans"
                  value={newLog.title}
                  onChange={(e) => setNewLog({...newLog, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Fecha del Servicio</label>
                  <input 
                    required
                    type="date" 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-green)] focus:outline-none font-mono text-xs"
                    value={newLog.service_date}
                    onChange={(e) => setNewLog({...newLog, service_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Odómetro Actual (KM)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-green)] focus:outline-none transition-colors font-sans"
                    value={newLog.odometer_at_entry}
                    onChange={(e) => setNewLog({...newLog, odometer_at_entry: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Valor / Resultado</label>
                <input 
                  required
                  type="text" 
                  placeholder="Ej: -$45.00 ó ÓPTIMO"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-green)] focus:outline-none transition-colors font-sans"
                  value={newLog.value}
                  onChange={(e) => setNewLog({...newLog, value: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold tracking-widest hover:bg-white/10 transition-all uppercase"
                >
                  ABORTAR
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[var(--color-neon-green)] text-black text-xs font-bold tracking-widest hover:scale-105 transition-all uppercase shadow-[0_0_20px_rgba(57,255,20,0.4)]"
                >
                  ARCHIVAR_REGISTRO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Agendar Revisión (Task) */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-lg p-8 border border-[var(--color-neon-blue)]/30">
            <h2 className="text-3xl font-industrial font-bold italic text-white tracking-tighter mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-[var(--color-neon-blue)] inline-block"></span>
              AGENDAR_TAREA_PROGRAMADA
            </h2>
            
            <form onSubmit={handleAddTask} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Unidad Objetivo</label>
                  <select 
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-blue)] focus:outline-none transition-colors font-sans appearance-none"
                    value={newTask.vehicle_id}
                    onChange={(e) => setNewTask({...newTask, vehicle_id: e.target.value})}
                  >
                    <option value="">- SELECCIONAR -</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Tipo de Tarea</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ej: REVISIÓN FRENOS"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-blue)] focus:outline-none transition-colors font-sans"
                    value={newTask.type}
                    onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Descripción del Procedimiento</label>
                <textarea 
                  required
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-blue)] focus:outline-none transition-colors font-sans resize-none"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">ETA / Fecha de Ejecución</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ej: En 2 semanas"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-blue)] focus:outline-none transition-colors font-sans"
                    value={newTask.eta}
                    onChange={(e) => setNewTask({...newTask, eta: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[var(--color-text-secondary)] text-[10px] uppercase font-mono tracking-widest pl-1">Severidad del Estado</label>
                  <select 
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-neon-blue)] focus:outline-none transition-colors font-sans appearance-none"
                    value={newTask.severity}
                    onChange={(e) => setNewTask({...newTask, severity: e.target.value})}
                  >
                    <option value="NORMAL">ESTÁNDAR</option>
                    <option value="CRITICAL">CRÍTICO / URGENTE</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold tracking-widest hover:bg-white/10 transition-all uppercase"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[var(--color-neon-blue)] text-black text-xs font-bold tracking-widest hover:scale-105 transition-all uppercase shadow-[0_0_20px_rgba(0,209,255,0.4)]"
                >
                  PROGRAMAR_TAREA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
