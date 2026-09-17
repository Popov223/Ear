import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Smartphone, X } from 'lucide-react';

interface PreviewInstallBannerProps {
  directUrl?: string;
  onOpenGuide: () => void;
}

export const PreviewInstallBanner: React.FC<PreviewInstallBannerProps> = ({
  directUrl,
  onOpenGuide,
}) => {
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const url = directUrl || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleOpenDirect = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="preview-install-banner"
      className="bg-gradient-to-r from-amber-500/15 via-cyan-500/10 to-blue-500/15 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 shadow-lg backdrop-blur-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 mt-0.5">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-amber-300">
                Installing on Mobile? (Avoid Installing AI Studio)
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30 font-semibold">
                Important
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              When viewing inside the preview editor, your phone's 3-dot menu installs <em>Google AI Studio</em> instead of this app. Open The Live Ear directly in its own tab, then tap Chrome's 3 dots (⋮) &gt; <strong>Install app</strong>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0 self-end sm:self-center">
          <button
            id="open-direct-tab-banner-btn"
            onClick={handleOpenDirect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in New Tab</span>
          </button>

          <button
            id="copy-direct-url-banner-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
            title="Copy standalone app URL"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenGuide}
            className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2 px-1"
          >
            Guide
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition"
            aria-label="Dismiss banner"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
