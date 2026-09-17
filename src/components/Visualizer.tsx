import React, { useEffect, useRef } from 'react';
import { Activity, Volume2, Radio } from 'lucide-react';
import { LiveAudioEngine } from '../audio/AudioEngine';

interface VisualizerProps {
  engine: LiveAudioEngine | null;
  isActive: boolean;
  isMono: boolean;
}

export const Visualizer: React.FC<VisualizerProps> = ({ engine, isActive, isMono }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const meterLRef = useRef<HTMLDivElement | null>(null);
  const meterRRef = useRef<HTMLDivElement | null>(null);
  const peakLRef = useRef<HTMLDivElement | null>(null);
  const peakRRef = useRef<HTMLDivElement | null>(null);
  const clipRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear with dark tech gradient
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Center reference line
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (engine && isActive) {
        const waveData = engine.getWaveformData();
        const levels = engine.getLevels();

        // Update hardware-accelerated meter DOM directly for 60fps performance
        if (meterLRef.current) {
          meterLRef.current.style.height = `${Math.min(100, levels.levelL * 100)}%`;
        }
        if (meterRRef.current) {
          const rVal = isMono ? levels.levelL : levels.levelR;
          meterRRef.current.style.height = `${Math.min(100, rVal * 100)}%`;
        }
        if (peakLRef.current) {
          peakLRef.current.style.bottom = `${Math.min(100, levels.peakL * 100)}%`;
        }
        if (peakRRef.current) {
          const rPeak = isMono ? levels.peakL : levels.peakR;
          peakRRef.current.style.bottom = `${Math.min(100, rPeak * 100)}%`;
        }
        if (clipRef.current) {
          if (levels.isClipping) {
            clipRef.current.classList.add('bg-rose-500', 'text-white', 'shadow-rose-500/50');
            clipRef.current.classList.remove('bg-slate-800', 'text-slate-500');
          } else {
            clipRef.current.classList.remove('bg-rose-500', 'text-white', 'shadow-rose-500/50');
            clipRef.current.classList.add('bg-slate-800', 'text-slate-500');
          }
        }

        if (waveData) {
          // Draw Spectrum glow in background
          const freq = waveData.freqL;
          const barWidth = (width / freq.length) * 2.5;
          let barX = 0;
          for (let i = 0; i < freq.length / 2; i++) {
            const barHeight = (freq[i] / 255) * (height * 0.45);
            ctx.fillStyle = `rgba(6, 182, 212, ${0.1 + (freq[i] / 255) * 0.35})`;
            ctx.fillRect(barX, height - barHeight, barWidth - 1, barHeight);
            barX += barWidth;
          }

          // Draw Left Channel Wave (Cyan)
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#0284c7';
          ctx.beginPath();
          const sliceWidthL = width / waveData.waveL.length;
          let xL = 0;
          for (let i = 0; i < waveData.waveL.length; i++) {
            const v = waveData.waveL[i] / 128.0;
            const y = (v * height) / 2;
            if (i === 0) ctx.moveTo(xL, y);
            else ctx.lineTo(xL, y);
            xL += sliceWidthL;
          }
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Draw Right Channel Wave (Violet/Indigo, or layered if stereo)
          if (!isMono) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#a855f7';
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#7e22ce';
            ctx.beginPath();
            const sliceWidthR = width / waveData.waveR.length;
            let xR = 0;
            for (let i = 0; i < waveData.waveR.length; i++) {
              const v = waveData.waveR[i] / 128.0;
              const y = (v * height) / 2;
              if (i === 0) ctx.moveTo(xR, y);
              else ctx.lineTo(xR, y);
              xR += sliceWidthR;
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      } else {
        // Idle flat line with subtle breathe
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        if (meterLRef.current) meterLRef.current.style.height = '0%';
        if (meterRRef.current) meterRRef.current.style.height = '0%';
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [engine, isActive, isMono]);

  return (
    <div 
      id="visualizer-container"
      className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col md:flex-row gap-4 items-stretch"
    >
      {/* Oscilloscope Canvas */}
      <div className="relative flex-1 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col">
        {/* Visualizer Header bar */}
        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 backdrop-blur-sm">
              <Activity className="w-3 h-3 text-cyan-400" />
              OSCILLOSCOPE & SPECTRUM
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-500'}`}>
              {isActive ? '48kHz LIVE' : 'STANDBY'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-cyan-400 font-semibold bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              CH-1 (L)
            </span>
            {!isMono && (
              <span className="text-[10px] font-mono text-purple-400 font-semibold bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                CH-2 (R)
              </span>
            )}
            {isMono && (
              <span className="text-[10px] font-mono text-amber-400 font-semibold bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                SUMMED MONO
              </span>
            )}
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={160}
          className="w-full h-40 object-cover"
        />
      </div>

      {/* Stereo VU Peak Meters */}
      <div className="w-full md:w-44 bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
            <Radio className="w-3 h-3 text-cyan-400" />
            Stereo Meters
          </span>
          <span
            ref={clipRef}
            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 transition-colors duration-100 shadow-sm"
          >
            CLIP
          </span>
        </div>

        {/* Meters Display */}
        <div className="flex items-end justify-center gap-3.5 my-2 h-28">
          {/* Channel L */}
          <div className="flex flex-col items-center gap-1">
            <div className="relative w-4 h-24 bg-slate-900 rounded-sm overflow-hidden border border-slate-800 flex flex-col justify-end">
              {/* dB Gradient Fill */}
              <div
                ref={meterLRef}
                className="w-full bg-gradient-to-t from-cyan-500 via-emerald-400 to-rose-500 transition-all duration-75"
                style={{ height: '0%' }}
              />
              {/* Peak line marker */}
              <div
                ref={peakLRef}
                className="absolute w-full h-[2px] bg-white transition-all duration-100"
                style={{ bottom: '0%' }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-400">L</span>
          </div>

          {/* dB Scale */}
          <div className="flex flex-col justify-between h-24 text-[9px] font-mono text-slate-500 select-none pb-1">
            <span> 0dB</span>
            <span>-6dB</span>
            <span>-12dB</span>
            <span>-24dB</span>
            <span>-∞</span>
          </div>

          {/* Channel R */}
          <div className="flex flex-col items-center gap-1">
            <div className="relative w-4 h-24 bg-slate-900 rounded-sm overflow-hidden border border-slate-800 flex flex-col justify-end">
              <div
                ref={meterRRef}
                className={`w-full bg-gradient-to-t transition-all duration-75 ${
                  isMono
                    ? 'from-cyan-500 via-emerald-400 to-rose-500'
                    : 'from-purple-500 via-pink-400 to-rose-500'
                }`}
                style={{ height: '0%' }}
              />
              <div
                ref={peakRRef}
                className="absolute w-full h-[2px] bg-white transition-all duration-100"
                style={{ bottom: '0%' }}
              />
            </div>
            <span className={`text-[10px] font-mono font-bold ${isMono ? 'text-amber-400' : 'text-purple-400'}`}>
              R
            </span>
          </div>
        </div>

        <div className="text-[10px] font-mono text-center text-slate-400">
          {isActive ? (isMono ? 'Mono Sum Active' : 'Stereo True L/R') : 'Engine Paused'}
        </div>
      </div>
    </div>
  );
};
