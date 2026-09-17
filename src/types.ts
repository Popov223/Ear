export interface EQBand {
  frequency: number;
  label: string;
  type: BiquadFilterType;
  gain: number; // in dB, -12 to +12
}

export const DEFAULT_EQ_FREQUENCIES: { freq: number; label: string; type: BiquadFilterType }[] = [
  { freq: 32, label: '32Hz', type: 'lowshelf' },
  { freq: 64, label: '64Hz', type: 'peaking' },
  { freq: 125, label: '125Hz', type: 'peaking' },
  { freq: 250, label: '250Hz', type: 'peaking' },
  { freq: 500, label: '500Hz', type: 'peaking' },
  { freq: 1000, label: '1kHz', type: 'peaking' },
  { freq: 2000, label: '2kHz', type: 'peaking' },
  { freq: 4000, label: '4kHz', type: 'peaking' },
  { freq: 8000, label: '8kHz', type: 'peaking' },
  { freq: 12000, label: '12kHz', type: 'peaking' },
  { freq: 16000, label: '16kHz', type: 'peaking' },
  { freq: 20000, label: '20kHz', type: 'highshelf' },
];

export interface AudioSettings {
  gainDb: number; // 0 dB to +15 dB
  delayMs: number; // 0 ms to 15,000 ms
  isMono: boolean;
  uncompressed: boolean; // disable echoCancellation, noiseSuppression, autoGainControl
  safetyLimiter: boolean; // protective limiter against deafening feedback loops
  eqGains: number[]; // 12 numbers in dB
  selectedInputId: string;
  selectedOutputId: string;
}

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
}

export interface AudioMeterState {
  levelL: number; // 0 to 1
  levelR: number; // 0 to 1
  peakL: number;
  peakR: number;
  isClipping: boolean;
}
