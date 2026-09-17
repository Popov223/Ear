import { DEFAULT_EQ_FREQUENCIES, AudioSettings, AudioDevice } from '../types';

export class LiveAudioEngine {
  private ctx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  
  // Routing nodes
  private inputChannelSplitter: ChannelSplitterNode | null = null;
  private monoSumGainL: GainNode | null = null;
  private monoSumGainR: GainNode | null = null;
  private channelMerger: ChannelMergerNode | null = null;
  private stereoPassThroughL: GainNode | null = null;
  private stereoPassThroughR: GainNode | null = null;

  // Processing nodes
  private eqFilters: BiquadFilterNode[] = [];
  private delayNode: DelayNode | null = null;
  private gainNode: GainNode | null = null;
  private safetyLimiterNode: DynamicsCompressorNode | null = null;
  private bypassLimiterGain: GainNode | null = null;
  private activeLimiterGain: GainNode | null = null;

  // Analyser nodes
  private analyserL: AnalyserNode | null = null;
  private analyserR: AnalyserNode | null = null;
  private outputSplitter: ChannelSplitterNode | null = null;

  // Destination & Audio Element for Sink routing
  private streamDestination: MediaStreamAudioDestinationNode | null = null;
  private sinkAudioElement: HTMLAudioElement | null = null;

  private isRunning = false;
  private currentSettings: AudioSettings;
  private onStateChangeCallback?: (running: boolean, error?: string) => void;

  constructor(initialSettings: AudioSettings) {
    this.currentSettings = { ...initialSettings };
  }

  public setOnStateChange(cb: (running: boolean, error?: string) => void) {
    this.onStateChangeCallback = cb;
  }

