import React, { useEffect, useState } from 'react';
import { X, Mic, Volume2, RefreshCw, Bluetooth, Headphones, Radio, Check } from 'lucide-react';
import { AudioDevice } from '../types';
import { getAudioDevices } from '../audio/AudioEngine';

interface DeviceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInputId: string;
  selectedOutputId: string;
  onSelectInput: (id: string) => void;
  onSelectOutput: (id: string) => void;
}

export const DeviceSelectorModal: React.FC<DeviceSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedInputId,
  selectedOutputId,
  onSelectInput,
  onSelectOutput,
}) => {
  const [devices, setDevices] = useState<{ inputs: AudioDevice[]; outputs: AudioDevice[] }>({
    inputs: [],
    outputs: [],
  });
  const [loading, setLoading] = useState(false);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const devList = await getAudioDevices();
      setDevices(devList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDevices();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="device-selector-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="device-selector-modal"
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Audio Input & Output Routing</h3>
              <p className="text-xs text-slate-400">Select microphone and Bluetooth / speaker destination</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="refresh-devices-btn"
              onClick={loadDevices}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Refresh connected devices"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              id="close-devices-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Microphones section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-cyan-400" />
                Input Microphone
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                {devices.inputs.length} detected
              </span>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() => onSelectInput('')}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition text-xs ${
                  selectedInputId === ''
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Mic className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="font-medium">System Default Microphone</div>
                    <div className="text-[10px] text-slate-500">Auto-routes to active input or headset</div>
                  </div>
                </div>
                {selectedInputId === '' && <Check className="w-4 h-4 text-cyan-400" />}
              </button>

              {devices.inputs.map((inp) => (
                <button
                  key={inp.deviceId}
                  onClick={() => onSelectInput(inp.deviceId)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition text-xs ${
                    selectedInputId === inp.deviceId
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Mic className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{inp.label || `Microphone (${inp.deviceId.slice(0, 8)}...)`}</span>
                  </div>
                  {selectedInputId === inp.deviceId && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Speakers / Bluetooth section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-blue-400" />
                Output Destination (Bluetooth / Speakers)
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                {devices.outputs.length} detected
              </span>
            </div>

            {devices.outputs.length === 0 ? (
              <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl text-xs text-slate-400 space-y-2">
                <p className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Bluetooth className="w-4 h-4 text-blue-400" />
                  System Audio Routing Active
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  On mobile browsers (iOS & Android) and Safari, audio automatically plays out of your connected Bluetooth device (AirPods, Bluetooth speaker, or car audio) when paired in your phone's system settings.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <button
                  onClick={() => onSelectOutput('')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition text-xs ${
                    selectedOutputId === ''
                      ? 'bg-blue-500/15 border-blue-500/40 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-medium">System Default Speaker / Bluetooth</div>
                      <div className="text-[10px] text-slate-500">Uses current OS selected audio output</div>
                    </div>
                  </div>
                  {selectedOutputId === '' && <Check className="w-4 h-4 text-blue-400" />}
                </button>

                {devices.outputs.map((out) => {
                  const isBluetooth = out.label.toLowerCase().includes('bluetooth') || out.label.toLowerCase().includes('wireless') || out.label.toLowerCase().includes('airpods') || out.label.toLowerCase().includes('buds');
                  return (
                    <button
                      key={out.deviceId}
                      onClick={() => onSelectOutput(out.deviceId)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition text-xs ${
                        selectedOutputId === out.deviceId
                          ? 'bg-blue-500/15 border-blue-500/40 text-white'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {isBluetooth ? (
                          <Bluetooth className="w-4 h-4 text-blue-400 shrink-0" />
                        ) : (
                          <Headphones className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="font-medium truncate">{out.label || `Audio Output (${out.deviceId.slice(0, 8)}...)`}</span>
                      </div>
                      {selectedOutputId === out.deviceId && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
