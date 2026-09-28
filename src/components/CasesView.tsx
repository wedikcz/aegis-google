import React, { useState } from 'react';
import {
  AlertTriangle,
  PlusCircle,
  Clock,
  FileText,
  ChevronRight,
  Shield,
  Download,
  Trash2,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { IncidentCase, CaseStatus, SeverityLevel } from '../types';

interface CasesViewProps {
  cases: IncidentCase[];
  onAddCase: (newCase: IncidentCase) => void;
  onUpdateCase: (updatedCase: IncidentCase) => void;
  onDeleteCase: (id: string) => void;
  initialSelectedId?: string;
}

const STATUS_PIPELINE: CaseStatus[] = [
  'New',
  'Triage',
  'Containment',
  'Eradication',
  'Recovery',
  'Closed',
];

export const CasesView: React.FC<CasesViewProps> = ({
  cases,
  onAddCase,
  onUpdateCase,
  onDeleteCase,
  initialSelectedId,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(
    initialSelectedId || cases[0]?.id || null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [newActionNote, setNewActionNote] = useState('');

  // New Case Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState<SeverityLevel>('High');
  const [newTechniques, setNewTechniques] = useState('T1628, T1476');
  const [newArtifacts, setNewArtifacts] = useState('');

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const caseNumber = `INC-2026-${String(cases.length + 101).padStart(3, '0')}`;
    const created: IncidentCase = {
      id: `case-${Date.now()}`,
      caseNumber,
      title: newTitle,
      description: newDesc,
      severity: newSeverity,
      status: 'New',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      associatedTechniques: newTechniques
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      artifacts: newArtifacts
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      timeline: [
        {
          id: `t-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: 'SOC Operator',
          action: 'Případ vytvořen a zaregistrován v systému.',
          notes: newDesc,
        },
      ],
    };

    onAddCase(created);
    setSelectedCaseId(created.id);
    setIsCreating(false);
    setNewTitle('');
    setNewDesc('');
    setNewArtifacts('');
  };

  const handleAdvanceStatus = (nextStatus: CaseStatus) => {
    if (!selectedCase) return;
    const updated: IncidentCase = {
      ...selectedCase,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...selectedCase.timeline,
        {
          id: `t-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: 'SOC Lead',
          action: `Změna stavu případu: ${selectedCase.status} → ${nextStatus}`,
        },
      ],
    };
    onUpdateCase(updated);
  };

  const handleAddTimelineNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newActionNote.trim()) return;

    const updated: IncidentCase = {
      ...selectedCase,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...selectedCase.timeline,
        {
          id: `t-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: 'Forenzní analytik',
          action: newActionNote,
        },
      ],
    };
    onUpdateCase(updated);
    setNewActionNote('');
  };

  const exportCaseReport = (incident: IncidentCase) => {
    const md = `# Zpráva o bezpečnostním incidentu: ${incident.caseNumber}
**Název:** ${incident.title}
**Závažnost:** ${incident.severity}
**Aktuální stav:** ${incident.status}
**Vytvořeno:** ${incident.createdAt}
**Poslední aktualizace:** ${incident.updatedAt}
**MITRE ATT&CK Techniky:** ${incident.associatedTechniques.join(', ')}
**Artefakty:** ${incident.artifacts.join(', ') || 'Žádné'}

## Popis incidentu
${incident.description}

## Časová osa vyšetřování (Timeline)
${incident.timeline
  .map(
    (t) => `- **${new Date(t.timestamp).toLocaleString('cs-CZ')}** [${t.author}]: ${t.action}${
      t.notes ? `\n  *Poznámka:* ${t.notes}` : ''
    }`
  )
  .join('\n')}

---
*Vygenerováno z Aegis Mobile SOC Platformy pro Android 15.*
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${incident.caseNumber}_report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            <span>INCIDENT MANAGEMENT & LIFECYCLE</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-100 font-sans">
            Incidentní Případy ({cases.length})
          </h1>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Statusová linka: New → Triage → Containment → Eradication → Recovery → Closed.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 rounded bg-emerald-500 px-3.5 py-2 font-mono text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-950/40"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Založit Incident</span>
        </button>
      </div>

      {/* Main Grid: Cases Master List + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* List of Cases (Left column) */}
        <div className="lg:col-span-4 space-y-3">
          {cases.map((c) => {
            const isSelected = selectedCase?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? 'border-emerald-500/60 bg-zinc-900/90 shadow-lg'
                    : 'border-zinc-800 bg-[#090b10] hover:border-zinc-700/80 hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-zinc-400">
                    {c.caseNumber}
                  </span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold ${
                      c.severity === 'Critical'
                        ? 'border-red-500/40 bg-red-950/30 text-red-400'
                        : c.severity === 'High'
                        ? 'border-amber-500/40 bg-amber-950/30 text-amber-400'
                        : 'border-blue-500/40 bg-blue-950/30 text-blue-400'
                    }`}
                  >
                    {c.severity}
                  </span>
                </div>

                <h3 className="mt-2 font-sans text-sm font-bold text-zinc-100 line-clamp-1">
                  {c.title}
                </h3>

                <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-zinc-400">
                  <span className="text-emerald-400">Stav: {c.status}</span>
                  <span>{new Date(c.updatedAt).toLocaleDateString('cs-CZ')}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Case Detail (Right column) */}
        {selectedCase ? (
          <div className="lg:col-span-8 rounded-xl border border-zinc-800 bg-[#090b10] p-5 sm:p-6 space-y-6">
            {/* Top Bar of Detail */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {selectedCase.caseNumber}
                  </span>
                  <span className="text-zinc-600">/</span>
                  <span className="font-mono text-xs text-zinc-400">
                    Založeno {new Date(selectedCase.createdAt).toLocaleString('cs-CZ')}
                  </span>
                </div>
                <h2 className="mt-1 text-xl font-bold text-zinc-100 font-sans">
                  {selectedCase.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportCaseReport(selectedCase)}
                  className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800/80 px-2.5 py-1.5 font-mono text-xs text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
                  title="Exportovat zprávu do Markdown"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Report</span>
                </button>
                <button
                  onClick={() => onDeleteCase(selectedCase.id)}
                  className="rounded border border-red-500/30 bg-red-950/20 p-1.5 text-red-400 hover:bg-red-950/40 transition-colors"
                  title="Smazat případ"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Status Lifecycle Pipeline */}
            <div>
              <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                Postup Vyšetřování (Status Pipeline)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-1 font-mono text-xs">
                {STATUS_PIPELINE.map((st, idx) => {
                  const currentIdx = STATUS_PIPELINE.indexOf(selectedCase.status);
                  const isCurrent = st === selectedCase.status;
                  const isPast = idx < currentIdx;
                  return (
                    <button
                      key={st}
                      onClick={() => handleAdvanceStatus(st)}
                      className={`flex flex-col items-center justify-center p-2 rounded border text-center transition-all ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300 font-bold'
                          : isPast
                          ? 'border-zinc-700 bg-zinc-900/60 text-zinc-300'
                          : 'border-zinc-800/70 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-[10px] text-zinc-400">0{idx + 1}</span>
                      <span className="text-[11px] truncate w-full">{st}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description & Technical Findings */}
            <div className="space-y-2">
              <h3 className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Popis a Nálezy
              </h3>
              <p className="font-sans text-sm text-zinc-300 bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-800 leading-relaxed">
                {selectedCase.description}
              </p>
            </div>

            {/* MITRE Mapping & Artifacts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
                <span className="font-mono text-xs font-bold text-cyan-400 uppercase">
                  Mapované ATT&CK Techniky
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedCase.associatedTechniques.map((tid) => (
                    <span
                      key={tid}
                      className="font-mono text-xs bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded text-cyan-300 font-semibold"
                    >
                      {tid}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
                <span className="font-mono text-xs font-bold text-purple-400 uppercase">
                  Forenzní Artefakty & Hashe
                </span>
                <div className="mt-2 space-y-1 font-mono text-xs text-zinc-300">
                  {selectedCase.artifacts.length === 0 ? (
                    <span className="text-zinc-400">Žádné artefakty</span>
                  ) : (
                    selectedCase.artifacts.map((art, idx) => (
                      <div key={idx} className="truncate text-zinc-400 hover:text-zinc-200">
                        • {art}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Investigation Timeline */}
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Časová Osa Vyšetřování ({selectedCase.timeline.length})</span>
                </h3>
              </div>

              {/* Timeline Items */}
              <div className="space-y-2.5">
                {selectedCase.timeline.map((event) => (
                  <div
                    key={event.id}
                    className="border-l-2 border-emerald-500/50 pl-3 py-1 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
                      <span>{new Date(event.timestamp).toLocaleTimeString('cs-CZ')}</span>
                      <span>·</span>
                      <strong className="text-zinc-300">{event.author}</strong>
                    </div>
                    <div className="mt-0.5 text-zinc-200 font-sans text-xs">
                      {event.action}
                    </div>
                    {event.notes && (
                      <div className="mt-1 text-zinc-400 font-mono text-[11px] bg-zinc-900/60 p-2 rounded">
                        {event.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddTimelineNote} className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Zaznamenat nový forenzní krok nebo zjištění..."
                  value={newActionNote}
                  onChange={(e) => setNewActionNote(e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-800 bg-[#06070a] px-3 py-2 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded bg-emerald-500/20 border border-emerald-500/40 px-3 py-2 font-mono text-xs text-emerald-300 hover:bg-emerald-500/30"
                >
                  <Send className="h-3 w-3" />
                  <span>Přidat</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 flex items-center justify-center p-12 text-center text-zinc-400 font-mono text-xs border border-zinc-800 rounded-xl">
            Vyberte případ pro zobrazení detailu nebo založte nový incident.
          </div>
        )}
      </div>

      {/* Create Case Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-[#090b10] p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-zinc-100 font-sans">
              Založit Nový Bezpečnostní Incident
            </h2>
            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block font-mono text-xs text-zinc-400 mb-1">
                  Název Incidentu
                </label>
                <input
                  type="text"
                  required
                  placeholder="Např. Anomální odchozí provoz na C2 uzel z aplikace..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs text-zinc-400 mb-1">
                    Závažnost (Severity)
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as SeverityLevel)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Informational">Informational</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs text-zinc-400 mb-1">
                    MITRE Techniky
                  </label>
                  <input
                    type="text"
                    placeholder="T1628, T1476"
                    value={newTechniques}
                    onChange={(e) => setNewTechniques(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-zinc-400 mb-1">
                  Popis Incidentu
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailní popis zjištění, dotčené komponenty, chování..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-zinc-400 mb-1">
                  Artefakty (soubory / hashe oddělené čárkou)
                </label>
                <input
                  type="text"
                  placeholder="malicious.apk, 4a5e1e4baab89f3a..."
                  value={newArtifacts}
                  onChange={(e) => setNewArtifacts(e.target.value)}
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
                  Uložit Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
