import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
      <header className="mb-10">
        <h1 className="text-white font-industrial font-bold italic tracking-tighter text-5xl flex items-center gap-3">
           <span className="w-3 h-10 bg-[var(--color-neon-blue)] inline-block"></span>
           SYSTEM_CONFIG
        </h1>
        <p className="text-[var(--color-text-secondary)] text-[10px] font-mono tracking-[0.3em] uppercase mt-2 opacity-70">
          BIKE_KERNEL // PREFERENCES_MANAGEMENT
        </p>
      </header>

      <div className="glass-card p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-neon-blue)] opacity-5 blur-[80px] group-hover:opacity-10 transition-opacity"></div>
        
        <div className="flex items-center gap-6 mb-10 pb-10 border-b border-white/5">
          <div className="w-20 h-20 rounded-2xl bg-[var(--color-neon-blue)]/10 flex items-center justify-center border border-[var(--color-neon-blue)]/30 shadow-[0_0_15px_rgba(0,209,255,0.2)]">
            <SettingsIcon size={36} className="text-[var(--color-neon-blue)]" />
          </div>
          <div>
            <h2 className="text-3xl font-industrial font-bold italic tracking-widest text-white mb-1 uppercase">KERNEL_LEVEL_V1.0</h2>
            <p className="text-[var(--color-text-secondary)] text-xs font-mono tracking-widest opacity-60">Manage platform preferences and interconnected modules.</p>
          </div>
        </div>

        <div className="space-y-10">
          <div className="p-6 bg-black/20 rounded-xl border border-white/5">
             <div className="text-[var(--color-text-secondary)] text-[9px] font-bold uppercase tracking-[0.3em] font-mono mb-4">DEPLOYMENT_NOTICE</div>
             <p className="text-xs text-white/70 italic leading-relaxed border-l border-[var(--color-neon-blue)]/50 pl-4">
               Advanced diagnostic tools and firmware updates are currently managed via the <span className="text-[var(--color-neon-blue)] font-bold">Encrypted Mobile Admin Panel</span>. Some web-side overrides are restricted by security layer A-12.
             </p>
          </div>
          
          <div>
            <h3 className="text-white font-industrial font-bold italic text-sm mb-6 tracking-[0.3em] uppercase">ACTIVE_MODULAR_STACK</h3>
            <div className="grid gap-4">
              {[
                { name: 'UI_DARK_ENGINE', status: 'ENABLED', color: '[var(--color-neon-green)]' },
                { name: 'PUSH_NOTIFICATION_GW', status: 'ENABLED', color: '[var(--color-neon-green)]' },
                { name: 'OCR_METRIC_CAPTURE_V2', status: 'STANDBY', color: '[var(--color-text-secondary)]' },
                { name: 'DIAGNOSTIC_TELEMETRY_CACHE', status: 'SYNCHRONIZED', color: '[var(--color-neon-blue)]' }
              ].map((module, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                  <span className="text-[10px] font-bold text-white tracking-widest uppercase font-mono">{module.name}</span>
                  <div className="flex items-center gap-3">
                     <span className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: `var(--color-${module.status === 'STANDBY' ? 'text-secondary' : module.status === 'SYNCHRONIZED' ? 'neon-blue' : 'neon-green'})` }}>
                       {module.status}
                     </span>
                     <div className={`w-1.5 h-1.5 rounded-full ${module.status === 'STANDBY' ? 'bg-white/10' : 'animate-pulse'}`} style={{ backgroundColor: module.status === 'STANDBY' ? '' : `var(--color-${module.status === 'SYNCHRONIZED' ? 'neon-blue' : 'neon-green'})` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