  public async start(): Promise<boolean> {
    try {
      if (this.isRunning) return true;

      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass({
        latencyHint: 'interactive',
        sampleRate: 48000,
      });

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      // Prepare constraints for uncompressed stereo audio
      const audioConstraints: MediaTrackConstraints & { latency?: unknown } = {
        channelCount: this.currentSettings.isMono ? { ideal: 1 } : { ideal: 2 },
        echoCancellation: !this.currentSettings.uncompressed,
        noiseSuppression: !this.currentSettings.uncompressed,
        autoGainControl: !this.currentSettings.uncompressed,
        sampleRate: { ideal: 48000 },
        latency: { ideal: 0 },
      };

      if (this.currentSettings.selectedInputId) {
        audioConstraints.deviceId = { exact: this.currentSettings.selectedInputId };
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        video: false,
      });

      this.sourceNode = this.ctx.createMediaStreamSource(this.mediaStream);

      // Create 12-band EQ chain
      this.eqFilters = DEFAULT_EQ_FREQUENCIES.map((band, idx) => {
        const filter = this.ctx!.createBiquadFilter();
        filter.type = band.type;
        filter.frequency.value = band.freq;
        filter.gain.value = this.currentSettings.eqGains[idx] ?? 0;
        if (band.type === 'peaking') {
          filter.Q.value = 1.414; // Standard 1-octave Q
        }
        return filter;
      });

      // Chain EQ filters
      for (let i = 0; i < this.eqFilters.length - 1; i++) {
        this.eqFilters[i].connect(this.eqFilters[i + 1]);
      }

      // Create Delay Node (up to 16 seconds to safely support 15,000 ms)
      this.delayNode = this.ctx.createDelay(16.0);
      const delaySeconds = Math.max(0, Math.min(15.0, this.currentSettings.delayMs / 1000));
      this.delayNode.delayTime.setValueAtTime(delaySeconds, this.ctx.currentTime);

      // Create Master Gain Node (0dB to +15dB)
      this.gainNode = this.ctx.createGain();
      const linearGain = Math.pow(10, this.currentSettings.gainDb / 20);
      this.gainNode.gain.setValueAtTime(linearGain, this.ctx.currentTime);

      // Limiter / Safety compressor (brickwall safety to prevent speaker burst or severe feedback)
      this.safetyLimiterNode = this.ctx.createDynamicsCompressor();
      this.safetyLimiterNode.threshold.value = -1.0;
      this.safetyLimiterNode.knee.value = 2.0;
      this.safetyLimiterNode.ratio.value = 20.0;
      this.safetyLimiterNode.attack.value = 0.001;
      this.safetyLimiterNode.release.value = 0.05;

      this.activeLimiterGain = this.ctx.createGain();
      this.bypassLimiterGain = this.ctx.createGain();

      const useLimiter = this.currentSettings.safetyLimiter;
      this.activeLimiterGain.gain.setValueAtTime(useLimiter ? 1.0 : 0.0, this.ctx.currentTime);
      this.bypassLimiterGain.gain.setValueAtTime(useLimiter ? 0.0 : 1.0, this.ctx.currentTime);

      // Stereo vs Mono routing matrix
      this.inputChannelSplitter = this.ctx.createChannelSplitter(2);
      this.channelMerger = this.ctx.createChannelMerger(2);

      this.stereoPassThroughL = this.ctx.createGain();
      this.stereoPassThroughR = this.ctx.createGain();
      this.monoSumGainL = this.ctx.createGain();
      this.monoSumGainR = this.ctx.createGain();

      this.sourceNode.connect(this.inputChannelSplitter);

      // Stereo path: L to merger 0, R to merger 1
      this.inputChannelSplitter.connect(this.stereoPassThroughL, 0);
      this.inputChannelSplitter.connect(this.stereoPassThroughR, 1);
      this.stereoPassThroughL.connect(this.channelMerger, 0, 0);
      this.stereoPassThroughR.connect(this.channelMerger, 0, 1);

      // Mono path: sum (L + R) * 0.5 to both output channels 0 and 1
      this.inputChannelSplitter.connect(this.monoSumGainL, 0);
      this.inputChannelSplitter.connect(this.monoSumGainL, 1);
      this.monoSumGainL.gain.value = 0.5;

      this.monoSumGainL.connect(this.channelMerger, 0, 0);
      this.monoSumGainL.connect(this.channelMerger, 0, 1);

      this.updateMonoRouting(this.currentSettings.isMono);

      // Connect channelMerger -> EQ Head
      this.channelMerger.connect(this.eqFilters[0]);

      // Connect EQ Tail -> DelayNode
      const eqTail = this.eqFilters[this.eqFilters.length - 1];
      eqTail.connect(this.delayNode);

      // Connect DelayNode -> GainNode
      this.delayNode.connect(this.gainNode);

      // GainNode splits into Limiter and Bypass
      this.gainNode.connect(this.safetyLimiterNode);
      this.safetyLimiterNode.connect(this.activeLimiterGain);
      this.gainNode.connect(this.bypassLimiterGain);

      // Output bus summing limiter & bypass
      const outputBus = this.ctx.createGain();
      outputBus.gain.value = 1.0;
      this.activeLimiterGain.connect(outputBus);
      this.bypassLimiterGain.connect(outputBus);

      // Analyser setup (Left and Right)
      this.outputSplitter = this.ctx.createChannelSplitter(2);
      this.analyserL = this.ctx.createAnalyser();
      this.analyserR = this.ctx.createAnalyser();
      this.analyserL.fftSize = 1024;
      this.analyserR.fftSize = 1024;
      this.analyserL.smoothingTimeConstant = 0.8;
      this.analyserR.smoothingTimeConstant = 0.8;

      outputBus.connect(this.outputSplitter);
      this.outputSplitter.connect(this.analyserL, 0);
      this.outputSplitter.connect(this.analyserR, 1);

      // Connect to output destination
      // Setup audio element for sink routing if supported
      this.streamDestination = this.ctx.createMediaStreamDestination();
      outputBus.connect(this.streamDestination);
      outputBus.connect(this.ctx.destination);

      await this.applyOutputDevice(this.currentSettings.selectedOutputId);

      this.isRunning = true;
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(true);
      }
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Failed to start Live Audio Engine:', err);
      this.stop();
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(false, msg);
      }
      return false;
    }
  }

  private updateMonoRouting(isMono: boolean) {
    if (!this.stereoPassThroughL || !this.stereoPassThroughR || !this.monoSumGainL) return;
    if (isMono) {
      // Mono active: mute direct stereo, enable mono sum
      this.stereoPassThroughL.gain.value = 0.0;
      this.stereoPassThroughR.gain.value = 0.0;
      this.monoSumGainL.gain.value = 0.5;
    } else {
      // Stereo active: enable direct stereo, mute mono sum
      this.stereoPassThroughL.gain.value = 1.0;
      this.stereoPassThroughR.gain.value = 1.0;
      this.monoSumGainL.gain.value = 0.0;
    }
  }

  public setGain(gainDb: number) {
    this.currentSettings.gainDb = Math.max(0, Math.min(15, gainDb));
    if (this.gainNode && this.ctx) {
      const linear = Math.pow(10, this.currentSettings.gainDb / 20);
      this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gainNode.gain.setTargetAtTime(linear, this.ctx.currentTime, 0.015);
    }
  }

  public setDelay(delayMs: number) {
    this.currentSettings.delayMs = Math.max(0, Math.min(15000, delayMs));
    if (this.delayNode && this.ctx) {
      const seconds = this.currentSettings.delayMs / 1000;
      this.delayNode.delayTime.cancelScheduledValues(this.ctx.currentTime);
      this.delayNode.delayTime.setTargetAtTime(seconds, this.ctx.currentTime, 0.02);
    }
  }

  public setMono(isMono: boolean) {
    this.currentSettings.isMono = isMono;
    this.updateMonoRouting(isMono);
  }

  public setSafetyLimiter(enabled: boolean) {
    this.currentSettings.safetyLimiter = enabled;
    if (this.activeLimiterGain && this.bypassLimiterGain && this.ctx) {
      this.activeLimiterGain.gain.setTargetAtTime(enabled ? 1.0 : 0.0, this.ctx.currentTime, 0.01);
      this.bypassLimiterGain.gain.setTargetAtTime(enabled ? 0.0 : 1.0, this.ctx.currentTime, 0.01);
    }
  }

  public setEqGain(bandIndex: number, gainDb: number) {
    if (this.eqFilters[bandIndex] && this.ctx) {
      const clampedGain = Math.max(-12, Math.min(12, gainDb));
      this.currentSettings.eqGains[bandIndex] = clampedGain;
      this.eqFilters[bandIndex].gain.cancelScheduledValues(this.ctx.currentTime);
      this.eqFilters[bandIndex].gain.setTargetAtTime(clampedGain, this.ctx.currentTime, 0.015);
    }
  }

  public setAllEqGains(gains: number[]) {
    gains.forEach((gain, idx) => {
      this.setEqGain(idx, gain);
    });
  }

  public async setInputDevice(deviceId: string) {
    this.currentSettings.selectedInputId = deviceId;
    if (this.isRunning) {
      // Re-start to bind to new input stream cleanly
      await this.stop();
      await this.start();
    }
  }

  public async setOutputDevice(deviceId: string) {
    this.currentSettings.selectedOutputId = deviceId;
    await this.applyOutputDevice(deviceId);
  }

  private async applyOutputDevice(deviceId: string) {
    try {
      // Modern AudioContext.setSinkId support (Chrome 110+)
      if (this.ctx && 'setSinkId' in this.ctx && typeof (this.ctx as any).setSinkId === 'function') {
        await (this.ctx as any).setSinkId(deviceId || '');
      } else if (this.streamDestination) {
        // Fallback using HTMLAudioElement with setSinkId
        if (!this.sinkAudioElement) {
          this.sinkAudioElement = new Audio();
          this.sinkAudioElement.autoplay = true;
        }
        this.sinkAudioElement.srcObject = this.streamDestination.stream;
        if ('setSinkId' in this.sinkAudioElement && typeof (this.sinkAudioElement as any).setSinkId === 'function') {
          await (this.sinkAudioElement as any).setSinkId(deviceId || '');
        }
      }
    } catch (e) {
      console.warn('Audio output sink routing not fully supported on this platform:', e);
    }
  }

  public async setUncompressed(uncompressed: boolean) {
    this.currentSettings.uncompressed = uncompressed;
    if (this.isRunning) {
      await this.stop();
      await this.start();
    }
  }

  public getLevels(): { levelL: number; levelR: number; peakL: number; peakR: number; isClipping: boolean } {
    if (!this.analyserL || !this.analyserR) {
      return { levelL: 0, levelR: 0, peakL: 0, peakR: 0, isClipping: false };
    }

    const bufferL = new Float32Array(this.analyserL.fftSize);
    const bufferR = new Float32Array(this.analyserR.fftSize);

    this.analyserL.getFloatTimeDomainData(bufferL);
    this.analyserR.getFloatTimeDomainData(bufferR);

    let sumSquaresL = 0;
    let sumSquaresR = 0;
    let peakL = 0;
    let peakR = 0;

    for (let i = 0; i < bufferL.length; i++) {
      const valL = bufferL[i];
      const valR = bufferR[i];
      sumSquaresL += valL * valL;
      sumSquaresR += valR * valR;
      const absL = Math.abs(valL);
      const absR = Math.abs(valR);
      if (absL > peakL) peakL = absL;
      if (absR > peakR) peakR = absR;
    }

    const rmsL = Math.sqrt(sumSquaresL / bufferL.length);
    const rmsR = Math.sqrt(sumSquaresR / bufferR.length);

    return {
      levelL: Math.min(1.0, rmsL * 2.8),
      levelR: Math.min(1.0, rmsR * 2.8),
      peakL: Math.min(1.2, peakL),
      peakR: Math.min(1.2, peakR),
      isClipping: peakL >= 0.99 || peakR >= 0.99,
    };
  }

  public getWaveformData(): { waveL: Uint8Array; waveR: Uint8Array; freqL: Uint8Array } | null {
    if (!this.analyserL || !this.analyserR) return null;

    const waveL = new Uint8Array(this.analyserL.frequencyBinCount);
    const waveR = new Uint8Array(this.analyserR.frequencyBinCount);
    const freqL = new Uint8Array(this.analyserL.frequencyBinCount);

    this.analyserL.getByteTimeDomainData(waveL);
    this.analyserR.getByteTimeDomainData(waveR);
    this.analyserL.getByteFrequencyData(freqL);

    return { waveL, waveR, freqL };
  }

  public getSampleRate(): number {
    return this.ctx ? this.ctx.sampleRate : 48000;
  }

  public getContextState(): AudioContextState | 'closed' {
    return this.ctx ? this.ctx.state : 'closed';
  }

  public async resumeContext(): Promise<void> {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.sinkAudioElement) {
      this.sinkAudioElement.pause();
      this.sinkAudioElement.srcObject = null;
    }
    if (this.ctx) {
      try {
        await this.ctx.close();
      } catch {
        // ignore
      }
      this.ctx = null;
    }
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(false);
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }
}

// Utility to list available audio input and output devices
export async function getAudioDevices(): Promise<{ inputs: AudioDevice[]; outputs: AudioDevice[] }> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return { inputs: [], outputs: [] };
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    const inputs: AudioDevice[] = [];
    const outputs: AudioDevice[] = [];

    devices.forEach((dev, idx) => {
      if (dev.kind === 'audioinput') {
        inputs.push({
          deviceId: dev.deviceId,
          label: dev.label || `Microphone ${inputs.length + 1}`,
          kind: 'audioinput',
        });
      } else if (dev.kind === 'audiooutput') {
        outputs.push({
          deviceId: dev.deviceId,
          label: dev.label || `Speaker / Bluetooth ${outputs.length + 1}`,
          kind: 'audiooutput',
        });
      }
    });

    return { inputs, outputs };
  } catch (err) {
    console.error('Failed to enumerate audio devices:', err);
    return { inputs: [], outputs: [] };
  }
}
