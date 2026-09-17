import React from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Clock, 
  Sliders, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  Bluetooth,
  Headphones,
  RotateCcw
} from 'lucide-react';
import { AudioSettings } from '../types';

interface MainControlPanelProps {
  isActive: boolean;
  settings: AudioSettings;
  onToggleActive: () => void;
  onUpdateGain: (gainDb: number) => void;
  onUpdateDelay: (delayMs: number) => void;
  onToggleMono: () => void;
  onToggleUncompressed: () => void;
  onToggleSafetyLimiter: () => void;
  onOpenDevicesModal: () => void;
}

export const MainControlPanel: React.FC<MainControlPanelProps> = ({
  isActive,
  settings,
  onToggleActive,
  onUpdateGain,
  onUpdateDelay,
  onToggleMono,
  onToggleUncompressed,
  onToggleSafetyLimiter,
  onOpenDevicesModal,
}) => {
  const linearMultiplier = Math.pow(10, settings.gainDb / 20).toFixed(2);
  const delaySeconds = (settings.delayMs / 1000).toFixed(2);

  return (
    <div 
      id="main-control-panel"
      className="grid grid-cols-1 lg:grid-cols-12 gap-5"
    >
      {/* Primary Engine Trigger Card (Large Visual Centerpiece) */}
      <div className="lg:col-span-4 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between items-center text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div 
          className={`absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl transition-opacity duration-500 pointer-events-none ${
            isActive ? 'bg-cyan-500/25 opacity-100' : 'bg-slate-700/10 opacity-30'
          }`} 
        />

        {/* Top bar status */}
        <div className="w-full flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isActive ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'
              }`}
            />
            <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase">
              {isActive ? 'FEED ACTIVE' : 'STREAM STANDBY'}
            </span>
          </div>

          <button
            onClick={onOpenDevicesModal}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-800/40 px-2.5 py-1 rounded-lg transition"
            title="Configure Bluetooth / Microphones"
          >
            <Bluetooth className="w-3.5 h-3.5" />
            <span>Devices</span>
          </button>
        </div>

        {/* Master Power Button */}
        <div className="my-6 z-10 flex flex-col items-center">
          <button
            id="master-stream-toggle-btn"
            onClick={onToggleActive}
            className={`relative group p-8 rounded-full transition-all duration-300 active:scale-95 shadow-2xl cursor-pointer ${
              isActive
                ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-cyan-500/40 border-4 border-cyan-300 ring-8 ring-cyan-500/20'
                : 'bg-slate-800/90 hover:bg-slate-800 text-slate-400 hover:text-white border-4 border-slate-700 hover:border-slate-600 shadow-black/50'
            }`}
            aria-label={isActive ? 'Stop live audio stream' : 'Start live audio stream'}
          >
            {isActive ? (
              <Mic className="w-12 h-12 animate-pulse" />
            ) : (
              <MicOff className="w-12 h-12" />
            )}
          </button>

          <div className="mt-4">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {isActive ? 'STREAMING LIVE' : 'START LIVE STREAM'}
            </h2>
            <p className="text-xs text-slate-400 max-w-[220px] mt-1 mx-auto">
              {isActive
                ? 'Live microphone feed is streaming to speakers/Bluetooth in real time'
                : 'Tap to route live microphone feed to Bluetooth or speakers'}
            </p>
          </div>
        </div>

        {/* Mode Quick Badges */}
        <div className="w-full pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 z-10">
          <button
            id="mono-toggle-badge"
            onClick={onToggleMono}
            className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
              settings.isMono
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Channel Mode
            </span>
            <span className="text-xs font-bold font-mono">
              {settings.isMono ? 'MONO (SUMMED)' : 'STEREO (L/R)'}
            </span>
          </button>

          <button
            id="uncompressed-toggle-badge"
            onClick={onToggleUncompressed}
            className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
              settings.uncompressed
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-300'
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              DSP Compression
            </span>
            <span className="text-xs font-bold font-mono">
              {settings.uncompressed ? 'UNCOMPRESSED' : 'VOICE FILTERED'}
            </span>
          </button>
        </div>
      </div>

      {/* Gain & Delay Control Sliders */}
      <div className="lg:col-span-8 flex flex-col gap-5">
        {/* Gain Slider (0 dB to +15 dB) */}
        <div 
          id="gain-control-card"
          className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
                  Gain Boost
                  <span className="text-xs font-mono font-normal text-slate-400">
                    (0 dB to +15 dB)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Preamplification gain for live microphone signal</p>
              </div>
            </div>

            {/* Numerical Readout */}
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
                <span className="text-lg font-bold font-mono text-cyan-400">
                  +{settings.gainDb.toFixed(1)} dB
                </span>
                <span className="text-[11px] font-mono text-slate-500 ml-1.5">
                  ({linearMultiplier}x)
                </span>
              </div>
              <button
                id="reset-gain-btn"
                onClick={() => onUpdateGain(0)}
                title="Reset Gain to 0 dB"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Gain Range Slider */}
          <div className="mt-4 px-1">
            <div className="relative flex items-center">
              <input
                id="gain-slider"
                type="range"
                min="0"
                max="15"
                step="0.1"
                value={settings.gainDb}
                onChange={(e) => onUpdateGain(parseFloat(e.target.value))}
                aria-label="Microphone gain slider from 0 dB to +15 dB"
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
              />
            </div>

            {/* Quick Gain Presets */}
            <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2">
              <span>0 dB (Unity)</span>
              <span>+3 dB</span>
              <span>+6 dB</span>
              <span>+9 dB</span>
              <span>+12 dB</span>
              <span className="text-cyan-400 font-bold">+15 dB (Max)</span>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              {[0, 3, 6, 9, 12, 15].map((preset) => (
                <button
                  key={preset}
                  onClick={() => onUpdateGain(preset)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium border transition ${
                    Math.abs(settings.gainDb - preset) < 0.1
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  +{preset}dB
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Delay Slider (0 ms to 15,000 ms) */}
        <div 
          id="delay-control-card"
          className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
                  Delay Buffer
                  <span className="text-xs font-mono font-normal text-slate-400">
                    (0 ms to 15,000 ms)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Audio time offset for synchronization, echo, or delay</p>
              </div>
            </div>

            {/* Numerical Delay Readout */}
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
                <span className="text-lg font-bold font-mono text-cyan-400">
                  {settings.delayMs.toLocaleString()} ms
                </span>
                <span className="text-[11px] font-mono text-slate-500 ml-1.5">
                  ({delaySeconds}s)
                </span>
              </div>
              <button
                id="reset-delay-btn"
                onClick={() => onUpdateDelay(0)}
                title="Reset Delay to 0 ms"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Delay Range Slider */}
          <div className="mt-4 px-1">
            <div className="relative flex items-center">
              <input
                id="delay-slider"
                type="range"
                min="0"
                max="15000"
                step="10"
                value={settings.delayMs}
                onChange={(e) => onUpdateDelay(parseInt(e.target.value, 10))}
                aria-label="Audio delay slider from 0 ms up to 15,000 ms"
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
              />
            </div>

            <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2">
              <span>0 ms (Real-time)</span>
              <span>2.5s</span>
              <span>5.0s</span>
              <span>7.5s</span>
              <span>10.0s</span>
              <span>12.5s</span>
              <span className="text-cyan-400 font-bold">15,000 ms (15s)</span>
            </div>

            {/* Quick Delay Presets */}
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              {[
                { label: '0ms (Live)', ms: 0 },
                { label: '50ms (Sync)', ms: 50 },
                { label: '250ms (Echo)', ms: 250 },
                { label: '1,000ms (1s)', ms: 1000 },
                { label: '5,000ms (5s)', ms: 5000 },
                { label: '10,000ms (10s)', ms: 10000 },
                { label: '15,000ms (Max)', ms: 15000 },
              ].map((p) => (
                <button
                  key={p.ms}
                  onClick={() => onUpdateDelay(p.ms)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium border transition ${
                    settings.delayMs === p.ms
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}

              {/* Fine +/- buttons */}
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => onUpdateDelay(Math.max(0, settings.delayMs - 100))}
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                  title="Subtract 100ms"
                >
                  -100ms
                </button>
                <button
                  onClick={() => onUpdateDelay(Math.min(15000, settings.delayMs + 100))}
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                  title="Add 100ms"
                >
                  +100ms
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Toggles Row: Mono Switch, Uncompressed Mode, Safety Limiter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Mono / Stereo Switch */}
          <div className="p-3.5 bg-slate-900/80 border border-slate-800/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-xs font-semibold text-white">Mono Downmix</div>
                <div className="text-[10px] text-slate-400">Sum L+R to both ears</div>
              </div>
            </div>
            <button
              id="mono-switch-btn"
              onClick={onToggleMono}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.isMono ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
              aria-label="Toggle mono switch"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 absolute top-1 left-1 ${
                  settings.isMono ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Uncompressed Studio Mode */}
          <div className="p-3.5 bg-slate-900/80 border border-slate-800/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs font-semibold text-white">Uncompressed</div>
                <div className="text-[10px] text-slate-400">Raw 48kHz / No ducking</div>
              </div>
            </div>
            <button
              id="uncompressed-switch-btn"
              onClick={onToggleUncompressed}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.uncompressed ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
              aria-label="Toggle uncompressed studio mode"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 absolute top-1 left-1 ${
                  settings.uncompressed ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Safety Feedback Limiter Guard */}
          <div className="p-3.5 bg-slate-900/80 border border-slate-800/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.safetyLimiter ? (
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              )}
              <div>
                <div className="text-xs font-semibold text-white">Safety Limiter</div>
                <div className="text-[10px] text-slate-400">Prevents feedback burst</div>
              </div>
            </div>
            <button
              id="safety-limiter-switch-btn"
              onClick={onToggleSafetyLimiter}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.safetyLimiter ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
              aria-label="Toggle safety limiter"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 absolute top-1 left-1 ${
                  settings.safetyLimiter ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
