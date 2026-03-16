import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface OCRScannerProps {
  onCapture: (value: number) => void;
  onClose: () => void;
}

const OCRScanner: React.FC<OCRScannerProps> = ({ onCapture, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Prioritize rear camera on mobile
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasCameraAccess(true);
        setError(null);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("No se pudo acceder a la cámara. Asegúrate de dar permisos.");
      setHasCameraAccess(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const handleCapture = () => {
    if (!hasCameraAccess) return;
    
    // In a real scenario, here we would grab a frame from the video
    // and send it to an OCR API or library.
    setIsScanning(true);
    setConfidence(null);
    setResult(null);
    setError(null);

    // Stop camera to "freeze" the frame effect or just stop usage
    stopCamera();

    // Simulate OCR processing time
    setTimeout(() => {
      const simulatedConfidence = Math.random() * 30 + 70; // High confidence for mock
      const simulatedValue = Math.floor(Math.random() * 50000) + 10000;
      
      setConfidence(simulatedConfidence);
      setIsScanning(false);
      setResult(simulatedValue);
    }, 2000);
  };

  const handleRetry = () => {
    setResult(null);
    setConfidence(null);
    startCamera();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
      <div className="glass-card w-full max-w-xl p-8 premium-border">
        <div className="premium-border-inner p-8">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-3xl font-industrial font-bold italic tracking-tighter text-white uppercase">OCR_SCAN_PROTOCOL</h2>
              <p className="text-[10px] text-[var(--color-text-secondary)] font-mono tracking-[0.3em] uppercase mt-2">v2.1 // REAL_TIME_BITSTREAM</p>
            </div>
            <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-white transition-colors">
              <span className="text-2xl">×</span>
            </button>
          </div>

          <div className="aspect-video w-full bg-black/60 rounded-2xl border border-white/5 relative overflow-hidden mb-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            {/* Real Video Feed */}
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover ${result || isScanning ? 'hidden' : 'block'}`}
            />

            {/* Viewfinder Deco - Only visible when camera is live */}
            {!result && !isScanning && (
              <>
                <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-[var(--color-neon-blue)] rounded-tl-xl opacity-60"></div>
                <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-[var(--color-neon-blue)] rounded-tr-xl opacity-60"></div>
                <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-[var(--color-neon-blue)] rounded-bl-xl opacity-60"></div>
                <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-[var(--color-neon-blue)] rounded-br-xl opacity-60"></div>
                
                {/* Horizontal Scan Line */}
                <div className="absolute inset-x-8 top-1/2 h-[1px] bg-[var(--color-neon-blue)]/30 shadow-[0_0_10px_var(--color-neon-blue)]"></div>
              </>
            )}

            {isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-neon-blue)]/10 backdrop-blur-sm">
                <div className="w-full h-[2px] bg-[var(--color-neon-blue)] shadow-[0_0_20px_var(--color-neon-blue)] absolute top-0 animate-scan"></div>
                <RefreshCw size={48} className="text-[var(--color-neon-blue)] animate-spin mb-4" />
                <span className="text-white font-mono text-xs tracking-[0.4em] animate-pulse">PROCESANDO_IMAGEN...</span>
              </div>
            )}

            {!isScanning && result && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/60 animate-in fade-in zoom-in duration-500">
                  <div className="text-[var(--color-neon-green)] text-[10px] font-mono tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                    <CheckCircle size={14} /> CAPTURA_EXITOSA
                  </div>
                  <div className="text-6xl font-industrial font-bold italic tracking-tighter text-white mb-4">
                    {result.toLocaleString()} <span className="text-xl">KM</span>
                  </div>
                  
                  {confidence && (
                    <div className="flex items-center gap-3 bg-black/60 px-6 py-2 rounded-full border border-white/10 shadow-xl">
                       <span className="text-[10px] font-mono text-[var(--color-text-secondary)] uppercase">Confianza:</span>
                       <span className="text-[10px] font-bold font-mono text-[var(--color-neon-green)]">
                         {confidence.toFixed(2)}%
                       </span>
                    </div>
                  )}
              </div>
            )}

            {!hasCameraAccess && !error && !result && !isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/40">
                  <RefreshCw size={40} className="text-[var(--color-neon-blue)] animate-spin mb-4" />
                  <p className="text-[var(--color-text-secondary)] text-xs font-mono tracking-widest uppercase">
                    Iniciando_Hardware...
                  </p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-[var(--color-neon-orange)]/10 border border-[var(--color-neon-orange)]/30 rounded-xl flex items-center gap-4 mb-8 animate-in slide-in-from-top-2">
              <AlertTriangle className="text-[var(--color-neon-orange)] shrink-0" size={20} />
              <div className="text-[10px] text-[var(--color-neon-orange)] font-bold tracking-widest uppercase">{error}</div>
            </div>
          )}

          <div className="flex gap-4">
             {!result ? (
               <button 
                 onClick={handleCapture} 
                 disabled={isScanning || !hasCameraAccess}
                 className="flex-1 py-4 bg-[var(--color-neon-blue)] text-black font-bold tracking-[0.2em] rounded-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all uppercase text-xs flex items-center justify-center gap-3"
               >
                 {isScanning ? <RefreshCw size={16} className="animate-spin" /> : <Camera size={16} />}
                 {isScanning ? 'ESCANEANDO...' : 'CAPTURAR_ODOMETRO'}
               </button>
             ) : (
               <>
                 <button 
                   onClick={handleRetry}
                   className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold tracking-[0.2em] rounded-xl hover:bg-white/10 transition-all uppercase text-xs"
                 >
                   REINTENTAR
                 </button>
                 <button 
                   onClick={() => result && onCapture(result)}
                   className="flex-1 py-4 bg-[var(--color-neon-green)] text-black font-bold tracking-[0.2em] rounded-xl hover:scale-[1.02] active:scale-95 transition-all uppercase text-xs shadow-[0_0_20px_rgba(57,255,20,0.4)]"
                 >
                   CONFIRMAR_VALOR
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
