import React, { useState, useEffect } from 'react';
import { ShieldAlert, Smartphone, Monitor, Download, Radio } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  viewportMode: 'mobile' | 'desktop';
  setViewportMode: (mode: 'mobile' | 'desktop') => void;
  onOpenAndroidExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewportMode,
  setViewportMode,
  onOpenAndroidExport,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('cs-CZ', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-[#06070a]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Tactical Identifier */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded border border-emerald-500/40 bg-emerald-950/30 text-emerald-400 shadow-sm shadow-emerald-950/50">
            <ShieldAlert className="h-5 w-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black tracking-wider text-zinc-100 uppercase">
                AEGIS MOBILE
              </span>
              <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-widest text-emerald-400 border border-emerald-500/30 px-1 py-0.2 rounded bg-emerald-950/40">
                SOC POCKET v1.0
              </span>
            </div>
            <p className="font-mono text-[11px] text-zinc-400">
              Android 15 Defensive Security Platform
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tactical Clock */}
          <div className="hidden lg:flex items-center gap-2 border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 rounded text-xs font-mono text-zinc-300">
            <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
            <span className="text-zinc-500">SYS_TIME:</span>
            <span className="text-emerald-400 font-semibold">{currentTime} UTC</span>
          </div>

          {/* Viewport Frame Switcher */}
          <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/70 p-0.5">
            <button
              onClick={() => setViewportMode('desktop')}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-mono font-medium transition-colors ${
                viewportMode === 'desktop'
                  ? 'bg-zinc-800 text-zinc-100 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Režim celé obrazovky (SOC Dual-Pane)"
            >
              <Monitor className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-mono font-medium transition-colors ${
                viewportMode === 'mobile'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="6.78&quot; AMOLED Infinix Hot 50 Pro+ simulátor"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Infinix HUD</span>
            </button>
          </div>

          {/* Android Studio Project & Release APK Export */}
          <button
            onClick={onOpenAndroidExport}
            className="flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-mono font-semibold text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export Android Projekt</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};
