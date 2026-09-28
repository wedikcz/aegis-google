import React, { useState } from 'react';
import {
  GraduationCap,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Code,
  Key,
  BookOpen,
  Search,
  Lock,
  Sparkles,
} from 'lucide-react';
import { ETHICAL_LESSONS } from '../data/initialData';
import { EthicalLesson } from '../types';

export const LearningLabView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'secret-scanner' | 'owasp-checklist'>(
    'lessons'
  );
  const [selectedLesson, setSelectedLesson] = useState<EthicalLesson>(ETHICAL_LESSONS[0]);

  // Secret Scanner State
  const [codeToScan, setCodeToScan] = useState(`// Příklad kódu k bezpečnostnímu skenu:
public class ApiConfig {
    public static final String STRIPE_KEY = "sk_live_51Msz8293810928172938";
    public static final String AWS_SECRET = "AKIAIOSFODNN7EXAMPLE";
    public static final String DB_PASS = "SuperSecretPassword123!";
    
    // Nebezpečné oprávnění v manifestu:
    // <uses-permission android:name="android.permission.BIND_ACCESSIBILITY_SERVICE" />
}
`);
  const [scanResults, setScanResults] = useState<
    { type: string; severity: string; match: string; line: number }[]
  >([]);
  const [hasScanned, setHasScanned] = useState(false);

  // OWASP MASVS Interactive Checklist
  const [owaspChecked, setOwaspChecked] = useState<Record<string, boolean>>({
    'masvs-storage-1': true,
    'masvs-crypto-1': true,
    'masvs-auth-1': false,
    'masvs-network-1': true,
    'masvs-platform-1': false,
    'masvs-code-1': true,
    'masvs-resilience-1': false,
  });

  const handleRunSecretScan = () => {
    const lines = codeToScan.split('\n');
    const results: { type: string; severity: string; match: string; line: number }[] = [];

    // Regex checks for sensitive tokens & bad patterns
    const patterns = [
      { regex: /sk_live_[0-9a-zA-Z]{20,}/, type: 'Stripe Live Secret Key', severity: 'Critical' },
      { regex: /AKIA[0-9A-Z]{16}/, type: 'AWS Access Key ID', severity: 'Critical' },
      { regex: /(?:password|db_pass|passwd|secret)\s*=\s*["'][^"']+["']/i, type: 'Hardcoded Password / Secret', severity: 'High' },
      { regex: /AIza[0-9A-Za-z-_]{35}/, type: 'Google API Key', severity: 'High' },
      { regex: /BIND_ACCESSIBILITY_SERVICE/, type: 'Dangerous Permission: Accessibility Abuse Vector', severity: 'Critical' },
      { regex: /BIND_DEVICE_ADMIN/, type: 'Dangerous Permission: Device Admin Vector', severity: 'High' },
      { regex: /SYSTEM_ALERT_WINDOW/, type: 'Dangerous Permission: Overlay Injection Vector', severity: 'Medium' },
    ];

    lines.forEach((line, idx) => {
      patterns.forEach((p) => {
        const match = line.match(p.regex);
        if (match) {
          results.push({
            type: p.type,
            severity: p.severity,
            match: match[0],
            line: idx + 1,
          });
        }
      });
    });

    setScanResults(results);
    setHasScanned(true);
  };

  const toggleOwasp = (key: string) => {
    setOwaspChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-purple-400">
            <GraduationCap className="h-4 w-4" />
            <span>ETHICAL TUTOR & DEFENSIVE LAB</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-100 font-sans">
            Bezpečnostní Laboratoř & Etický Tutor
          </h1>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Výuka útočných vektorů v legálním cvičném rámci (HTB/THM), OWASP MASVS auditor a Secret Scanner.
          </p>
        </div>

        {/* Lab Navigation Switcher */}
        <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/60 p-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`rounded px-3 py-1.5 font-medium transition-colors ${
              activeTab === 'lessons'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-zinc-400'
            }`}
          >
            Lekce & CEH
          </button>
          <button
            onClick={() => setActiveTab('secret-scanner')}
            className={`rounded px-3 py-1.5 font-medium transition-colors ${
              activeTab === 'secret-scanner'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-zinc-400'
            }`}
          >
            Secret Scanner
          </button>
          <button
            onClick={() => setActiveTab('owasp-checklist')}
            className={`rounded px-3 py-1.5 font-medium transition-colors ${
              activeTab === 'owasp-checklist'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-zinc-400'
            }`}
          >
            OWASP MASVS
          </button>
        </div>
      </div>

      {/* Tab 1: Lessons & CEH Domains */}
      {activeTab === 'lessons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lessons List (Left) */}
          <div className="lg:col-span-4 space-y-3">
            {ETHICAL_LESSONS.map((lesson) => {
              const isSelected = selectedLesson.id === lesson.id;
              return (
                <div
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-purple-500/60 bg-zinc-900/90 shadow-lg'
                      : 'border-zinc-800 bg-[#090b10] hover:border-zinc-700/80 hover:bg-zinc-900/40'
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-purple-500/30 bg-purple-950/40 text-purple-300">
                    {lesson.category}
                  </span>
                  <h3 className="mt-2 font-sans text-sm font-bold text-zinc-100">
                    {lesson.title}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-zinc-400 line-clamp-2">
                    {lesson.summary}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Lesson Content Detail (Right) */}
          <div className="lg:col-span-8 rounded-xl border border-zinc-800 bg-[#090b10] p-5 sm:p-6 space-y-5">
            {/* Ethical Warning Banner */}
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-950/20 p-3.5 text-xs font-mono text-amber-200">
              <Shield className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-300 uppercase block mb-0.5">
                  Etický rámec a právní doložka (Ethical Hacker Code of Conduct):
                </strong>
                {selectedLesson.ethicalNotice}
              </div>
            </div>

            <div className="border-b border-zinc-800 pb-3">
              <span className="font-mono text-xs text-purple-400 font-bold uppercase">
                {selectedLesson.category}
              </span>
              <h2 className="text-xl font-bold text-zinc-100 font-sans mt-1">
                {selectedLesson.title}
              </h2>
            </div>

            {/* Markdown Body */}
            <div className="prose prose-invert max-w-none text-xs text-zinc-300 space-y-3 font-sans leading-relaxed whitespace-pre-wrap">
              {selectedLesson.contentMarkdown}
            </div>

            {/* Defensive Checklist */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
              <h3 className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Defenzivní Kontrolní Seznam (Defensive Checklist)</span>
              </h3>
              <ul className="space-y-1.5 font-sans text-xs text-zinc-300">
                {selectedLesson.defensiveChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-mono mt-0.5">✔</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Secret Scanner */}
      {activeTab === 'secret-scanner' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-[#090b10] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-100 font-sans flex items-center gap-2">
                  <Key className="h-4 w-4 text-purple-400" />
                  <span>Statický Skener Tajemství a Citlivých Oprávnění</span>
                </h2>
                <p className="font-mono text-xs text-zinc-400 mt-1">
                  Vložte zdrojový kód (Kotlin, Java), AndroidManifest.xml nebo konfigurační soubor pro detekci úniku API klíčů a zneužitelných práv.
                </p>
              </div>

              <button
                onClick={handleRunSecretScan}
                className="flex items-center gap-1.5 rounded bg-purple-600 px-4 py-2 font-mono text-xs font-semibold text-white hover:bg-purple-500 transition-colors shadow-lg shadow-purple-950/50"
              >
                <Code className="h-3.5 w-3.5" />
                <span>Spustit Sken Kódu</span>
              </button>
            </div>

            <textarea
              rows={8}
              value={codeToScan}
              onChange={(e) => setCodeToScan(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 font-mono text-xs text-zinc-200 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Results table */}
          {hasScanned && (
            <div className="rounded-xl border border-zinc-800 bg-[#090b10] p-5">
              <h3 className="font-mono text-xs font-bold text-zinc-200 uppercase tracking-wider mb-3">
                Výsledky Skenu ({scanResults.length} nálezů)
              </h3>

              {scanResults.length === 0 ? (
                <div className="py-6 text-center font-mono text-xs text-emerald-400">
                  ✔ V kódu nebyly nalezeny žádné známé uniklé klíče ani nebezpečná oprávnění!
                </div>
              ) : (
                <div className="space-y-2">
                  {scanResults.map((res, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs font-mono"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">Řádek {res.line}:</span>
                          <strong className="text-zinc-200">{res.type}</strong>
                        </div>
                        <div className="text-[11px] text-red-300 bg-red-950/30 px-2 py-0.5 rounded border border-red-500/20 truncate max-w-xl">
                          Nalezeno: {res.match}
                        </div>
                      </div>

                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                          res.severity === 'Critical'
                            ? 'border-red-500/40 bg-red-950/40 text-red-400'
                            : 'border-amber-500/40 bg-amber-950/40 text-amber-400'
                        }`}
                      >
                        {res.severity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: OWASP MASVS Checklist */}
      {activeTab === 'owasp-checklist' && (
        <div className="rounded-xl border border-zinc-800 bg-[#090b10] p-5 space-y-4">
          <div className="border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-bold text-zinc-100 font-sans flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>OWASP Mobile Application Security Verification Standard (MASVS v2)</span>
            </h2>
            <p className="font-mono text-xs text-zinc-400 mt-1">
              Auditní kontrolní checklist pro produkční nasazení bezpečné mobilní aplikace.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: 'masvs-storage-1',
                title: 'MASVS-STORAGE: Bezpečné úložiště bez plaintext hesel',
                desc: 'Citlivá data jsou uložena v EncryptedSharedPreferences s hardwarovým klíčem v AndroidKeyStore.',
              },
              {
                id: 'masvs-crypto-1',
                title: 'MASVS-CRYPTO: Moderní kryptografie (AES-256-GCM / SHA-256)',
                desc: 'Aplikace nepoužívá zastaralé šifry (DES, MD5, RC4). Všechny náhodné IV jsou kryptograficky bezpečné.',
              },
              {
                id: 'masvs-auth-1',
                title: 'MASVS-AUTH: Biometrie & Silné ověření identity',
                desc: 'Biometrické ověřování využívá BiometricPrompt s CryptoObject provázaným na KeyStore.',
              },
              {
                id: 'masvs-network-1',
                title: 'MASVS-NETWORK: TLS 1.3 & Certificate Pinning',
                desc: 'Zakázán cleartext HTTP provoz v network-security-config.xml, implementována validace CA certifikátů.',
              },
              {
                id: 'masvs-platform-1',
                title: 'MASVS-PLATFORM: Zabezpečení IPC a Intent filtrů',
                desc: 'Komponenty explicitně označeny android:exported="false", ochrana proti Intent Injection útokům.',
              },
              {
                id: 'masvs-code-1',
                title: 'MASVS-CODE: Bezpečná správa závislostí a BuildConfig',
                desc: 'Žádné produkční logy v logcatu, R8/ProGuard minifikace a obfuskace symbolů.',
              },
              {
                id: 'masvs-resilience-1',
                title: 'MASVS-RESILIENCE: Play Integrity API & Anti-Tamper',
                desc: 'Ověření hardwarové integrity zařízení před přístupem k bezpečnostně citlivým operacím.',
              },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => toggleOwasp(item.id)}
                className={`cursor-pointer flex items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                  owaspChecked[item.id]
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
                }`}
              >
                <div className="mt-0.5">
                  {owaspChecked[item.id] ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <div className="h-4 w-4 rounded border border-zinc-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-zinc-100">{item.title}</h4>
                  <p className="mt-0.5 font-sans text-xs text-zinc-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
