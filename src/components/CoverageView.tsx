import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { ValidationTest, CoverageStatus } from '../types';
import { MITRE_ATTACK_MOBILE_TECHNIQUES } from '../data/mitreAttackMobile';

interface CoverageViewProps {
  tests: ValidationTest[];
  onUpdateTest: (test: ValidationTest) => void;
  onSeedMissingTests: (newTests: ValidationTest[]) => void;
}

export const CoverageView: React.FC<CoverageViewProps> = ({
  tests,
  onUpdateTest,
  onSeedMissingTests,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const passedCount = tests.filter((t) => t.status === 'PASS').length;
  const failedCount = tests.filter((t) => t.status === 'FAIL').length;
  const untestedCount = tests.filter((t) => t.status === 'UNTESTED').length;
  const passPercent = tests.length > 0 ? Math.round((passedCount / tests.length) * 100) : 0;

  const handleSetStatus = (test: ValidationTest, newStatus: CoverageStatus) => {
    const updated: ValidationTest = {
      ...test,
      status: newStatus,
      lastTested: newStatus === 'UNTESTED' ? undefined : new Date().toISOString(),
    };
    onUpdateTest(updated);
  };

  const handleSeedFromMitre = () => {
    // Find MITRE techniques that don't have a test yet
    const existingTechIds = new Set(tests.map((t) => t.techniqueId));
    const missingTechs = MITRE_ATTACK_MOBILE_TECHNIQUES.filter(
      (m) => !existingTechIds.has(m.id)
    );

    const createdTests: ValidationTest[] = missingTechs.map((m) => ({
      id: `test-seed-${m.id}`,
      techniqueId: m.id,
      techniqueName: m.name,
      tactic: m.tactic,
      platform: m.platforms[0] || 'Android',
      testName: `Ověření detekce a mitigace ${m.id}`,
      testProcedure: `Ověřit, zda OS Android 15 a Aegis detekční pravidla blokují techniku ${m.name}: ${m.mitigations[0] || m.detection}`,
      status: 'UNTESTED',
    }));

    onSeedMissingTests(createdTests);
  };

  const filteredTests = tests.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.techniqueId.toLowerCase().includes(q) ||
        t.techniqueName.toLowerCase().includes(q) ||
        t.testName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>MITRE ATT&CK TEST COVERAGE VALIDATION</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-100 font-sans">
            Validace Pokrytí Testy ({tests.length})
          </h1>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Matice ověření defenzivních schopností a mitigací. PASS / FAIL / RESET stavové řízení.
          </p>
        </div>

        <button
          onClick={handleSeedFromMitre}
          className="flex items-center gap-2 rounded border border-emerald-500/40 bg-emerald-950/20 px-3.5 py-2 font-mono text-xs text-emerald-300 hover:bg-emerald-950/40 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          <span>Seedovat Chybějící Testy</span>
        </button>
      </div>

      {/* Coverage Progress Card */}
      <div className="rounded-xl border border-zinc-800 bg-[#090b10] p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Celková míra ověřeného pokrytí (Coverage Rate)
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-mono text-3xl font-black text-emerald-400">
                {passPercent}%
              </span>
              <span className="font-mono text-xs text-zinc-400">
                ({passedCount} PASS / {failedCount} FAIL / {untestedCount} UNTESTED)
              </span>
            </div>
          </div>

          {/* Status Breakdown Chips */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 rounded bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{passedCount} Prošlo</span>
            </div>
            <div className="flex items-center gap-1.5 rounded bg-red-950/40 border border-red-500/30 px-2.5 py-1 text-red-300">
              <XCircle className="h-3.5 w-3.5" />
              <span>{failedCount} Selhalo</span>
            </div>
            <div className="flex items-center gap-1.5 rounded bg-zinc-900 border border-zinc-700 px-2.5 py-1 text-zinc-400">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{untestedCount} Neotestováno</span>
            </div>
          </div>
        </div>

        {/* Multi-segment progress bar */}
        <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="bg-emerald-500 transition-all duration-300"
            style={{ width: `${(passedCount / Math.max(1, tests.length)) * 100}%` }}
          />
          <div
            className="bg-red-500 transition-all duration-300"
            style={{ width: `${(failedCount / Math.max(1, tests.length)) * 100}%` }}
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Filtrovat testy (ID techniky, název, procedura)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-800 bg-[#090b10] px-3.5 py-2 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
        />

        <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/60 p-1 font-mono text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`rounded px-3 py-1.5 font-medium transition-colors ${
              filterStatus === 'all' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
            }`}
          >
            Všechny ({tests.length})
          </button>
          <button
            onClick={() => setFilterStatus('PASS')}
            className={`rounded px-3 py-1.5 font-medium transition-colors ${
              filterStatus === 'PASS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400'
            }`}
          >
            PASS ({passedCount})
          </button>
          <button
            onClick={() => setFilterStatus('FAIL')}
            className={`rounded px-3 py-1.5 font-medium transition-colors ${
              filterStatus === 'FAIL'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'text-zinc-400'
            }`}
          >
            FAIL ({failedCount})
          </button>
          <button
            onClick={() => setFilterStatus('UNTESTED')}
            className={`rounded px-3 py-1.5 font-medium transition-colors ${
              filterStatus === 'UNTESTED'
                ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                : 'text-zinc-400'
            }`}
          >
            UNTESTED ({untestedCount})
          </button>
        </div>
      </div>

      {/* Tests Table / Cards */}
      <div className="space-y-3">
        {filteredTests.map((test) => (
          <div
            key={test.id}
            className="rounded-xl border border-zinc-800 bg-[#090b10] p-4 transition-colors hover:border-zinc-700/80"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
                  {test.techniqueId}
                </span>
                <span className="font-sans text-sm font-bold text-zinc-100">
                  {test.testName}
                </span>
              </div>

              {/* Status Action Buttons (PASS, FAIL, RESET) */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <button
                  onClick={() => handleSetStatus(test, 'PASS')}
                  className={`flex items-center gap-1 rounded px-2.5 py-1 transition-all ${
                    test.status === 'PASS'
                      ? 'border border-emerald-500 bg-emerald-950/50 text-emerald-300 font-bold'
                      : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-emerald-400'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>PASS</span>
                </button>

                <button
                  onClick={() => handleSetStatus(test, 'FAIL')}
                  className={`flex items-center gap-1 rounded px-2.5 py-1 transition-all ${
                    test.status === 'FAIL'
                      ? 'border border-red-500 bg-red-950/50 text-red-300 font-bold'
                      : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-red-400'
                  }`}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>FAIL</span>
                </button>

                <button
                  onClick={() => handleSetStatus(test, 'UNTESTED')}
                  className="rounded border border-zinc-800 bg-zinc-900/60 p-1 text-zinc-400 hover:text-zinc-200"
                  title="Resetovat stav testu"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-3 font-sans text-xs text-zinc-300 leading-relaxed">
              <strong className="font-mono text-zinc-400 uppercase text-[11px] block mb-0.5">
                Testovací Procedura:
              </strong>
              {test.testProcedure}
            </div>

            {test.testerNotes && (
              <div className="mt-2 font-mono text-[11px] text-zinc-400 bg-zinc-900/40 p-2 rounded border border-zinc-800">
                Poznámka testera: {test.testerNotes}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-zinc-400 pt-2 border-t border-zinc-800/40">
              <span>Technika: {test.techniqueName}</span>
              <span>
                {test.lastTested
                  ? `Otestováno: ${new Date(test.lastTested).toLocaleString('cs-CZ')}`
                  : 'Doposud neprovedeno'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
