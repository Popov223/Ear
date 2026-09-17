import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Monitor, 
  Apple, 
  Bluetooth, 
  Volume2, 
  ShieldAlert, 
  Share, 
  PlusSquare, 
  Download, 
  CheckCircle2, 
  Sliders,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallClick?: () => void;
  isInstallable?: boolean;
  isInIframe?: boolean;
  directUrl?: string;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  onInstallClick,
  isInstallable,
  isInIframe,
  directUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop' | 'manual' | 'bluetooth'>('android');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl = directUrl || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleOpenDirect = () => {
    window.open(appUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      id="install-guide-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="install-guide-modal"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Installation & Bluetooth Guide
              </h2>
              <p className="text-xs text-slate-400">
                Setup The Live Ear as a standalone app on your phone, tablet, or computer
              </p>
            </div>
          </div>
          <button
            id="close-guide-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Frame Alert (Fix for Chrome installing AI Studio instead of app) */}
        <div className="bg-amber-950/40 border-b border-amber-800/40 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">
                Did Chrome install &quot;AI Studio&quot; instead of The Live Ear?
              </p>
              <p className="text-slate-300 mt-0.5">
                Inside the preview editor, Chrome's menu targets <code className="text-amber-200">ai.studio</code>. To install <strong>The Live Ear</strong> itself, open the standalone tab below first!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              id="open-direct-from-modal-btn"
              onClick={handleOpenDirect}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab</span>
            </button>
            <button
              id="copy-direct-from-modal-btn"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition cursor-pointer"
              title="Copy direct web link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1.5 overflow-x-auto text-sm">
          <button
            id="tab-ios-btn"
            onClick={() => setActiveTab('ios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'ios'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iPhone / iPad</span>
          </button>
          <button
            id="tab-android-btn"
            onClick={() => setActiveTab('android')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'android'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android</span>
          </button>
          <button
            id="tab-desktop-btn"
            onClick={() => setActiveTab('desktop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'desktop'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Desktop (Mac / PC)</span>
          </button>
          <button
            id="tab-manual-btn"
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'manual'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Manual / File Install</span>
          </button>
          <button
            id="tab-bluetooth-btn"
            onClick={() => setActiveTab('bluetooth')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'bluetooth'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bluetooth className="w-4 h-4" />
            <span>Bluetooth & Latency</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm">
          {/* iOS Tab */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-blue-950/40 border border-blue-800/40 p-4 rounded-xl">
                <Apple className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white">Quick iOS Safari Installation</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    iOS does not show an automatic prompt, but you can install The Live Ear to your home screen in 2 easy taps:
                  </p>
                </div>
              </div>

              <ol className="space-y-3 pl-1">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-white flex items-center gap-1.5">
                      Open Direct Tab &amp; Tap <Share className="w-4 h-4 text-cyan-400 inline" /> <strong>Share</strong>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ensure you opened The Live Ear in a direct Safari tab (using the button above). Tap the Share icon on Safari's bottom toolbar.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-white flex items-center gap-1.5">
                      Scroll down and tap <PlusSquare className="w-4 h-4 text-cyan-400 inline" /> <strong>Add to Home Screen</strong>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Confirm by tapping <strong>Add</strong> in the top right corner.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      Launch & Connect Bluetooth
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Open <strong>The Live Ear</strong> from your home screen. Connect your AirPods or Bluetooth speaker via iOS Control Center, tap <strong>START LIVE STREAM</strong>, and allow microphone permission.
                    </p>
                  </div>
                </li>
              </ol>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-xs text-slate-300">
                  Running as an installed PWA removes browser bars and unlocks high-priority Web Audio scheduling.
                </p>
              </div>
            </div>
          )}

          {/* Android Tab */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-cyan-950/40 border border-cyan-800/40 p-4 rounded-xl">
                <Smartphone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white">1-Click Android Chrome Installation</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Android supports native 1-click PWA installation right from Chrome or Edge.
                  </p>
                </div>
              </div>

              {isInstallable && onInstallClick && (
                <div className="p-4 bg-slate-800/90 border border-cyan-500/40 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Browser Ready to Install</p>
                    <p className="text-xs text-slate-400">Add icon directly to your app launcher</p>
                  </div>
                  <button
                    onClick={() => {
                      onInstallClick();
                      onClose();
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-cyan-500/20"
                  >
                    <Download className="w-4 h-4" />
                    Install Now
                  </button>
                </div>
              )}

              <ol className="space-y-3 pl-1">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      Open Direct Tab in Chrome
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ensure you are in a direct browser tab (not inside the AI Studio preview iframe). If currently in preview, tap <strong>Open in New Tab</strong> above so Chrome&apos;s address bar shows The Live Ear.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      Tap Chrome Menu (Three Dots ⋮) → Install App
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tap <strong>Install app</strong> (or <strong>Add to Home screen</strong>). The prompt will confirm &ldquo;The Live Ear&rdquo; with its pro-audio microphone icon.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      Connect Bluetooth & Enjoy Low-Latency Stereo
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Pair your Bluetooth speaker or earbuds. In Android Developer Options, select <strong>aptX Adaptive</strong> or <strong>LDAC</strong> for the highest audio quality and lowest wireless delay.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* Desktop Tab */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
                <Monitor className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white">Install on Mac, Windows, or Linux</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Install as a standalone desktop desktop app with zero window chrome or distractions.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-cyan-400 shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Chrome or Microsoft Edge</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Look at the right side of the address/URL bar for the <strong>Install</strong> icon (computer monitor with a down arrow), or click the browser menu (⋮) → <strong>Install The Live Ear...</strong>
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-blue-400 shrink-0">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Select Any Output in App</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Desktop browsers support direct audio output routing! Open the <strong>Devices</strong> menu in The Live Ear to route sound directly to external USB DACs, Bluetooth soundbars, or studio monitors without changing your entire OS default.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manual / File Install Tab */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-amber-950/40 border border-amber-800/40 p-4 rounded-xl">
                <Download className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white">Manual Installation &amp; File Export Options</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    If Chrome&apos;s automated WebAPK installer is blocked on your device or network, here are the 3 reliable methods to install or package the files:
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Method 1: Chrome 'Add to Home screen' Shortcut */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-amber-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs flex items-center justify-center font-bold">1</span>
                      Chrome "Add to Home screen" Shortcut (Instant)
                    </h4>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      No APK Needed
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    When Chrome says "this app cannot be installed", Chrome is attempting to communicate with Google Play Services to generate a server-side WebAPK. If your device has restricted Play Services or offline network policies, tap Chrome&apos;s menu (⋮) and select <strong>"Add to Home screen"</strong> (or tap <strong>Add to Home Screen</strong> instead of Install). This bypasses WebAPK generation and pins the offline-ready web app directly to your home launcher.
                  </p>
                </div>

                {/* Method 2: Export ZIP from AI Studio */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-cyan-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center font-bold">2</span>
                      Download Source Code / Files as ZIP
                    </h4>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      Settings Menu
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    You can download all source files directly from Google AI Studio:
                  </p>
                  <ol className="text-xs text-slate-300 space-y-1 list-decimal pl-5">
                    <li>In the top bar of AI Studio, open the <strong>Settings</strong> or project menu.</li>
                    <li>Select <strong>Export to ZIP</strong> (or <strong>Export to GitHub</strong>).</li>
                    <li>Extract the ZIP on your computer. You now have all HTML, assets, audio engine files, and PWA manifests.</li>
                  </ol>
                </div>

                {/* Method 3: Convert to Native Android APK with Bubblewrap or PWABuilder */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-purple-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-xs flex items-center justify-center font-bold">3</span>
                      Build an Android .APK File (TWA)
                    </h4>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      Standard APK
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    To generate a standalone installable <strong>.apk</strong> file for sideloading onto your phone:
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
                    <li>
                      <strong>Option A (Zero code via PWABuilder)</strong>: Go to <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-mono">pwabuilder.com</a>, enter your shared app URL, and click <strong>Package for Android</strong>. It generates a signed <code className="text-amber-200">.apk</code> file you can download and install directly on Android.
                    </li>
                    <li>
                      <strong>Option B (Official Google CLI - Bubblewrap)</strong>: Run <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">npm i -g @bubblewrap/cli && bubblewrap init --manifest=...</code> using the exported files to generate an Android Studio project and standalone APK with full microphone &amp; Bluetooth audio permissions.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Bluetooth & Latency Tab */}
          {activeTab === 'bluetooth' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-amber-950/30 border border-amber-800/40 p-4 rounded-xl">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white">Preventing Acoustic Feedback Squeals</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    When microphone audio plays directly out of speakers in the same room, sound loops back into the mic creating a loud screeching feedback loop.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800">
                  <h4 className="font-medium text-cyan-400 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4" />
                    How to Avoid Feedback:
                  </h4>
                  <ul className="text-xs text-slate-300 mt-2 space-y-1.5 list-disc pl-4">
                    <li>Use <strong>headphones or earbuds</strong> for personal live monitoring.</li>
                    <li>If using speakers, keep the mic <strong>behind</strong> the speaker cones or in a separate room.</li>
                    <li>Keep the <strong>Safety Limiter</strong> toggle enabled (protects against loud spikes).</li>
                    <li>Start at <strong>0 dB gain</strong> and raise slowly toward +15 dB.</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800">
                  <h4 className="font-medium text-cyan-400 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" />
                    Using the Delay Slider:
                  </h4>
                  <ul className="text-xs text-slate-300 mt-2 space-y-1.5 list-disc pl-4">
                    <li><strong>0 ms</strong>: Real-time immediate feed.</li>
                    <li><strong>50 - 200 ms</strong>: Ideal to synchronize with video broadcast delays or lip-sync.</li>
                    <li><strong>1,000 - 5,000 ms</strong>: Stage rehearsal delay (hear yourself speaking with a delayed echo).</li>
                    <li><strong>Up to 15,000 ms (15s)</strong>: Full buffer delay for radio censorship protection or speech training.</li>
                  </ul>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Uncompressed Stereo Audio Pipeline
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  The Live Ear disables standard telephone compression filters (no automatic ducking, no low-bitrate voice codecs). When plugged into stereo mics or audio interfaces, you get true 48kHz uncompressed stereo. Use the <strong>Mono switch</strong> when using single-channel lavalier microphones so sound plays equally in both ears.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Bluetooth className="w-4 h-4 text-cyan-400" />
            <span>The Live Ear • Professional Realtime Monitor</span>
          </div>
          <button
            id="modal-got-it-btn"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
