import React, { useState, useMemo } from 'react';
import {
  Search,
  Shield,
  CheckCircle,
  BookOpen,
  PlusCircle,
  Smartphone,
  Info,
  ChevronDown,
  ChevronRight,
  Bot,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { MitreTechnique, TacticType, PlatformType, Playbook } from '../types';
import { MITRE_ATTACK_MOBILE_TECHNIQUES, ALL_TACTICS } from '../data/mitreAttackMobile';

interface AttackCatalogViewProps {
  playbooks: Playbook[];
  onCreatePlaybookFromTechnique: (technique: MitreTechnique) => void;
  onCreateCaseFromTechnique: (technique: MitreTechnique) => void;
  onAskCopilot: (technique: MitreTechnique) => void;
  onNavigateToPlaybook?: (playbookId: string) => void;
}

export type DefenseFilter = 'all' | 'covered' | 'uncovered';

export const AttackCatalogView: React.FC<AttackCatalogViewProps> = ({
  playbooks,
  onCreatePlaybookFromTechnique,
  onCreateCaseFromTechnique,
  onAskCopilot,
  onNavigateToPlaybook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTactic, setSelectedTactic] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Android');
  const [filterMitigationOnly, setFilterMitigationOnly] = useState(false);
  const [filterDetectionOnly, setFilterDetectionOnly] = useState(false);
  const [filterDefense, setFilterDefense] = useState<DefenseFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>('T1628');

  // Map technique ID to playbook
  const playbooksByTechId = useMemo(() => {
    const map = new Map<string, Playbook>();
    playbooks.forEach((pb) => {
      map.set(pb.techniqueId, pb);
    });
    return map;
  }, [playbooks]);

  // Overall counts for defense metrics
  const totalCount = MITRE_ATTACK_MOBILE_TECHNIQUES.length;
  const coveredCount = useMemo(() => {
    return MITRE_ATTACK_MOBILE_TECHNIQUES.filter((tech) =>
      playbooksByTechId.has(tech.id)
    ).length;
  }, [playbooksByTechId]);
  const uncoveredCount = totalCount - coveredCount;
  const defenseCoveragePercent = Math.round((coveredCount / totalCount) * 100);

  const filteredTechniques = useMemo(() => {
    return MITRE_ATTACK_MOBILE_TECHNIQUES.filter((tech) => {
      // Platform filter
      if (selectedPlatform !== 'all' && !tech.platforms.includes(selectedPlatform as PlatformType)) {
        return false;
      }
      // Tactic filter
      if (selectedTactic !== 'all' && tech.tactic !== selectedTactic) {
        return false;
      }
      // Defense status filter
      const hasDefense = playbooksByTechId.has(tech.id);
      if (filterDefense === 'covered' && !hasDefense) {
        return false;
      }
      if (filterDefense === 'uncovered' && hasDefense) {
        return false;
      }
      // Mitigation badge filter
      if (filterMitigationOnly && !tech.hasMitigation) {
        return false;
      }
      // Detection badge filter
      if (filterDetectionOnly && !tech.hasDetection) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = tech.id.toLowerCase().includes(q);
        const matchesName = tech.name.toLowerCase().includes(q);
        const matchesDesc = tech.description.toLowerCase().includes(q);
        const matchesTactic = tech.tactic.toLowerCase().includes(q);
        return matchesId || matchesName || matchesDesc || matchesTactic;
      }
      return true;
    });
  }, [
    searchQuery,
    selectedTactic,
    selectedPlatform,
    filterDefense,
    filterMitigationOnly,
    filterDetectionOnly,
    playbooksByTechId,
  ]);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
            <Shield className="h-4 w-4" />
            <span>MITRE ATT&CK® FOR MOBILE — OFFLINE KATALOG</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-100 font-sans">
            Katalog Mobilních Útočných Technik ({filteredTechniques.length} z {MITRE_ATTACK_MOBILE_TECHNIQUES.length})
          </h1>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Offline databáze mobilních technik, vektorů, detekčních pravidel a obran pro Android 15.
          </p>
        </div>

        {/* Platform Selector Buttons */}
        <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/60 p-1 font-mono text-xs">
          <button
            onClick={() => setSelectedPlatform('Android')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-medium transition-colors ${
              selectedPlatform === 'Android'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Android</span>
          </button>
          <button
            onClick={() => setSelectedPlatform('iOS')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-medium transition-colors ${
              selectedPlatform === 'iOS'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>iOS</span>
          </button>
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`rounded px-3 py-1.5 font-medium transition-colors ${
              selectedPlatform === 'all'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Všechny
          </button>
        </div>
      </div>

      {/* Defense Posture & Playbook Coverage Overview Card */}
      <div className="rounded-xl border border-zinc-800 bg-[#090b10] p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 uppercase tracking-wider">
              <span>Pokrytí Technik Mitigačními Playbooky (Defense Coverage)</span>
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-mono text-2xl font-black text-emerald-400">
                {defenseCoveragePercent}%
              </span>
              <span className="font-mono text-xs text-zinc-400">
                ({coveredCount} s obranou / <strong className="text-amber-400 font-bold">{uncoveredCount} bez obrany</strong>)
              </span>
            </div>
          </div>

          {/* Quick Filter Segmented Control for Defense Posture */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="text-zinc-500 text-[11px] mr-1 hidden sm:inline">Rychlý filtr obrany:</span>
            <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/70 p-1">
              <button
                onClick={() => setFilterDefense('all')}
                className={`rounded px-3 py-1 transition-colors ${
                  filterDefense === 'all'
                    ? 'bg-zinc-800 text-zinc-100 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Všechny ({totalCount})
              </button>
              <button
                onClick={() => setFilterDefense('covered')}
                className={`flex items-center gap-1.5 rounded px-3 py-1 transition-colors ${
                  filterDefense === 'covered'
                    ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-bold'
                    : 'text-zinc-400 hover:text-emerald-400'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>S Obranou ({coveredCount})</span>
              </button>
              <button
                onClick={() => setFilterDefense('uncovered')}
                className={`flex items-center gap-1.5 rounded px-3 py-1 transition-colors ${
                  filterDefense === 'uncovered'
                    ? 'bg-amber-950/70 border border-amber-500/50 text-amber-300 font-bold animate-pulse'
                    : 'text-amber-400/80 hover:text-amber-300'
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                <span>Bez Obrany ({uncoveredCount})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Small Progress Line */}
        <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${defenseCoveragePercent}%` }}
          />
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Hledat techniku (např. T1628, Accessibility, Keylogger, SMS, Sideloading)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-[#090b10] py-2 pl-9 pr-4 font-mono text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Tactic Dropdown */}
        <div className="md:col-span-4">
          <select
            value={selectedTactic}
            onChange={(e) => setSelectedTactic(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-[#090b10] px-3 py-2 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">Všechny Taktiky ({ALL_TACTICS.length})</option>
            {ALL_TACTICS.map((tactic) => (
              <option key={tactic} value={tactic}>
                {tactic}
              </option>
            ))}
          </select>
        </div>

        {/* Badges Quick Toggles */}
        <div className="md:col-span-2 flex items-center gap-2">
          <button
            onClick={() => setFilterMitigationOnly(!filterMitigationOnly)}
            className={`flex-1 rounded border py-2 px-2 text-center font-mono text-[11px] font-medium transition-colors ${
              filterMitigationOnly
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                : 'border-zinc-800 bg-[#090b10] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            MIT
          </button>
          <button
            onClick={() => setFilterDetectionOnly(!filterDetectionOnly)}
            className={`flex-1 rounded border py-2 px-2 text-center font-mono text-[11px] font-medium transition-colors ${
              filterDetectionOnly
                ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                : 'border-zinc-800 bg-[#090b10] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            DET
          </button>
        </div>
      </div>

      {/* Filter notice when filtering by uncovered */}
      {filterDefense === 'uncovered' && (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-950/20 px-4 py-2.5 font-mono text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
            <span>
              <strong>Filtr aktivní:</strong> Zobrazeny pouze techniky, které dosud nemají vytvořený Playbook ({filteredTechniques.length} technik).
            </span>
          </div>
          <button
            onClick={() => setFilterDefense('all')}
            className="text-amber-400 hover:text-amber-200 underline font-semibold text-[11px]"
          >
            Zrušit filtr
          </button>
        </div>
      )}

      {/* Techniques List / Accordion */}
      <div className="space-y-3">
        {filteredTechniques.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-[#090b10] p-8 text-center">
            <Info className="mx-auto h-8 w-8 text-zinc-500" />
            <p className="mt-2 font-mono text-sm text-zinc-300">
              Žádná technika neodpovídá zvolenému filtru.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTactic('all');
                setSelectedPlatform('all');
                setFilterDefense('all');
                setFilterMitigationOnly(false);
                setFilterDetectionOnly(false);
              }}
              className="mt-3 font-mono text-xs text-emerald-400 underline"
            >
              Resetovat filtry
            </button>
          </div>
        ) : (
          filteredTechniques.map((tech) => {
            const isExpanded = expandedId === tech.id;
            const associatedPlaybook = playbooksByTechId.get(tech.id);
            const hasPlaybook = Boolean(associatedPlaybook);

            return (
              <div
                key={tech.id}
                className={`overflow-hidden rounded-xl border transition-colors ${
                  isExpanded
                    ? 'border-zinc-700 bg-zinc-900/60 shadow-lg'
                    : hasPlaybook
                    ? 'border-zinc-800/80 bg-[#090b10] hover:border-emerald-500/40'
                    : 'border-zinc-800/80 bg-[#090b10] hover:border-amber-500/30'
                }`}
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : tech.id)}
                  className="flex cursor-pointer items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                      {tech.id}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-sans text-sm sm:text-base font-bold text-zinc-100">
                          {tech.name}
                        </h3>

                        {/* Visual indicator linking with Playbook */}
                        {hasPlaybook ? (
                          <span
                            className="inline-flex items-center gap-1 rounded bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300"
                            title={`Playbook: ${associatedPlaybook?.title}`}
                          >
                            <ShieldCheck className="h-3 w-3 text-emerald-400" />
                            <span>OBRANA AKTIVNÍ</span>
                            {associatedPlaybook && (
                              <span className="text-emerald-400 font-normal">
                                ({associatedPlaybook.steps.filter((s) => s.completed).length}/
                                {associatedPlaybook.steps.length})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 rounded bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-300/90"
                            title="Tato technika zatím nemá žádný vytvořený playbook"
                          >
                            <ShieldAlert className="h-3 w-3 text-amber-400" />
                            <span>CHYBÍ OBRANA</span>
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-mono">
                        <span className="text-cyan-400">{tech.tactic}</span>
                        <span>·</span>
                        <span>{tech.platforms.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Badges */}
                    <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px]">
                      {tech.hasMitigation && (
                        <span className="rounded bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 text-emerald-400 font-semibold">
                          MIT
                        </span>
                      )}
                      {tech.hasDetection && (
                        <span className="rounded bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 text-cyan-400 font-semibold">
                          DET
                        </span>
                      )}
                      {tech.isPostExploit && (
                        <span className="rounded bg-purple-950/60 border border-purple-500/30 px-1.5 py-0.5 text-purple-400 font-semibold">
                          POST
                        </span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-zinc-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-zinc-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-zinc-800 bg-zinc-950/60 p-4 sm:p-5 space-y-4">
                    {/* Dedicated Playbook Linkage Section */}
                    {hasPlaybook && associatedPlaybook ? (
                      <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/20 p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            <span className="font-mono text-xs font-bold text-emerald-300 uppercase tracking-wide">
                              Aktivní Defenzivní Playbook
                            </span>
                          </div>
                          {onNavigateToPlaybook && (
                            <button
                              onClick={() => onNavigateToPlaybook(associatedPlaybook.id)}
                              className="flex items-center gap-1 font-mono text-xs text-emerald-300 hover:text-emerald-200 underline font-semibold"
                            >
                              <span>Otevřít v Operacích</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>

                        <div className="font-sans text-sm font-semibold text-zinc-100">
                          {associatedPlaybook.title}
                        </div>
                        <p className="font-sans text-xs text-zinc-300">
                          {associatedPlaybook.description}
                        </p>

                        <div className="pt-1">
                          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                            <span>Kroky mitigace:</span>
                            <span className="text-emerald-400 font-bold">
                              {associatedPlaybook.steps.filter((s) => s.completed).length} z{' '}
                              {associatedPlaybook.steps.length} hotovo (
                              {Math.round(
                                (associatedPlaybook.steps.filter((s) => s.completed).length /
                                  associatedPlaybook.steps.length) *
                                  100
                              )}
                              %)
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{
                                width: `${
                                  (associatedPlaybook.steps.filter((s) => s.completed).length /
                                    associatedPlaybook.steps.length) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-950/20 p-3.5 text-xs font-mono">
                        <div className="flex items-start gap-2.5">
                          <ShieldAlert className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                          <div>
                            <strong className="text-amber-300 font-bold block">
                              Bezpečnostní mezera: Chybí Playbook pro tuto techniku
                            </strong>
                            <span className="text-zinc-300 font-sans">
                              Pro techniku {tech.id} zatím nebyl sestaven standardizovaný postup sanace pro Android 15.
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onCreatePlaybookFromTechnique(tech)}
                          className="shrink-0 flex items-center gap-1.5 rounded bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 font-mono text-xs text-amber-300 hover:bg-amber-500/30 transition-colors"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Vytvořit Playbook z Mitigací</span>
                        </button>
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <h4 className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Popis Vektoru
                      </h4>
                      <p className="font-sans text-sm text-zinc-300 leading-relaxed">
                        {tech.description}
                      </p>
                    </div>

                    {/* Mitigations */}
                    {tech.mitigations && tech.mitigations.length > 0 && (
                      <div>
                        <h4 className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Doporučené Mitigace (Android 15)</span>
                        </h4>
                        <ul className="space-y-1.5 font-sans text-xs text-zinc-300">
                          {tech.mitigations.map((mit, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-500 font-mono mt-0.5">•</span>
                              <span>{mit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Detection */}
                    {tech.detection && (
                      <div>
                        <h4 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Info className="h-3.5 w-3.5" />
                          <span>Detekční Vodítka</span>
                        </h4>
                        <p className="font-mono text-xs text-zinc-300 bg-zinc-900/80 p-2.5 rounded border border-zinc-800">
                          {tech.detection}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/80">
                      {!hasPlaybook && (
                        <button
                          onClick={() => onCreatePlaybookFromTechnique(tech)}
                          className="flex items-center gap-1.5 rounded bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 font-mono text-xs text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Sestavit Playbook</span>
                        </button>
                      )}

                      {hasPlaybook && associatedPlaybook && onNavigateToPlaybook && (
                        <button
                          onClick={() => onNavigateToPlaybook(associatedPlaybook.id)}
                          className="flex items-center gap-1.5 rounded bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 font-mono text-xs text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Přejít na Playbook</span>
                        </button>
                      )}

                      <button
                        onClick={() => onCreateCaseFromTechnique(tech)}
                        className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 font-mono text-xs text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
                      >
                        <PlusCircle className="h-3.5 w-3.5 text-amber-400" />
                        <span>Založit Incident Case</span>
                      </button>

                      <button
                        onClick={() => onAskCopilot(tech)}
                        className="flex items-center gap-1.5 rounded border border-cyan-500/40 bg-cyan-950/30 px-3 py-1.5 font-mono text-xs text-cyan-300 hover:bg-cyan-950/50 transition-colors"
                      >
                        <Bot className="h-3.5 w-3.5" />
                        <span>Analyzovat s Copilotem</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
