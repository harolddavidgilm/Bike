import { useState, useEffect } from 'react';
import { AlertTriangle, Fuel, Gauge, CheckSquare, Wrench } from 'lucide-react';
import { supabase } from '../lib/supabase';
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
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicle();
  }, []);

  const fetchVehicle = async () => {
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .limit(1)
      .single();

    if (data) setVehicle(data);
    setLoading(false);
  };

  const handleOdorCapture = async (newValue: number) => {
    if (!vehicle) return;

    // Actualizar en Supabase
    const { error } = await supabase
      .from('vehicles')
      .update({ odometer: newValue })
      .eq('id', vehicle.id);

    if (!error) {
      setVehicle({ ...vehicle, odometer: newValue });
    }
    setIsScannerOpen(false);
  };

  if (loading) return <div className="p-20 text-white font-mono animate-pulse">SINCRONIZANDO_CON_SISTEMA...</div>;
  if (!vehicle) return <div className="p-20 text-white font-mono">ERROR: UNIDAD_NO_ENCONTRADA_EN_ESQUEMA</div>;
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
            onClick={() => setIsScannerOpen(true)}
            className="bg-[var(--color-neon-green)] hover:scale-105 active:scale-95 text-black font-bold uppercase text-[10px] py-3 px-8 rounded-full tracking-widest transition-all flex items-center gap-2 shadow-[var(--shadow-neon)]"
          >
            <span className="text-lg leading-none">+</span> NUEVO DESPLIEGUE
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
              <h3 className="text-5xl font-bold tracking-tighter text-white font-sans">$120<span className="text-xl text-[var(--color-text-secondary)]">.50</span></h3>
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
            <div className="text-[var(--color-text-secondary)] text-[10px] uppercase tracking-[0.3em] mb-2 font-mono">Tasa_Optimización</div>
            <div className="flex items-baseline gap-2 mb-4">
              <h3 className="text-5xl font-bold tracking-tighter text-white">{vehicle.avg_consumption || '4.2'}</h3>
              <span className="text-[var(--color-neon-blue)] text-xs font-industrial font-bold italic tracking-widest uppercase">L/100KM</span>
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
          <h3 className="font-industrial font-bold italic tracking-[0.3em] text-[var(--color-text-secondary)] text-xs uppercase">TRANSMISIONES_TÁCTICAS</h3>
          <div className="flex gap-4">
            <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[8px] font-mono text-[var(--color-text-secondary)]">ESTADO_LOG: SEGURO</div>
            <button className="text-[var(--color-neon-green)] font-bold text-[9px] tracking-[0.3em] hover:text-white transition-colors uppercase font-mono">DESCIFRAR_HISTORIAL_COMPLETO</button>
          </div>
        </div>

        <div className="w-full">
          {[
            { type: 'REFILL', title: 'CONSOLIDACIÓN COMBUSTIBLE', detail: 'SHELL SECTOR-7 • 12.5L', value: '-$22.40', time: 'HACE 1 DÍA', icon: Fuel, color: '[var(--color-neon-green)]' },
            { type: 'ANALYSIS', title: 'SINCRO CINÉTICA FRENOS', detail: 'HANGAR INGENIERÍA • OK', value: 'VERIFICADO', time: '12 MAY, 2024', icon: Wrench, color: '[var(--color-neon-blue)]' },
            { type: 'DETAILING', title: 'LIMPIEZA AERODINÁMICA', detail: 'ZONA SANITARIA • COMPLETO', value: '-$15.00', time: '10 MAY, 2024', icon: CheckSquare, color: '[var(--color-text-secondary)]' }
          ].map((row, i) => (
            <div key={i} className="px-8 py-6 flex items-center justify-between hover:bg-white/[0.03] transition-all group border-b border-white/5 last:border-0 cursor-pointer">
              <div className="flex items-center gap-8">
                <div
                  className="w-12 h-12 rounded-xl border flex justify-center items-center transition-all duration-300"
                  style={{ borderColor: `rgba(255,255,255,0.05)`, backgroundColor: 'rgba(0,0,0,0.2)' }}
                >
                  <row.icon size={20} className="group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="font-industrial font-bold italic tracking-widest text-white uppercase text-sm mb-1 group-hover:text-[var(--color-neon-green)] transition-colors">{row.title}</h4>
                  <div className="text-[var(--color-text-secondary)] text-[10px] uppercase tracking-[0.2em] font-mono opacity-60">{row.detail}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold text-sm mb-1 tracking-tight ${row.value === 'VERIFIED' ? 'text-[var(--color-neon-green)]' : 'text-white'}`}>{row.value}</div>
                <div className="text-[var(--color-text-secondary)] text-[9px] uppercase tracking-[0.2em] font-mono">{row.time}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

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
