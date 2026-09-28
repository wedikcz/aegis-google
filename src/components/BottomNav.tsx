import React from 'react';
import {
  LayoutDashboard,
  Grid3X3,
  Flame,
  Binary,
  GraduationCap,
  Settings,
  Bot,
} from 'lucide-react';

export type MainTab =
  | 'dashboard'
  | 'attack'
  | 'operations'
  | 'scanner'
  | 'copilot'
  | 'lab'
  | 'settings';

export type OperationsSubTab = 'cases' | 'playbooks' | 'coverage' | 'intel';

interface BottomNavProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  operationsSubTab: OperationsSubTab;
  setOperationsSubTab: (subTab: OperationsSubTab) => void;
  activeCaseCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  operationsSubTab,
  setOperationsSubTab,
  activeCaseCount,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-[#06070a]/95 backdrop-blur-md">
      {/* Sub-navigation bar when on Operations tab */}
      {activeTab === 'operations' && (
        <div className="flex items-center justify-center gap-1 border-b border-zinc-800/80 bg-zinc-950/80 px-2 py-1.5 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => setOperationsSubTab('cases')}
            className={`flex items-center gap-1.5 rounded px-3 py-1 transition-colors ${
              operationsSubTab === 'cases'
                ? 'bg-zinc-800 text-emerald-400 font-semibold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Cases</span>
            {activeCaseCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500/20 px-1 text-[10px] text-red-400 font-bold border border-red-500/30">
                {activeCaseCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setOperationsSubTab('playbooks')}
            className={`rounded px-3 py-1 transition-colors ${
              operationsSubTab === 'playbooks'
                ? 'bg-zinc-800 text-emerald-400 font-semibold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Playbooks
          </button>
          <button
            onClick={() => setOperationsSubTab('coverage')}
            className={`rounded px-3 py-1 transition-colors ${
              operationsSubTab === 'coverage'
                ? 'bg-zinc-800 text-emerald-400 font-semibold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Coverage Testy
          </button>
          <button
            onClick={() => setOperationsSubTab('intel')}
            className={`rounded px-3 py-1 transition-colors ${
              operationsSubTab === 'intel'
                ? 'bg-zinc-800 text-emerald-400 font-semibold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Threat Intel
          </button>
        </div>
      )}

      {/* Main navigation row */}
      <nav className="mx-auto flex h-16 max-w-xl items-center justify-around px-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 px-2.5 py-1 text-[11px] font-mono transition-colors ${
            activeTab === 'dashboard'
              ? 'text-emerald-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('attack')}
          className={`flex flex-col items-center justify-center gap-1 px-2.5 py-1 text-[11px] font-mono transition-colors ${
            activeTab === 'attack'
              ? 'text-emerald-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Grid3X3 className="h-5 w-5" />
          <span>ATT&CK</span>
        </button>

        <button
          onClick={() => setActiveTab('operations')}
          className={`relative flex flex-col items-center justify-center gap-1 px-2.5 py-1 text-[11px] font-mono transition-colors ${
            activeTab === 'operations'
              ? 'text-emerald-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Flame className="h-5 w-5" />
          <span>Operace</span>
          {activeCaseCount > 0 && (
            <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex flex-col items-center justify-center gap-1 px-2.5 py-1 text-[11px] font-mono transition-colors ${
            activeTab === 'scanner'
              ? 'text-emerald-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Binary className="h-5 w-5" />
          <span>Skener</span>
        </button>

        <button
          onClick={() => setActiveTab('copilot')}
          className={`flex flex-col items-center justify-center gap-1 px-2.5 py-1 text-[11px] font-mono transition-colors ${
            activeTab === 'copilot'
              ? 'text-cyan-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Bot className="h-5 w-5" />
          <span>Copilot</span>
        </button>

        <button
          onClick={() => setActiveTab('lab')}
          className={`flex flex-col items-center justify-center gap-1 px-2.5 py-1 text-[11px] font-mono transition-colors ${
            activeTab === 'lab'
              ? 'text-purple-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <GraduationCap className="h-5 w-5" />
          <span>Laboratoř</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center gap-1 px-2.5 py-1 text-[11px] font-mono transition-colors ${
            activeTab === 'settings'
              ? 'text-emerald-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span>Nastavení</span>
        </button>
      </nav>
    </div>
  );
};
