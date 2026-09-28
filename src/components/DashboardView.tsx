import React from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Radio,
  ExternalLink,
  PlusCircle,
  Binary,
  Database,
  ArrowRight,
} from 'lucide-react';
import { IncidentCase, ScanReport, ValidationTest, ThreatIntelItem } from '../types';
import { MITRE_ATTACK_MOBILE_TECHNIQUES } from '../data/mitreAttackMobile';

interface DashboardViewProps {
  cases: IncidentCase[];
  tests: ValidationTest[];
  intel: ThreatIntelItem[];
  scans: ScanReport[];
  onNavigate: (tab: any, subTab?: any) => void;
  onOpenNewCase: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  tests,
  intel,
  scans,
  onNavigate,
  onOpenNewCase,
}) => {
  const activeCases = cases.filter((c) => c.status !== 'Closed');
  const criticalCases = cases.filter((c) => c.severity === 'Critical');

  const passedTests = tests.filter((t) => t.status === 'PASS').length;
  const coveragePercent = tests.length > 0 ? Math.round((passedTests / tests.length) * 100) : 0;

  const maliciousScans = scans.filter((s) => s.verdict === 'ŠKODLIVÝ');

  return (
    <div className="space-y-6 pb-20">
      {/* Tactical HUD Header Card */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#090b10] p-4 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 h-48 w-48 opacity-10 pointer-events-none">
          <div className="h-full w-full rounded-full border border-emerald-500 radar-sweep" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>SOC DEFENSIVE OPERATIONAL STATUS: GREEN</span>
            </div>
            <h1 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-zinc-100 font-sans">
              Mobilní Bezpečnostní Velín (Command Center)
            </h1>
            <p className="mt-1 font-mono text-xs text-zinc-400 max-w-2xl">
              Defenzivní monitorovací a vyšetřovací platforma optimalizovaná pro telefon{' '}
              <strong className="text-zinc-200">Infinix Hot 50 Pro+ (X6880)</strong> s Android 15.
              Offline-first Room architektura, nulová telemetrie, reálná Shannonova entropie.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('scanner')}
              className="flex items-center gap-2 rounded bg-emerald-500 px-3.5 py-2 font-mono text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-950/40"
            >
              <Binary className="h-4 w-4" />
              <span>Skenovat Soubor / APK</span>
            </button>
            <button
              onClick={onOpenNewCase}
              className="flex items-center gap-2 rounded border border-zinc-700 bg-zinc-800/80 px-3 py-2 font-mono text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              <PlusCircle className="h-4 w-4 text-emerald-400" />
              <span>Nový Incident</span>
            </button>
          </div>
        </div>

        {/* Tactical Metrics Bar */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div
            onClick={() => onNavigate('operations', 'cases')}
            className="cursor-pointer rounded-lg border border-zinc-800/90 bg-zinc-900/40 p-3 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span>Aktivní Případy</span>
              <AlertTriangle className={`h-4 w-4 ${criticalCases.length > 0 ? 'text-red-400' : 'text-amber-400'}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-zinc-100">
                {activeCases.length}
              </span>
              <span className="font-mono text-[11px] text-zinc-400">
                ({criticalCases.length} kritických)
              </span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('attack')}
            className="cursor-pointer rounded-lg border border-zinc-800/90 bg-zinc-900/40 p-3 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span>MITRE ATT&CK Mobile</span>
              <Shield className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-zinc-100">
                {MITRE_ATTACK_MOBILE_TECHNIQUES.length}
              </span>
              <span className="font-mono text-[11px] text-zinc-400">technik</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('operations', 'coverage')}
            className="cursor-pointer rounded-lg border border-zinc-800/90 bg-zinc-900/40 p-3 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span>Validace Pokrytí</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-emerald-400">
                {coveragePercent}%
              </span>
              <span className="font-mono text-[11px] text-zinc-400">
                ({passedTests}/{tests.length} PASS)
              </span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('operations', 'intel')}
            className="cursor-pointer rounded-lg border border-zinc-800/90 bg-zinc-900/40 p-3 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span>Threat Intel IOCs</span>
              <Radio className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-zinc-100">
                {intel.length}
              </span>
              <span className="font-mono text-[11px] text-zinc-400">aktivních</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Cases + Scans */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Incident Cases */}
        <div className="rounded-xl border border-zinc-800 bg-[#090b10] p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h2 className="font-mono text-sm font-bold text-zinc-100 uppercase tracking-wide">
                Incident Response Případy ({cases.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigate('operations', 'cases')}
              className="flex items-center gap-1 font-mono text-xs text-emerald-400 hover:text-emerald-300"
            >
              <span>Všechny případy</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {cases.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('operations', 'cases')}
                className="group cursor-pointer rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-3.5 hover:border-zinc-700 hover:bg-zinc-900/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-400">
                      {item.caseNumber}
                    </span>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded border uppercase font-semibold ${
                        item.severity === 'Critical'
                          ? 'border-red-500/40 bg-red-950/30 text-red-400'
                          : item.severity === 'High'
                          ? 'border-amber-500/40 bg-amber-950/30 text-amber-400'
                          : 'border-blue-500/40 bg-blue-950/30 text-blue-400'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-zinc-400 border border-zinc-700/60 px-1.5 py-0.5 rounded">
                    Status: {item.status}
                  </span>
                </div>

                <h3 className="mt-2 font-sans text-sm font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="mt-1 font-mono text-xs text-zinc-400 line-clamp-2">
                  {item.description}
                </p>

                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2 border-t border-zinc-800/50">
                  <div className="flex items-center gap-1.5">
                    <span>MITRE:</span>
                    <span className="text-zinc-300">{item.associatedTechniques.join(', ')}</span>
                  </div>
                  <span>{new Date(item.updatedAt).toLocaleDateString('cs-CZ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forensic File Scanner Activity */}
        <div className="rounded-xl border border-zinc-800 bg-[#090b10] p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-cyan-400" />
              <h2 className="font-mono text-sm font-bold text-zinc-100 uppercase tracking-wide">
                Poslední Skeny Artefaktů
              </h2>
            </div>
            <button
              onClick={() => onNavigate('scanner')}
              className="flex items-center gap-1 font-mono text-xs text-cyan-400 hover:text-cyan-300"
            >
              <span>Otevřít Skener</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {scans.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center p-6 text-center">
              <Database className="h-10 w-10 text-zinc-700" />
              <p className="mt-3 font-mono text-xs text-zinc-400">
                Zatím nebyl proveden žádný statický sken souboru.
              </p>
              <button
                onClick={() => onNavigate('scanner')}
                className="mt-3 inline-flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-950/20 px-3 py-1.5 font-mono text-xs text-emerald-400 hover:bg-emerald-950/40"
              >
                <Binary className="h-3.5 w-3.5" />
                <span>Spustit testovací sken (SharkBot / Wannalocker)</span>
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {scans.slice(0, 3).map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => onNavigate('scanner')}
                  className="group cursor-pointer rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-3.5 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-zinc-200 truncate max-w-[200px]">
                      {scan.fileName}
                    </span>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                        scan.verdict === 'ŠKODLIVÝ'
                          ? 'border-red-500/40 bg-red-950/30 text-red-400'
                          : scan.verdict === 'PODEZŘELÝ'
                          ? 'border-amber-500/40 bg-amber-950/30 text-amber-400'
                          : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-400'
                      }`}
                    >
                      {scan.verdict} ({scan.riskScore}/100)
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[11px] text-zinc-400">
                    <div>
                      <span>Entropie: </span>
                      <strong className={scan.shannonEntropy >= 7.2 ? 'text-red-400' : 'text-zinc-200'}>
                        {scan.shannonEntropy} / 8.0 b/B
                      </strong>
                    </div>
                    <div>
                      <span>Příznaky: </span>
                      <strong className="text-zinc-200">{scan.heuristicFlags.length} nálezů</strong>
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] font-mono text-zinc-400 truncate">
                    SHA-256: {scan.iocs.sha256[0]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Tactical Navigation Grid */}
      <div className="rounded-xl border border-zinc-800 bg-[#090b10] p-4 sm:p-5">
        <h2 className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
          Rychlý Defenzivní Arzenál
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('operations', 'playbooks')}
            className="flex flex-col text-left rounded-lg border border-zinc-800 bg-zinc-900/40 p-3.5 hover:border-zinc-700 hover:bg-zinc-900/70 transition-colors"
          >
            <span className="font-mono text-xs font-bold text-emerald-400">01 // Playbooks</span>
            <span className="mt-1 text-sm font-semibold text-zinc-200">Mitigační Postupy</span>
            <span className="mt-1 font-mono text-[11px] text-zinc-400">
              Krok za krokem návody na izolaci a sanitaci hrozeb.
            </span>
          </button>

          <button
            onClick={() => onNavigate('copilot')}
            className="flex flex-col text-left rounded-lg border border-zinc-800 bg-zinc-900/40 p-3.5 hover:border-zinc-700 hover:bg-zinc-900/70 transition-colors"
          >
            <span className="font-mono text-xs font-bold text-cyan-400">02 // AI Copilot</span>
            <span className="mt-1 text-sm font-semibold text-zinc-200">MoE Asistent</span>
            <span className="mt-1 font-mono text-[11px] text-zinc-400">
              Threat Analyst, IR Coach, Code Auditor a ATT&CK Navigator.
            </span>
          </button>

          <button
            onClick={() => onNavigate('lab')}
            className="flex flex-col text-left rounded-lg border border-zinc-800 bg-zinc-900/40 p-3.5 hover:border-zinc-700 hover:bg-zinc-900/70 transition-colors"
          >
            <span className="font-mono text-xs font-bold text-purple-400">03 // Laboratoř</span>
            <span className="mt-1 text-sm font-semibold text-zinc-200">Etický Tutor & Scanner</span>
            <span className="mt-1 font-mono text-[11px] text-zinc-400">
              OWASP MASVS checklist, CEH okruhy a Secret Scanner.
            </span>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className="flex flex-col text-left rounded-lg border border-zinc-800 bg-zinc-900/40 p-3.5 hover:border-zinc-700 hover:bg-zinc-900/70 transition-colors"
          >
            <span className="font-mono text-xs font-bold text-amber-400">04 // Hardware Info</span>
            <span className="mt-1 text-sm font-semibold text-zinc-200">Infinix X6880 Profil</span>
            <span className="mt-1 font-mono text-[11px] text-zinc-400">
              Android 15 edge-to-edge, Room záloha a export APK projektu.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
