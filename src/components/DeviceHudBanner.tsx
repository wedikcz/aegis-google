import React from 'react';
import { Cpu, ShieldCheck, Activity, Zap, HardDrive, Sparkles } from 'lucide-react';

interface DeviceHudBannerProps {
  compact?: boolean;
}

export const DeviceHudBanner: React.FC<DeviceHudBannerProps> = ({ compact }) => {
  return (
    <div className="border-b border-zinc-800 bg-[#090b10] px-4 py-2.5 text-xs font-mono">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-2 gap-x-4">
        {/* Device & Hardware Profile */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-bold tracking-wider text-zinc-100 uppercase">
              Infinix Hot 50 Pro+ (X6880)
            </span>
          </div>

          <span className="text-zinc-600">/</span>

          <div className="flex items-center gap-1.5 text-zinc-400">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>aarch64 (arm64-v8a)</span>
          </div>

          {!compact && (
            <>
              <span className="text-zinc-600">/</span>
              <div className="hidden sm:flex items-center gap-1.5 text-zinc-400">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>6.78&quot; AMOLED 120Hz</span>
              </div>
            </>
          )}
        </div>

        {/* Security & OS State */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-zinc-300">Android 15 (API 35)</span>
          </div>

          <span className="text-zinc-600">/</span>

          <div className="flex items-center gap-1 text-zinc-400">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-zinc-300">SELinux: Enforcing</span>
          </div>

          {!compact && (
            <>
              <span className="text-zinc-600">/</span>
              <div className="hidden md:flex items-center gap-1 text-zinc-400">
                <HardDrive className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-zinc-400">Room DB: Offline-First</span>
              </div>

              <span className="text-zinc-600">/</span>
              <div className="flex items-center gap-1 text-emerald-400">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">0% Telemetrie</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
