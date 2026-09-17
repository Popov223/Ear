import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenManualGuide?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ onOpenManualGuide }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);

  // If already running in standalone PWA mode, don't show the prompt
  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        App Installed
      </span>
    );
  }

  const handleInstall = async () => {
    if (isInstallable) {
      setInstalling(true);
      try {
        await install();
      } finally {
        setInstalling(false);
      }
    } else if (onOpenManualGuide) {
      onOpenManualGuide();
    }
  };

  return (
    <button
      id="pwa-install-btn"
      onClick={handleInstall}
      disabled={installing}
      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/15 border border-cyan-400/30 transition duration-150 cursor-pointer"
      title={isIOS ? 'Instructions to install on iOS' : 'Install The Live Ear app'}
    >
      <Download className="w-3.5 h-3.5" />
      <span>{isIOS ? 'Install (iOS)' : 'Install App'}</span>
    </button>
  );
};
