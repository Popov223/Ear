import React from 'react';
import { Sliders, RotateCcw, Sparkles } from 'lucide-react';
import { DEFAULT_EQ_FREQUENCIES } from '../types';

interface Equalizer12BandProps {
  eqGains: number[];
  onChangeBandGain: (index: number, gainDb: number) => void;
  onResetFlat: () => void;
  onApplyPreset: (presetGains: number[]) => void;
}

const PRESETS: { name: string; gains: number[] }[] = [
  { name: 'Flat (0dB)', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Vocal Clarity', gains: [-3, -2, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0] },
  { name: 'Bass Boost', gains: [7, 6, 5, 3, 1, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Treble Air', gains: [-2, -1, 0, 0, 0, 0, 1, 2, 4, 6, 7, 8] },
  { name: 'Anti-Feedback', gains: [0, 0, -2, -3, -4, -6, -6, -4, -2, 0, 0, 0] },
  { name: 'Warm Acoustic', gains: [3, 4, 3, 2, 0, -1, 0, 1, 2, 2, 1, 0] },
];

export const Equalizer12Band: React.FC<Equalizer12BandProps> = ({
  eqGains,
  onChangeBandGain,
  onResetFlat,
  onApplyPreset,
}) => {
  // SVG EQ curve preview generator
  const getCurvePath = () => {
    const width = 360;
    const height = 60;
    const padding = 15;
    const usableW = width - padding * 2;
    const midY = height / 2;
    const maxDb = 12;

    const points = eqGains.map((gain, i) => {
      const x = padding + (i / (eqGains.length - 1)) * usableW;
      const y = midY - (gain / maxDb) * (height / 2 - 8);
      return { x, y };
    });

    if (points.length === 0) return '';

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  return (
    <div 
      id="equalizer-panel"
      className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
              12-Band Graphic Equalizer
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                ±12 dB
              </span>
            </h3>
            <p className="text-xs text-slate-400">Precision acoustic response tuning across 32Hz - 20kHz</p>
          </div>
        </div>

        {/* Presets and Flat Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
            <select
              id="eq-preset-select"
              aria-label="Equalizer Presets"
              onChange={(e) => {
                const selected = PRESETS.find((p) => p.name === e.target.value);
                if (selected) onApplyPreset(selected.gains);
              }}
              defaultValue=""
              className="bg-transparent text-slate-300 hover:text-white px-2 py-1 text-xs outline-none cursor-pointer"
            >
              <option value="" disabled className="bg-slate-900 text-slate-400">
                Choose Preset...
              </option>
              {PRESETS.map((p) => (
                <option key={p.name} value={p.name} className="bg-slate-900 text-slate-200">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            id="reset-flat-btn"
            onClick={onResetFlat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/60 transition active:scale-95"
            title="Reset all bands to 0 dB"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Flat</span>
          </button>
        </div>
      </div>

      {/* Mini curve response visualization */}
      <div className="my-3 py-2 px-3 bg-slate-950/60 rounded-xl border border-slate-800/60 flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
          Frequency Response
        </span>
        <div className="w-64 sm:w-96 h-10 flex items-center">
          <svg viewBox="0 0 360 60" className="w-full h-full overflow-visible">
            {/* 0 dB reference center line */}
            <line x1="10" y1="30" x2="350" y2="30" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
            {/* Dynamic EQ curve */}
            <path
              d={getCurvePath()}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 font-semibold">
          {eqGains.every((g) => g === 0) ? 'FLAT' : 'CUSTOM EQ'}
        </span>
      </div>

      {/* 12 Faders Grid */}
      <div 
        id="eq-faders-container"
        className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-2 overflow-x-auto"
      >
        {DEFAULT_EQ_FREQUENCIES.map((band, idx) => {
          const gain = eqGains[idx] ?? 0;
          return (
            <div
              key={band.freq}
              className="flex flex-col items-center bg-slate-950/40 hover:bg-slate-950/80 p-2 rounded-xl border border-slate-800/60 transition group"
            >
              {/* dB value readout */}
              <span
                className={`text-[11px] font-mono font-semibold h-4 leading-none mb-2 ${
                  gain > 0
                    ? 'text-cyan-400'
                    : gain < 0
                    ? 'text-amber-400'
                    : 'text-slate-500'
                }`}
              >
                {gain > 0 ? `+${gain.toFixed(0)}` : gain.toFixed(0)}
              </span>

              {/* Vertical slider wrapper */}
              <div className="relative h-40 flex items-center justify-center my-1">
                {/* Visual center 0dB notch tick */}
                <div className="absolute w-4 h-[1px] bg-slate-700 z-0 pointer-events-none" />

                {/* Vertical Range Input */}
                <input
                  type="range"
                  id={`eq-slider-${band.freq}`}
                  min="-12"
                  max="12"
                  step="0.5"
                  value={gain}
                  onChange={(e) => onChangeBandGain(idx, parseFloat(e.target.value))}
                  aria-label={`${band.label} band gain`}
                  className="w-36 h-2 appearance-none bg-slate-800 rounded-lg cursor-pointer outline-none -rotate-90 origin-center accent-cyan-400 group-hover:accent-cyan-300"
                />
              </div>

              {/* Band frequency label */}
              <button
                type="button"
                onClick={() => onChangeBandGain(idx, 0)}
                title="Click to zero this band"
                className="mt-2 text-center text-[10px] font-bold font-mono tracking-tighter text-slate-300 group-hover:text-cyan-400 transition cursor-pointer"
              >
                {band.label}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
