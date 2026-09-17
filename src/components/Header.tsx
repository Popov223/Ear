import React from 'react';
import { 
  Radio, 
  Download, 
  HelpCircle, 
  Settings2, 
  Bluetooth, 
  Headphones, 
  Volume2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  isActive: boolean;
  isMono: boolean;
  sampleRate: number;
  isInIframe?: boolean;
  onOpenGuide: () => void;
  onOpenDevices: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isActive,
  isMono,
  sampleRate,
  isInIframe,
  onOpenGuide,
  onOpenDevices,
}) => {
  return (
    <header 
      id="app-header"
      className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <Radio className="w-5 h-5 text-white" />
            </div>
            {isActive && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 border border-slate-900" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2 font-mono">
                THE LIVE EAR
              </h1>
              <span className="hidden sm:inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                PRO AUDIO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time Live Mic Stream to Bluetooth & Speakers • Uncompressed Stereo
            </p>
          </div>
        </div>

        {/* Live Audio Telemetry Badge */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'
              }`}
            />
            <span className="text-slate-300 font-semibold">
              {isActive ? 'STREAMING' : 'STANDBY'}
            </span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-cyan-400 font-bold">
            {isMono ? 'MONO' : 'STEREO'}
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400">{(sampleRate / 1000).toFixed(0)}kHz RAW</span>
        </div>

        {/* Actions Navigation */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Open in Dedicated Tab button (vital for mobile PWA install when in iframe) */}
          {isInIframe && (
            <button
              id="open-direct-tab-header-btn"
              onClick={() => window.open(window.location.href, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-xs font-semibold transition cursor-pointer"
              title="Open The Live Ear in dedicated browser tab to install directly"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in Tab</span>
            </button>
          )}

          {/* Audio Devices button */}
          <button
            id="devices-header-btn"
            onClick={onOpenDevices}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition cursor-pointer"
            title="Audio Input & Bluetooth Routing"
          >
            <Bluetooth className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Devices</span>
          </button>

          {/* Installation Guide button */}
          <button
            id="install-guide-header-btn"
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition cursor-pointer"
            title="Instructions on how to install The Live Ear"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>How to Install</span>
          </button>

          {/* In-App PWA Install Button */}
          <PWAInstallButton onOpenManualGuide={onOpenGuide} />
        </div>
      </div>
    </header>
  );
};
