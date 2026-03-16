import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { createWorker } from 'tesseract.js';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
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

  const processImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Image Pre-processing for LCD (Contrast + Grayscale)
    // This helps Tesseract read digital segments better
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      // Increase contrast
      const threshold = 128;
      const value = avg > threshold ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = value;
    }
    context.putImageData(imageData, 0, 0);

    return canvas.toDataURL('image/png');
  };

  const handleCapture = async () => {
    if (!hasCameraAccess) return;
    
    setIsScanning(true);
    setConfidence(null);
    setResult(null);
    setError(null);

    try {
      const imageData = await processImage();
      if (!imageData) throw new Error("No image data captured");

      // Initialize Tesseract Worker
      const worker = await createWorker('eng');
      
      // Configure Tesseract to look for digits only
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789',
      });

      const { data: { text, confidence: ocrConfidence } } = await worker.recognize(imageData);
      await worker.terminate();

      // Filter text to find numbers
      const numbers = text.replace(/\D/g, '');
      
      if (numbers && numbers.length > 0) {
        const value = parseInt(numbers, 10);
        
        // Simple heuristic: Odometer shouldn't be suspiciously high or low for a single reading
        // but since we don't know the exact range, we accept it if it's a number.
        setResult(value);
        setConfidence(ocrConfidence);
        stopCamera();
      } else {
        setError("No se detectaron números. Intenta acercarte más o mejorar la luz.");
      }
    } catch (err) {
      console.error("OCR Error:", err);
      setError("Error al procesar la imagen. Intenta de nuevo.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setConfidence(null);
    startCamera();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="glass-card w-full max-w-xl p-8 premium-border">
        <div className="premium-border-inner p-8">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-3xl font-industrial font-bold italic tracking-tighter text-white uppercase">OCR_INTELLIGENCE_ENGINE</h2>
              <p className="text-[10px] text-[var(--color-text-secondary)] font-mono tracking-[0.3em] uppercase mt-2">v3.0 // POWERED_BY_TESSERACT</p>
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
                
                {/* ODO Box Highlight */}
                <div className="absolute inset-x-20 inset-y-12 border border-[var(--color-neon-blue)]/20 bg-[var(--color-neon-blue)]/5 rounded-lg flex items-center justify-center">
                  <span className="text-[8px] font-mono text-[var(--color-neon-blue)]/40 uppercase tracking-[0.5em]">Target_ODO_Area</span>
                </div>

                <div className="absolute inset-x-8 top-1/2 h-[1px] bg-[var(--color-neon-blue)]/30 shadow-[0_0_10px_var(--color-neon-blue)]"></div>
              </>
            )}

            {isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-neon-blue)]/10 backdrop-blur-sm">
                <div className="w-full h-[2px] bg-[var(--color-neon-blue)] shadow-[0_0_20px_var(--color-neon-blue)] absolute top-0 animate-scan"></div>
                <RefreshCw size={48} className="text-[var(--color-neon-blue)] animate-spin mb-4" />
                <span className="text-white font-mono text-xs tracking-[0.4em] animate-pulse uppercase">Extrayendo_Digital_Data...</span>
              </div>
            )}

            {!isScanning && result && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/60 animate-in fade-in zoom-in duration-500">
                  <div className="text-[var(--color-neon-green)] text-[10px] font-mono tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                    <CheckCircle size={14} /> IDENTIFICACION_DATA_ODO
                  </div>
                  <div className="text-6xl font-industrial font-bold italic tracking-tighter text-white mb-4">
                    {result.toLocaleString()} <span className="text-xl">KM</span>
                  </div>
                  
                  {confidence && (
                    <div className="flex items-center gap-3 bg-black/60 px-6 py-2 rounded-full border border-white/10 shadow-xl">
                       <span className="text-[10px] font-mono text-[var(--color-text-secondary)] uppercase">Confianza_IA:</span>
                       <span className={`text-[10px] font-bold font-mono ${confidence < 60 ? 'text-[var(--color-neon-orange)]' : 'text-[var(--color-neon-green)]'}`}>
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
                    Iniciando_Motor_Vision...
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
                 {isScanning ? 'ANALIZANDO_LCD...' : 'INICIAR_ESCANEADO_REAL'}
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
                   VALIDAR_QUILOMETRAJE
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
