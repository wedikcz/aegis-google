import React, { useState } from 'react';
import {
  BookOpen,
  CheckSquare,
  Square,
  Shield,
  PlusCircle,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Playbook, PlaybookStep } from '../types';

interface PlaybooksViewProps {
  playbooks: Playbook[];
  onUpdatePlaybook: (pb: Playbook) => void;
  onAddPlaybook: (pb: Playbook) => void;
  initialSelectedId?: string;
}

export const PlaybooksView: React.FC<PlaybooksViewProps> = ({
  playbooks,
  onUpdatePlaybook,
  onAddPlaybook,
  initialSelectedId,
}) => {
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>(
    initialSelectedId || playbooks[0]?.id || ''
  );

  React.useEffect(() => {
    if (initialSelectedId) {
      setSelectedPlaybookId(initialSelectedId);
    }
  }, [initialSelectedId]);
  const [isCreating, setIsCreating] = useState(false);

  // New Playbook State
  const [newTitle, setNewTitle] = useState('');
  const [newTechId, setNewTechId] = useState('T1406');
  const [newTechName, setNewTechName] = useState('Obfuscated Files or Information');
  const [newDesc, setNewDesc] = useState('');
  const [newStepsText, setNewStepsText] = useState(
    '1. Extrahovat DEX sekce a vypočítat Shannonovu entropii\n2. Prověřit deobfuskační rutiny v JNI knihovnách\n3. Ověřit integritu s Play Integrity API'
  );

  const selectedPlaybook =
    playbooks.find((p) => p.id === selectedPlaybookId) || playbooks[0];

  const handleToggleStep = (stepId: string) => {
    if (!selectedPlaybook) return;
    const updatedSteps = selectedPlaybook.steps.map((st) =>
      st.id === stepId ? { ...st, completed: !st.completed } : st
    );
    const updated: Playbook = {
      ...selectedPlaybook,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };
    onUpdatePlaybook(updated);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const steps: PlaybookStep[] = newStepsText
      .split('\n')
      .filter((s) => s.trim())
      .map((line, idx) => ({
        id: `s-${Date.now()}-${idx}`,
        title: line.replace(/^[0-9]+[.\-)]\s*/, ''),
        description: 'Defenzivní kontrolní krok odvozený z bezpečnostního rámce.',
        completed: false,
      }));

    const pb: Playbook = {
      id: `pb-${Date.now()}`,
      title: newTitle,
      techniqueId: newTechId,
      techniqueName: newTechName,
      description: newDesc,
      steps,
      updatedAt: new Date().toISOString(),
    };

    onAddPlaybook(pb);
    setSelectedPlaybookId(pb.id);
    setIsCreating(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <BookOpen className="h-4 w-4" />
            <span>OPERATIONAL MITIGATION PLAYBOOKS</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-100 font-sans">
            Defenzivní Playbooky ({playbooks.length})
          </h1>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Standardizované operační postupy pro sanaci a mitigaci mobilních zranitelností na Android 15.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 rounded bg-emerald-500 px-3.5 py-2 font-mono text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-950/40"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Vytvořit Playbook</span>
        </button>
      </div>

      {/* Grid: Playbook List & Active Step Checklists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Playbook Cards (Left) */}
        <div className="lg:col-span-4 space-y-3">
          {playbooks.map((pb) => {
            const isSelected = selectedPlaybook?.id === pb.id;
            const completedCount = pb.steps.filter((s) => s.completed).length;
            const progress =
              pb.steps.length > 0 ? Math.round((completedCount / pb.steps.length) * 100) : 0;

            return (
              <div
                key={pb.id}
                onClick={() => setSelectedPlaybookId(pb.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? 'border-emerald-500/60 bg-zinc-900/90 shadow-lg'
                    : 'border-zinc-800 bg-[#090b10] hover:border-zinc-700/80 hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                    {pb.techniqueId}
                  </span>
                  <span className="font-mono text-[11px] text-zinc-400">
                    {completedCount} z {pb.steps.length} hotovo ({progress}%)
                  </span>
                </div>

                <h3 className="mt-2 font-sans text-sm font-bold text-zinc-100 line-clamp-1">
                  {pb.title}
                </h3>

                {/* Progress bar */}
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Playbook Detail (Right) */}
        {selectedPlaybook && (
          <div className="lg:col-span-8 rounded-xl border border-zinc-800 bg-[#090b10] p-5 sm:p-6 space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded">
                  {selectedPlaybook.techniqueId}
                </span>
                <span className="font-mono text-xs text-zinc-400">
                  {selectedPlaybook.techniqueName}
                </span>
              </div>
              <h2 className="mt-2 text-xl font-bold text-zinc-100 font-sans">
                {selectedPlaybook.title}
              </h2>
              <p className="mt-2 font-sans text-xs text-zinc-300 leading-relaxed bg-zinc-900/40 p-3 rounded border border-zinc-800">
                {selectedPlaybook.description}
              </p>
            </div>

            {/* Checklist of steps */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 uppercase tracking-wider">
                <span>Kroky Playbooku</span>
                <span className="text-emerald-400">
                  {selectedPlaybook.steps.filter((s) => s.completed).length} /{' '}
                  {selectedPlaybook.steps.length} dokončeno
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedPlaybook.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    onClick={() => handleToggleStep(step.id)}
                    className={`group cursor-pointer flex items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                      step.completed
                        ? 'border-emerald-500/30 bg-emerald-950/10 text-zinc-300'
                        : 'border-zinc-800 bg-zinc-900/30 text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-zinc-400 group-hover:text-emerald-400"
                    >
                      {step.completed ? (
                        <CheckSquare className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono text-xs font-bold ${
                            step.completed ? 'text-emerald-300 line-through' : 'text-zinc-100'
                          }`}
                        >
                          Krok {idx + 1}: {step.title}
                        </span>
                        {step.mitigationRef && (
                          <span className="font-mono text-[10px] text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded">
                            {step.mitigationRef}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 font-sans text-xs text-zinc-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Playbook Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-[#090b10] p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-zinc-100 font-sans">
              Vytvořit Nový Mitigační Playbook
            </h2>
            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block font-mono text-xs text-zinc-400 mb-1">
                  Název Playbooku
                </label>
                <input
                  type="text"
                  required
                  placeholder="Např. Reakce na SMS Intercept (T1409)..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs text-zinc-400 mb-1">
                    Technique ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="T1409"
                    value={newTechId}
                    onChange={(e) => setNewTechId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-zinc-400 mb-1">
                    Název Techniky
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Access Stored Application Data"
                    value={newTechName}
                    onChange={(e) => setNewTechName(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-zinc-400 mb-1">
                  Popis Scénáře
                </label>
                <textarea
                  rows={2}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Stručný cíl a účel tohoto playbooku..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-zinc-400 mb-1">
                  Kroky (jeden krok na každý řádek)
                </label>
                <textarea
                  rows={4}
                  required
                  value={newStepsText}
                  onChange={(e) => setNewStepsText(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="rounded px-4 py-2 font-mono text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="rounded bg-emerald-500 px-4 py-2 font-mono text-xs font-semibold text-zinc-950 hover:bg-emerald-400"
                >
                  Uložit Playbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
