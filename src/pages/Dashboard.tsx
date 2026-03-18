import { useState, useEffect } from 'react';
import { AlertTriangle, Fuel, Gauge, Camera, Edit3, MapPin, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import OCRScanner from '../components/OCRScanner';

interface Vehicle {
  id: string;
  name: string;
  tagline: string;
  registry: string;
  odometer: number;
  avg_consumption: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isManualTypeModalOpen, setIsManualTypeModalOpen] = useState(false);
  const [isTripFormOpen, setIsTripFormOpen] = useState(false);
  const [isFuelFormOpen, setIsFuelFormOpen] = useState(false);
  
  const [manualValue, setManualValue] = useState<string>('');
  const [fuelForm, setFuelForm] = useState({
    km: '',
    gallons: '',
    price: '',
    station: ''
  });
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  // Stats
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [efficiency, setEfficiency] = useState<number | null>(null);
  const [recentTransmissions, setRecentTransmissions] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    // 1. Fetch Vehicle
    const { data: vData } = await supabase.from('vehicles').select('*').eq('user_id', user?.id).limit(1).single();
    if (vData) {
      setVehicle(vData);

      // 2. Fetch Fuel Logs
      const { data: fData } = await supabase
        .from('fuel_logs')
        .select('*')
        .eq('vehicle_id', vData.id)
        .order('created_at', { ascending: false });
      
      if (fData) {
        // Calculate Monthly Expense
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);
        
        const monthlySum = fData
          .filter(log => new Date(log.created_at) >= startOfMonth)
          .reduce((sum, log) => sum + Number(log.total_price), 0);
        setMonthlyExpense(monthlySum);

        // Calculate Efficiency (KM per gallon)
        if (fData.length >= 2) {
          const l1 = fData[0];
          const l2 = fData[1];
          const kmDiff = l1.odometer_km - l2.odometer_km;
          const gallons = Number(l1.gallons);
          if (gallons > 0 && kmDiff > 0) {
            setEfficiency(Number((kmDiff / gallons).toFixed(1)));
          }
        }
      }

      // 3. Fetch Trip Logs
      const { data: tData } = await supabase
        .from('trip_logs')
        .select('*')
        .eq('vehicle_id', vData.id)
        .order('created_at', { ascending: false });
      
      if (tData) {
        // Combinamos para Transmisiones Recientes
      }
      const combined = [
        ...(fData || []).map(l => ({ ...l, type: 'FUEL', icon: Fuel, color: '[var(--color-neon-green)]' })),
        ...(tData || []).map(l => ({ ...l, type: 'TRIP', icon: MapPin, color: '[var(--color-neon-blue)]' }))
      ].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, 5);
      
      setRecentTransmissions(combined);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const updateVehicleOdo = async (newValue: number) => {
    if (!vehicle) return;
    const { error } = await supabase.from('vehicles').update({ odometer: newValue }).eq('id', vehicle.id);
    if (!error) setVehicle({ ...vehicle, odometer: newValue });
  };

  const handleTripRegistry = async () => {
    if (!vehicle || !manualValue) return;
    const newKm = parseInt(manualValue, 10);
    if (isNaN(newKm)) return;
    
    // VALIDACIÓN: Permitir KM menor con confirmación
    if (newKm < vehicle.odometer) {
      const confirmHistory = confirm(`⚠️ EL KILOMETRAJE ES MENOR AL ACTUAL (${vehicle.odometer} KM). ¿SÍ ES UN REGISTRO HISTÓRICO?`);
      if (!confirmHistory) return;
    }

    const { error } = await supabase.from('trip_logs').insert([{
      vehicle_id: vehicle.id,
      odometer_km: newKm,
      created_at: new Date(formDate + 'T12:00:00').toISOString(),
      user_id: user?.id
    }]);

    if (!error) {
      if (newKm > vehicle.odometer) await updateVehicleOdo(newKm);
      fetchDashboardData();
      setIsTripFormOpen(false);
      setIsManualTypeModalOpen(false);
    }
  };

  const handleFuelRegistry = async () => {
    if (!vehicle || !fuelForm.km || !fuelForm.gallons || !fuelForm.price) return;
    const newKm = parseInt(fuelForm.km, 10);
    if (isNaN(newKm)) return;

    // VALIDACIÓN: Permitir KM menor con confirmación
    if (newKm < vehicle.odometer) {
      const confirmHistory = confirm(`⚠️ EL KILOMETRAJE ES MENOR AL ACTUAL (${vehicle.odometer} KM). ¿SÍ ES UN REGISTRO HISTÓRICO?`);
      if (!confirmHistory) return;
    }

    const { error } = await supabase.from('fuel_logs').insert([{
      vehicle_id: vehicle.id,
      odometer_km: newKm,
      gallons: Number(fuelForm.gallons),
      total_price: Number(fuelForm.price),
      station_name: fuelForm.station || 'S/N',
      created_at: new Date(formDate + 'T12:00:00').toISOString(),
      user_id: user?.id
    }]);

    if (!error) {
      if (newKm > vehicle.odometer) await updateVehicleOdo(newKm);
      fetchDashboardData();
      setIsFuelFormOpen(false);
      setIsManualTypeModalOpen(false);
    }
  };

  const handleOdorCapture = async (newValue: number) => {
    if (!vehicle) return;
    await updateVehicleOdo(newValue);
    setIsScannerOpen(false);
    setIsSelectionModalOpen(false);
  };

  if (loading) return <div className="p-20 text-[var(--color-neon-blue)] flex flex-col justify-center items-center text-center font-mono animate-pulse tracking-widest uppercase">Sincronizando_con_Sistema...</div>;
  if (!vehicle) return (
    <div className="h-[80vh] flex items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="glass-card max-w-lg w-full p-10 text-center border-dashed border-2 border-white/10">
        <div className="w-20 h-20 bg-white/5 rounded-full flex justify-center items-center mx-auto mb-6">
          <AlertTriangle className="text-[var(--color-text-secondary)]" size={40} />
        </div>
        <h2 className="text-2xl font-industrial font-bold italic tracking-tighter text-white mb-2 uppercase">GARAJE_VACÍO</h2>
        <p className="text-[12px] text-[var(--color-text-secondary)] font-mono tracking-widest uppercase mb-8 leading-relaxed">
          NO SE HA DETECTADO NINGUNA UNIDAD VINCULADA A TU PERFIL DE OPERADOR. REGISTRA UNA PARA DESBLOQUEAR EL PANEL.
        </p>
        <Link 
          to="/garage"
          className="inline-flex items-center justify-center gap-3 bg-[var(--color-neon-green)] text-black font-bold uppercase text-xs py-4 px-8 rounded-xl tracking-[0.2em] hover:scale-105 transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)]"
        >
          <Plus size={16} /> REGISTRAR_PRIMERA_UNIDAD
        </Link>
      </div>
    </div>
  );
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-white font-industrial font-bold italic tracking-tighter text-2xl sm:text-3xl md:text-5xl flex items-center gap-3 leading-tight">
            <span className="w-2 md:w-3 h-6 md:h-10 bg-[var(--color-neon-green)] inline-block"></span>
            ESTADO: <span className="text-[var(--color-neon-green)]">OPERATIVO</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-[10px] font-mono tracking-[0.3em] uppercase mt-2 opacity-70">
            NUCLEO DEL SISTEMA • {vehicle.registry}
          </p>
        </div>
        <div className="flex gap-4">
          <button className="glass hover:bg-white/10 text-white font-bold uppercase text-[10px] py-3 px-6 rounded-full tracking-widest transition-all border border-white/10 flex items-center gap-2">
            DIAGNÓSTICOS
          </button>
          <button
            onClick={() => setIsSelectionModalOpen(true)}
            className="bg-[var(--color-neon-green)] hover:scale-105 active:scale-95 text-black font-bold uppercase text-[10px] py-3 px-8 rounded-full tracking-widest transition-all flex items-center gap-2 shadow-[var(--shadow-neon)]"
          >
            <span className="text-lg leading-none">+</span> NUEVA SALIDA
          </button>
        </div>
      </header>

      {/* Hero section with Premium Border Animation */}
      <section className="premium-border mb-10 h-[400px]">
        <div className="premium-border-inner relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-dark-bg)] via-[var(--color-dark-bg)]/60 to-transparent z-10 p-12 flex flex-col justify-between">
            <div>
              <div className="bg-[var(--color-neon-green)] text-black font-bold text-[9px] tracking-[0.3em] px-3 py-1 rounded-sm w-max mb-6 uppercase">ACTIVE_UNIT // ALPHA_01</div>
              <h2 className="text-7xl font-industrial font-bold italic tracking-tighter text-white leading-none mb-2 group-hover:translate-x-2 transition-transform duration-500">
                {vehicle.name}
              </h2>
              <p className="text-[var(--color-neon-blue)] font-mono text-xs tracking-[0.2em] font-bold">{vehicle.tagline}</p>
            </div>

            <div className="flex gap-12 items-center">
              <div>
                <div className="text-[var(--color-text-secondary)] text-[10px] font-bold tracking-[0.2em] mb-2 font-mono uppercase">Telemetría / Odo</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tighter text-white">{vehicle.odometer.toLocaleString()}</span>
                  <span className="text-[var(--color-neon-green)] text-lg font-industrial font-bold italic">KM</span>
                </div>
              </div>
              <div className="w-[1px] h-12 bg-white/10"></div>
              <div>
                <div className="text-[var(--color-text-secondary)] text-[10px] font-bold tracking-[0.2em] mb-2 font-mono uppercase">Estado_Salud</div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`w-1.5 h-6 rounded-sm ${i < 5 ? 'bg-[var(--color-neon-green)] shadow-[0_0_8px_var(--color-neon-green)]' : 'bg-white/10'}`}></div>
                    ))}
                  </div>
                  <span className="text-white font-bold text-sm tracking-widest uppercase">SYSCK_OK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Motorcycle Image Decoration */}
          <div className="absolute right-0 top-0 bottom-0 w-2/3 z-0">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[var(--color-dark-bg)]/20 to-[var(--color-dark-bg)] z-10"></div>
            <img
              src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=2000"
              alt="Motorcycle"
              className="w-full h-full object-cover object-center opacity-60 group-hover:scale-105 group-hover:rotate-1 transition-all duration-1000 ease-in-out mix-blend-screen"
            />
          </div>
        </div>
      </section>

      {/* Grid of Tactical Insights */}
      <section className="grid grid-cols-3 gap-8 mb-10">

        {/* Alerts / Maintenance Card */}
        <div className="glass-card p-8 group hover:bg-white/5 transition-all cursor-pointer">
          <div className="flex justify-between items-start mb-10">
            <div className="p-3 bg-[var(--color-neon-orange)]/10 border border-[var(--color-neon-orange)]/30 rounded-lg">
              <AlertTriangle className="text-[var(--color-neon-orange)]" size={24} />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[var(--color-neon-orange)] text-[9px] font-bold tracking-[0.3em] uppercase">PRIORITY_HIGH</span>
              <span className="text-[var(--color-text-secondary)] text-[8px] font-mono">CODE: MNT_502</span>
            </div>
          </div>
          <div>
            <div className="text-[var(--color-text-secondary)] text-[10px] uppercase tracking-[0.3em] mb-2 font-mono">Ventana_Servicio</div>
            <h3 className="text-2xl font-industrial font-bold italic tracking-tight text-white mb-4">ANALÍTICA FILTRO_ACEITE</h3>
            <div className="flex items-center justify-between text-[10px] font-bold tracking-widest mb-2">
              <span className="text-[var(--color-text-secondary)]">PROGRESO A CRÍTICO</span>
              <span className="text-white">85%</span>
            </div>
            <div className="h-1.5 bg-white/5 w-full rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[var(--color-neon-orange)] to-[#ff2a00] w-[85%] rounded-full shadow-[0_0_10px_rgba(255,90,0,0.5)]"></div>
            </div>
          </div>
        </div>

        {/* Fuel / Economy Card */}
        <div className="glass-card p-8 group hover:bg-white/5 transition-all cursor-pointer">
          <div className="flex justify-between items-start mb-10">
            <div className="p-3 bg-[var(--color-neon-green)]/10 border border-[var(--color-neon-green)]/30 rounded-lg">
              <Fuel className="text-[var(--color-neon-green)]" size={24} />
            </div>
            <div className="text-[var(--color-text-secondary)] text-[9px] font-bold tracking-[0.3em] uppercase font-mono">ECO_METRICS</div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[var(--color-text-secondary)] text-[10px] uppercase tracking-[0.3em] mb-2 font-mono">Consumo_Mensual</div>
              <h3 className="text-5xl font-bold tracking-tighter text-white font-sans">
                ${monthlyExpense.toFixed(2).split('.')[0]}
                <span className="text-xl text-[var(--color-text-secondary)]">.{monthlyExpense.toFixed(2).split('.')[1]}</span>
              </h3>
            </div>
            <div className="flex gap-1.5 items-end h-[40px]">
              {[0.4, 0.6, 0.3, 0.8, 0.5, 1].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h * 100}%` }}
                  className={`w-2 rounded-sm transition-all duration-500 ${i === 5 ? 'bg-[var(--color-neon-green)] shadow-[var(--shadow-neon)]' : 'bg-white/10 group-hover:bg-white/20'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* System Efficiency Card */}
        <div className="glass-card p-8 group hover:bg-white/5 transition-all cursor-pointer">
          <div className="flex justify-between items-start mb-10">
            <div className="p-3 bg-[var(--color-neon-blue)]/10 border border-[var(--color-neon-blue)]/30 rounded-lg">
              <Gauge className="text-[var(--color-neon-blue)]" size={24} />
            </div>
            <div className="text-[var(--color-neon-blue)] text-[9px] font-bold tracking-[0.3em] uppercase font-mono">ÍNDICE_RENDIMIENTO</div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-4">
              <h3 className="text-5xl font-bold tracking-tighter text-white">{efficiency || '—'}</h3>
              <span className="text-[var(--color-neon-blue)] text-xs font-industrial font-bold italic tracking-widest uppercase">KM/GAL</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-neon-green)] text-[9px] uppercase font-bold tracking-[0.2em] bg-[var(--color-neon-green)]/10 px-3 py-1.5 rounded-full w-max">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-neon-green)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-neon-green)]"></span>
              </span>
              OP_SISTEMA_IA
            </div>
          </div>
        </div>
      </section>

      {/* Modern Detailed Log Table */}
      <section className="glass-card overflow-hidden">
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h3 className="font-industrial font-bold italic tracking-[0.3em] text-[var(--color-text-secondary)] text-xs uppercase">REGISTRO_HISTÓRICO</h3>
          <div className="flex gap-4">
            <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[8px] font-mono text-[var(--color-text-secondary)]">ESTADO_LOG: SEGURO</div>
            <button className="text-[var(--color-neon-green)] font-bold text-[9px] tracking-[0.3em] hover:text-white transition-colors uppercase font-mono">DESCIFRAR_HISTORIAL_COMPLETO</button>
          </div>
        </div>

        <div className="w-full">
          {recentTransmissions.map((row, i) => (
            <div key={i} className="px-8 py-6 flex items-center justify-between hover:bg-white/[0.03] transition-all group border-b border-white/5 last:border-0 cursor-pointer">
              <div className="flex items-center gap-8">
                <div
                  className="w-12 h-12 rounded-xl border flex justify-center items-center transition-all duration-300"
                  style={{ borderColor: `rgba(255,255,255,0.05)`, backgroundColor: 'rgba(0,0,0,0.2)' }}
                >
                  <row.icon size={20} className="group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="font-industrial font-bold italic tracking-widest text-white uppercase text-sm mb-1 group-hover:text-[var(--color-neon-green)] transition-colors">
                    {row.type === 'FUEL' ? row.station_name : 'REGISTRO_SALIDA'}
                  </h4>
                  <div className="text-[var(--color-text-secondary)] text-[10px] uppercase tracking-[0.2em] font-mono opacity-60">
                    {row.type === 'FUEL' ? `${row.gallons} GAL • ${row.odometer_km} KM` : `RUTA_VIAJE • ${row.odometer_km} KM`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold text-sm mb-1 tracking-tight ${row.type === 'FUEL' ? 'text-[var(--color-neon-green)]' : 'text-white'}`}>
                  {row.type === 'FUEL' ? `$${row.total_price}` : 'OK'}
                </div>
                <div className="text-[var(--color-text-secondary)] text-[9px] uppercase tracking-[0.2em] font-mono">
                  {new Date(row.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Manual Selection Modal */}
      {isManualTypeModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="glass-card w-full max-w-md p-8 premium-border">
            <div className="premium-border-inner p-8 text-center">
              <div className="flex justify-between items-start mb-10 text-left">
                <div>
                  <h2 className="text-3xl font-industrial font-bold italic tracking-tighter text-white uppercase">TIPO_REGISTRO</h2>
                  <p className="text-[10px] text-[var(--color-text-secondary)] font-mono tracking-[0.3em] uppercase mt-1">SELECCIÓN_FLUJO // MANUAL</p>
                </div>
                <button onClick={() => setIsManualTypeModalOpen(false)} className="text-[var(--color-text-secondary)] hover:text-white transition-colors">
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={() => setIsTripFormOpen(true)}
                  className="group flex flex-col items-center gap-4 p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-[var(--color-neon-blue)] hover:bg-[var(--color-neon-blue)]/5 transition-all"
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--color-neon-blue)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="text-[var(--color-neon-blue)]" size={32} />
                  </div>
                  <span className="block font-industrial font-bold text-white tracking-widest uppercase">SALIDA</span>
                </button>

                <button
                  onClick={() => setIsFuelFormOpen(true)}
                  className="group flex flex-col items-center gap-4 p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-[var(--color-neon-green)] hover:bg-[var(--color-neon-green)]/5 transition-all"
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--color-neon-green)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Fuel className="text-[var(--color-neon-green)]" size={32} />
                  </div>
                  <span className="block font-industrial font-bold text-white tracking-widest uppercase">COMBUSTIBLE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form REGISTRO_SALIDA */}
      {isTripFormOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
          <div className="glass-card w-full max-w-sm p-8 premium-border">
            <div className="premium-border-inner p-8">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-2xl font-industrial font-bold italic text-white uppercase">REGISTRO_SALIDA</h2>
                <button onClick={() => setIsTripFormOpen(false)} className="text-[var(--color-text-secondary)]">×</button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] text-[var(--color-text-secondary)] font-mono uppercase block mb-2">KILOMETRAJE_ACTUAL</label>
                  <input
                    type="number"
                    value={manualValue}
                    onChange={(e) => setManualValue(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-xl text-white font-bold"
                    placeholder={vehicle.odometer.toString()}
                  />
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[9px] text-[var(--color-text-secondary)] font-mono uppercase block mb-1">FECHA_REGISTRO</span>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-transparent text-white font-bold text-xs uppercase focus:outline-none"
                  />
                </div>
                <button onClick={handleTripRegistry} className="w-full py-4 bg-[var(--color-neon-blue)] text-black font-bold rounded-xl uppercase">GUARDAR_SALIDA</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form CARGA_COMBUSTIBLE */}
      {isFuelFormOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
          <div className="glass-card w-full max-w-md p-8 premium-border">
            <div className="premium-border-inner p-8">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-2xl font-industrial font-bold italic text-white uppercase">CARGA_COMBUSTIBLE</h2>
                <button onClick={() => setIsFuelFormOpen(false)} className="text-[var(--color-text-secondary)]">×</button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-2">
                  <label className="text-[10px] text-[var(--color-text-secondary)] font-mono uppercase block mb-2">KILOMETRAJE_ESTACIÓN</label>
                  <input
                    type="number"
                    value={fuelForm.km}
                    onChange={(e) => setFuelForm({...fuelForm, km: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--color-text-secondary)] font-mono uppercase block mb-2">GALONES_L</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fuelForm.gallons}
                    onChange={(e) => setFuelForm({...fuelForm, gallons: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--color-text-secondary)] font-mono uppercase block mb-2">PRECIO_TOTAL</label>
                  <input
                    type="number"
                    value={fuelForm.price}
                    onChange={(e) => setFuelForm({...fuelForm, price: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-[var(--color-text-secondary)] font-mono uppercase block mb-2">NOMBRE_ESTACIÓN</label>
                  <input
                    type="text"
                    value={fuelForm.station}
                    onChange={(e) => setFuelForm({...fuelForm, station: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white font-bold"
                    placeholder="S/N"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-[var(--color-text-secondary)] font-mono uppercase block mb-2">FECHA_REGISTRO</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white font-bold"
                  />
                </div>
              </div>
              
              {fuelForm.gallons && fuelForm.price && (
                <div className="mb-6 p-4 bg-[var(--color-neon-green)]/10 border border-[var(--color-neon-green)]/30 rounded-xl flex justify-between items-center">
                  <span className="text-[9px] font-mono text-[var(--color-neon-green)] uppercase">Precio_Por_Galón</span>
                  <span className="text-white font-bold font-industrial">
                    ${(Number(fuelForm.price) / Number(fuelForm.gallons)).toFixed(2)}
                  </span>
                </div>
              )}

              <button onClick={handleFuelRegistry} className="w-full py-4 bg-[var(--color-neon-green)] text-black font-bold rounded-xl uppercase">REGISTRAR_TANQUEO</button>
            </div>
          </div>
        </div>
      )}

      {/* Selection Modal (Escanear vs Escribir) */}
      {isSelectionModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="glass-card w-full max-w-md p-8 premium-border">
            <div className="premium-border-inner p-8 text-center">
              <div className="flex justify-between items-start mb-10 text-left">
                <div>
                  <h2 className="text-3xl font-industrial font-bold italic tracking-tighter text-white uppercase">SISTEMA_CAPTURA</h2>
                  <p className="text-[10px] text-[var(--color-text-secondary)] font-mono tracking-[0.3em] uppercase mt-1">NÚCLEO_CONTROL // ALPHA_01</p>
                </div>
                <button onClick={() => setIsSelectionModalOpen(false)} className="text-[var(--color-text-secondary)] hover:text-white transition-colors">
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-4">
                <button
                  onClick={() => {
                    setIsSelectionModalOpen(false);
                    setIsScannerOpen(true);
                  }}
                  className="group flex flex-col items-center gap-4 p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-[var(--color-neon-blue)] hover:bg-[var(--color-neon-blue)]/5 transition-all"
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--color-neon-blue)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="text-[var(--color-neon-blue)]" size={32} />
                  </div>
                  <span className="block font-industrial font-bold text-white tracking-widest uppercase">ESCANEAR</span>
                </button>

                <button
                  onClick={() => {
                    setIsSelectionModalOpen(false);
                    setIsManualTypeModalOpen(true);
                  }}
                  className="group flex flex-col items-center gap-4 p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-[var(--color-neon-green)] hover:bg-[var(--color-neon-green)]/5 transition-all"
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--color-neon-green)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Edit3 className="text-[var(--color-neon-green)]" size={32} />
                  </div>
                  <span className="block font-industrial font-bold text-white tracking-widest uppercase">ESCRIBIR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isScannerOpen && (
        <OCRScanner
          onCapture={handleOdorCapture}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

    </div>
  );
};

export default Dashboard;
