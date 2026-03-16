import React, { useState } from 'react';
import { Camera, RefreshCw, AlertTriangle } from 'lucide-react';

interface OCRScannerProps {
  onCapture: (value: number) => void;
  onClose: () => void;
}

const OCRScanner: React.FC<OCRScannerProps> = ({ onCapture, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const simulateScan = () => {
    setIsScanning(true);
    setConfidence(null);
    setResult(null);
    setError(null);

    // Simulate OCR processing time
    setTimeout(() => {
      const simulatedConfidence = Math.random() * 100;
      const simulatedValue = Math.floor(Math.random() * 50000) + 10000;
      
      setConfidence(simulatedConfidence);
      setIsScanning(false);

      if (simulatedConfidence > 60) {
        setResult(simulatedValue);
      } else {
        // Spec: Glide Degradation Strategy - Ask for human confirmation if confidence < 60%
        setError("Low confidence scan. Please verify manually.");
        setResult(simulatedValue); // Still show what we think it is
      }
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
      <div className="glass-card w-full max-w-xl p-8 premium-border">
        <div className="premium-border-inner p-8">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-3xl font-industrial font-bold italic tracking-tighter text-white uppercase">OCR_SCAN_PROTOCOL</h2>
              <p className="text-[10px] text-[var(--color-text-secondary)] font-mono tracking-[0.3em] uppercase mt-2">v2.0 // ML_KIT_ODOMETER_ENGINE</p>
            </div>
            <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-white transition-colors">
              <span className="text-2xl">×</span>
            </button>
          </div>

          <div className="aspect-video w-full bg-black/60 rounded-2xl border border-white/5 relative overflow-hidden mb-8">
            {/* Viewfinder Deco */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-[var(--color-neon-blue)] rounded-tl-xl opacity-40"></div>
            <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-[var(--color-neon-blue)] rounded-tr-xl opacity-40"></div>
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-[var(--color-neon-blue)] rounded-bl-xl opacity-40"></div>
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-[var(--color-neon-blue)] rounded-br-xl opacity-40"></div>

            {isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-neon-blue)]/5">
                <div className="w-full h-[2px] bg-[var(--color-neon-blue)] shadow-[0_0_15px_var(--color-neon-blue)] absolute top-0 animate-scan"></div>
                <RefreshCw size={48} className="text-[var(--color-neon-blue)] animate-spin mb-4" />
                <span className="text-white font-mono text-[10px] tracking-[0.4em] animate-pulse">ANALYZING_BITSTREAM</span>
              </div>
            )}

            {!isScanning && !result && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                 <Camera size={64} className="text-white/20 mb-6" />
                 <p className="text-[var(--color-text-secondary)] text-xs font-mono tracking-widest leading-relaxed uppercase">
                   Position motorcycle odometer within target frame for automated capture.
                 </p>
              </div>
            )}

            {!isScanning && result && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/40">
                  <div className="text-[var(--color-text-secondary)] text-[10px] font-mono tracking-[0.3em] uppercase mb-4">IDENTIFIED_KILOMETRAGE</div>
                  <div className={`text-6xl font-industrial font-bold italic tracking-tighter mb-4 ${confidence && confidence < 60 ? 'text-[var(--color-neon-orange)]' : 'text-white'}`}>
                    {result.toLocaleString()} <span className="text-xl">KM</span>
                  </div>
                  
                  {confidence && (
                    <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-full border border-white/10">
                       <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">CONFIDENCE_IDX:</span>
                       <span className={`text-[10px] font-bold font-mono ${confidence < 60 ? 'text-[var(--color-neon-orange)]' : 'text-[var(--color-neon-green)]'}`}>
                         {confidence.toFixed(2)}%
                       </span>
                    </div>
                  )}
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-[var(--color-neon-orange)]/10 border border-[var(--color-neon-orange)]/30 rounded-xl flex items-center gap-4 mb-8">
              <AlertTriangle className="text-[var(--color-neon-orange)] shrink-0" size={20} />
              <div className="text-[10px] text-[var(--color-neon-orange)] font-bold tracking-widest uppercase">{error}</div>
            </div>
          )}

          <div className="flex gap-4">
             {!result ? (
               <button 
                 onClick={simulateScan} 
                 disabled={isScanning}
                 className="flex-1 py-4 bg-[var(--color-neon-blue)] text-black font-bold tracking-[0.2em] rounded-xl hover:scale-[1.02] active:scale-95 transition-all uppercase text-xs"
               >
                 {isScanning ? 'PROCESSING...' : 'INITIALIZE_CAPTURE'}
               </button>
             ) : (
               <>
                 <button 
                   onClick={simulateScan}
                   className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold tracking-[0.2em] rounded-xl hover:bg-white/10 transition-all uppercase text-xs"
                 >
                   RETRY_CAPTURE
                 </button>
                 <button 
                   onClick={() => result && onCapture(result)}
                   className="flex-1 py-4 bg-[var(--color-neon-green)] text-black font-bold tracking-[0.2em] rounded-xl hover:scale-[1.02] active:scale-95 transition-all uppercase text-xs shadow-[var(--shadow-neon)]"
                 >
                   CONFIRM_METRIC
                 </button>
               </>
             )}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0% }
          100% { top: 100% }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default OCRScanner;
