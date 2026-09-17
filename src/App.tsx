import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ShieldAlert, 
  Bluetooth, 
  HelpCircle, 
  Volume2, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  Headphones,
  Sliders,
  Radio,
  ExternalLink
} from 'lucide-react';
import { AudioSettings } from './types';
import { LiveAudioEngine } from './audio/AudioEngine';
import { Header } from './components/Header';
import { MainControlPanel } from './components/MainControlPanel';
import { Equalizer12Band } from './components/Equalizer12Band';
import { Visualizer } from './components/Visualizer';
import { InstallGuideModal } from './components/InstallGuideModal';
import { DeviceSelectorModal } from './components/DeviceSelectorModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PreviewInstallBanner } from './components/PreviewInstallBanner';
import { usePWAInstall } from './hooks/usePWAInstall';

const INITIAL_SETTINGS: AudioSettings = {
  gainDb: 0, // 0 dB to +15 dB
  delayMs: 0, // 0 ms to 15,000 ms
  isMono: false, // stereo uncompressed by default
  uncompressed: true, // raw 48kHz without browser voice gating/ducking
  safetyLimiter: true, // ear protection limiter against feedback
  eqGains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 12-band flat
  selectedInputId: '',
  selectedOutputId: '',
};

export default function App() {
  const [settings, setSettings] = useState<AudioSettings>(() => {
    try {
      const saved = localStorage.getItem('the_live_ear_settings');
      if (saved) {
        return { ...INITIAL_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_SETTINGS;
  });

  const [isActive, setIsActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showFeedbackNotice, setShowFeedbackNotice] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isDevicesOpen, setIsDevicesOpen] = useState(false);
  const [sampleRate, setSampleRate] = useState(48000);

  const engineRef = useRef<LiveAudioEngine | null>(null);
  const { isInstallable, isInIframe, directUrl, install } = usePWAInstall();

  // Initialize engine once
  useEffect(() => {
    const engine = new LiveAudioEngine(settings);
    engineRef.current = engine;

    engine.setOnStateChange((running, error) => {
      setIsActive(running);
      if (error) {
        setErrorMessage(error);
      } else {
        setErrorMessage(null);
        setSampleRate(engine.getSampleRate());
      }
    });

    return () => {
      engine.stop();
    };
  }, []);

  // Save settings on update
  useEffect(() => {
    try {
      localStorage.setItem('the_live_ear_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Handle Master Stream Toggle
  const handleToggleActive = async () => {
    const engine = engineRef.current;
    if (!engine) return;

    if (isActive) {
      await engine.stop();
    } else {
      setErrorMessage(null);
      const success = await engine.start();
      if (!success) {
        // start will trigger callback with error
      }
    }
  };

  // Gain Update (0 dB to +15 dB)
  const handleUpdateGain = useCallback((gainDb: number) => {
    const clamped = Math.max(0, Math.min(15, gainDb));
    setSettings((prev) => ({ ...prev, gainDb: clamped }));
    engineRef.current?.setGain(clamped);
  }, []);

  // Delay Update (0 ms to 15,000 ms)
  const handleUpdateDelay = useCallback((delayMs: number) => {
    const clamped = Math.max(0, Math.min(15000, delayMs));
    setSettings((prev) => ({ ...prev, delayMs: clamped }));
    engineRef.current?.setDelay(clamped);
  }, []);

  // Mono Switch Toggle
  const handleToggleMono = useCallback(() => {
    setSettings((prev) => {
      const nextMono = !prev.isMono;
      engineRef.current?.setMono(nextMono);
      return { ...prev, isMono: nextMono };
    });
  }, []);

  // Uncompressed Toggle
  const handleToggleUncompressed = useCallback(async () => {
    const nextVal = !settings.uncompressed;
    setSettings((prev) => ({ ...prev, uncompressed: nextVal }));
    await engineRef.current?.setUncompressed(nextVal);
  }, [settings.uncompressed]);

  // Safety Limiter Toggle
  const handleToggleSafetyLimiter = useCallback(() => {
    setSettings((prev) => {
      const nextVal = !prev.safetyLimiter;
      engineRef.current?.setSafetyLimiter(nextVal);
      return { ...prev, safetyLimiter: nextVal };
    });
  }, []);

  // 12-Band EQ Gain Change
  const handleChangeBandGain = useCallback((index: number, gainDb: number) => {
    setSettings((prev) => {
      const newEq = [...prev.eqGains];
      newEq[index] = gainDb;
      engineRef.current?.setEqGain(index, gainDb);
      return { ...prev, eqGains: newEq };
    });
  }, []);

  // Reset EQ Flat
  const handleResetFlat = useCallback(() => {
    const flatGains = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    setSettings((prev) => ({ ...prev, eqGains: flatGains }));
    engineRef.current?.setAllEqGains(flatGains);
  }, []);

  // Apply Preset
  const handleApplyPreset = useCallback((presetGains: number[]) => {
    setSettings((prev) => ({ ...prev, eqGains: presetGains }));
    engineRef.current?.setAllEqGains(presetGains);
  }, []);

  // Input device selection
  const handleSelectInput = useCallback(async (deviceId: string) => {
    setSettings((prev) => ({ ...prev, selectedInputId: deviceId }));
    await engineRef.current?.setInputDevice(deviceId);
  }, []);

  // Output device selection
  const handleSelectOutput = useCallback(async (deviceId: string) => {
    setSettings((prev) => ({ ...prev, selectedOutputId: deviceId }));
    await engineRef.current?.setOutputDevice(deviceId);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Header */}
      <Header
        isActive={isActive}
        isMono={settings.isMono}
        sampleRate={sampleRate}
        isInIframe={isInIframe}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenDevices={() => setIsDevicesOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Preview Frame Mobile Install Banner */}
        {isInIframe && (
          <PreviewInstallBanner
            directUrl={directUrl}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        )}

        {/* Error Alert if permission denied or error occurs */}
        {errorMessage && (
          <div
            id="error-alert-banner"
            className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800/80 flex items-start justify-between gap-3 text-rose-200 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-white">Microphone Access Notice</h4>
                <p className="text-xs text-rose-300 mt-1 leading-relaxed">
                  {errorMessage.includes('Permission') || errorMessage.includes('denied')
                    ? 'Microphone permission was denied. Please allow microphone access in your browser address bar or device settings to stream live audio.'
                    : errorMessage}
                </p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold px-2.5 py-1 bg-rose-900/60 hover:bg-rose-900 rounded-lg text-white transition"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Acoustic Feedback & Bluetooth Warning Banner (Dismissible) */}
        {showFeedbackNotice && (
          <div
            id="feedback-tip-banner"
            className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-slate-900/60 border border-cyan-800/40 flex flex-wrap items-center justify-between gap-3 shadow-md backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-200">
                  <strong className="text-cyan-300">Feedback Protection Tip:</strong> Use <strong>Bluetooth headphones/earbuds</strong> or keep physical distance from speakers to prevent acoustic feedback loops.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  The built-in Safety Limiter is enabled to guard against sudden high-volume screech spikes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsGuideOpen(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-4 cursor-pointer"
              >
                View Install & Setup Guide
              </button>
              <button
                onClick={() => setShowFeedbackNotice(false)}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 hover:bg-slate-800 rounded-lg transition ml-2"
                aria-label="Dismiss banner"
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {/* Main Audio Engine & Slider Controls */}
        <MainControlPanel
          isActive={isActive}
          settings={settings}
          onToggleActive={handleToggleActive}
          onUpdateGain={handleUpdateGain}
          onUpdateDelay={handleUpdateDelay}
          onToggleMono={handleToggleMono}
          onToggleUncompressed={handleToggleUncompressed}
          onToggleSafetyLimiter={handleToggleSafetyLimiter}
          onOpenDevicesModal={() => setIsDevicesOpen(true)}
        />

        {/* Real-Time Visualizer (Oscilloscope + Stereo VU Meters) */}
        <Visualizer
          engine={engineRef.current}
          isActive={isActive}
          isMono={settings.isMono}
        />

        {/* 12-Band Equalizer (32Hz to 20kHz) */}
        <Equalizer12Band
          eqGains={settings.eqGains}
          onChangeBandGain={handleChangeBandGain}
          onResetFlat={handleResetFlat}
          onApplyPreset={handleApplyPreset}
        />

        {/* Features & Quick Guide Footer Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-1.5 font-mono">
              <Radio className="w-4 h-4" />
              Uncompressed Stereo Stream
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Streams raw 48kHz audio directly from the microphone to your Bluetooth headset or sound system without telemetry loss, telecommunication speech downsampling, or auto-ducking.
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 mb-1.5 font-mono">
              <Sliders className="w-4 h-4" />
              Gain + 12-Band Tone Sculpting
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Boost weak microphone signals up to +15 dB with mathematical precision. Use the 12-band graphic EQ to eliminate room rumble, enhance vocal presence, or notch out ringing frequencies.
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-1.5 font-mono">
              <HelpCircle className="w-4 h-4" />
              0ms to 15,000ms Delay Buffer
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adjust latency with sample-level precision: 0ms for instant stage monitoring, 50-200ms to compensate for video lip-sync lag, or up to 15 seconds for auditory delayed feedback rehearsal.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 px-4 sm:px-8 bg-slate-950 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <span className="font-mono font-bold text-slate-300">The Live Ear</span>
          <span>•</span>
          <span>Ultra Low-Latency Live Audio Pipeline</span>
        </div>

        <div className="flex items-center gap-4 mx-auto sm:mx-0 text-slate-400">
          <button
            onClick={() => setIsGuideOpen(true)}
            className="hover:text-cyan-400 transition cursor-pointer"
          >
            How to Install
          </button>
          <span>•</span>
          <button
            onClick={() => setIsDevicesOpen(true)}
            className="hover:text-cyan-400 transition cursor-pointer"
          >
            Audio Routing
          </button>
        </div>
      </footer>

      {/* Modals & Offline Indicator */}
      <InstallGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onInstallClick={install}
        isInstallable={isInstallable}
        isInIframe={isInIframe}
        directUrl={directUrl}
      />

      <DeviceSelectorModal
        isOpen={isDevicesOpen}
        onClose={() => setIsDevicesOpen(false)}
        selectedInputId={settings.selectedInputId}
        selectedOutputId={settings.selectedOutputId}
        onSelectInput={handleSelectInput}
        onSelectOutput={handleSelectOutput}
      />

      <OfflineIndicator />
    </div>
  );
}
