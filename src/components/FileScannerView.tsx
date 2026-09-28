import React, { useState } from 'react';
import {
  Binary,
  Upload,
  FileCheck,
  AlertTriangle,
  ShieldAlert,
  Copy,
  Check,
  BarChart3,
  Bot,
  PlusCircle,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { ScanReport } from '../types';
import { ForensicAnalyzer } from '../services/analyzer';

interface FileScannerViewProps {
  scans: ScanReport[];
  onSaveScan: (scan: ScanReport) => void;
  onCreateCaseFromScan: (scan: ScanReport) => void;
  onConsultCopilot: (scan: ScanReport) => void;
}

export const FileScannerView: React.FC<FileScannerViewProps> = ({
  scans,
  onSaveScan,
  onCreateCaseFromScan,
  onConsultCopilot,
}) => {
  const [currentReport, setCurrentReport] = useState<ScanReport | null>(scans[0] || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const report = await ForensicAnalyzer.analyzeFile(file);
      setCurrentReport(report);
      onSaveScan(report);
    } catch (err) {
      console.error('Chyba při statické analýze souboru:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunSample = async (type: 'trojan' | 'ransomware' | 'clean') => {
    setIsAnalyzing(true);
    try {
      const report = await ForensicAnalyzer.analyzeSample(type);
      setCurrentReport(report);
      onSaveScan(report);
    } catch (err) {
      console.error('Chyba při spuštění vzorku:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <Binary className="h-4 w-4" />
            <span>STATIC ARTIFACT FORENSICS & IOC EXTRACTION (SAF)</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-100 font-sans">
            Forenzní Souborový Skener
          </h1>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Statická analýza lokálně vybraných souborů (SAF). Výpočet Shannonovy entropie, regex IOC extrakce a heuristika malware.
          </p>
        </div>

        {/* Quick Test Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] text-zinc-400 mr-1 hidden lg:inline">
            Rychlé testovací vzorky:
          </span>
          <button
            onClick={() => handleRunSample('trojan')}
            disabled={isAnalyzing}
            className="rounded border border-red-500/40 bg-red-950/20 px-2.5 py-1.5 font-mono text-xs text-red-300 hover:bg-red-950/40 disabled:opacity-50"
          >
            SharkBot Dropper
          </button>
          <button
            onClick={() => handleRunSample('ransomware')}
            disabled={isAnalyzing}
            className="rounded border border-amber-500/40 bg-amber-950/20 px-2.5 py-1.5 font-mono text-xs text-amber-300 hover:bg-amber-950/40 disabled:opacity-50"
          >
            WannaLocker APK
          </button>
          <button
            onClick={() => handleRunSample('clean')}
            disabled={isAnalyzing}
            className="rounded border border-emerald-500/40 bg-emerald-950/20 px-2.5 py-1.5 font-mono text-xs text-emerald-300 hover:bg-emerald-950/40 disabled:opacity-50"
          >
            Čistá Aplikace
          </button>
        </div>
      </div>

      {/* File Upload Dropzone (SAF Emulation) */}
      <div className="relative rounded-xl border-2 border-dashed border-zinc-800 bg-[#090b10] p-6 text-center hover:border-emerald-500/60 transition-colors">
        <input
          type="file"
          id="file-upload"
          onChange={handleFileUpload}
          disabled={isAnalyzing}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
            {isAnalyzing ? (
              <span className="flex h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            ) : (
              <Upload className="h-6 w-6" />
            )}
          </div>
          <h3 className="mt-3 font-sans text-sm font-bold text-zinc-100">
            {isAnalyzing ? 'Probíhá statická analýza a výpočet entropie...' : 'Vyberte soubor, log nebo APK k analýze (SAF)'}
          </h3>
          <p className="mt-1 font-mono text-xs text-zinc-400 max-w-md">
            Podporuje APK, DEX, SO binárky, JSON feedy, crash logy a skripty.
            Veškerá data zůstávají výhradně v paměti vašeho prohlížeče/zařízení.
          </p>
        </div>
      </div>

      {/* Analysis Result Report */}
      {currentReport && (
        <div className="space-y-6">
          {/* Verdict Banner */}
          <div
            className={`rounded-xl border p-5 sm:p-6 shadow-xl ${
              currentReport.verdict === 'ŠKODLIVÝ'
                ? 'border-red-500/60 bg-red-950/30'
                : currentReport.verdict === 'PODEZŘELÝ'
                ? 'border-amber-500/60 bg-amber-950/30'
                : 'border-emerald-500/60 bg-emerald-950/30'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-xs font-black uppercase px-2.5 py-0.5 rounded border ${
                      currentReport.verdict === 'ŠKODLIVÝ'
                        ? 'border-red-500 bg-red-900/60 text-red-200'
                        : currentReport.verdict === 'PODEZŘELÝ'
                        ? 'border-amber-500 bg-amber-900/60 text-amber-200'
                        : 'border-emerald-500 bg-emerald-900/60 text-emerald-200'
                    }`}
                  >
                    VERDIKT: {currentReport.verdict}
                  </span>
                  <span className="font-mono text-xs text-zinc-400">
                    Skóre rizika: <strong className="text-zinc-100">{currentReport.riskScore} / 100</strong>
                  </span>
                </div>
                <h2 className="mt-2 text-xl font-black text-zinc-100 font-mono">
                  {currentReport.fileName}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-3 font-mono text-xs text-zinc-400">
                  <span>Velikost: {(currentReport.fileSize / 1024).toFixed(1)} KB</span>
                  <span>·</span>
                  <span>
                    Shannonova Entropie:{' '}
                    <strong
                      className={
                        currentReport.shannonEntropy >= 7.2
                          ? 'text-red-400 font-bold'
                          : 'text-emerald-400'
                      }
                    >
                      {currentReport.shannonEntropy} / 8.00 b/B
                    </strong>
                  </span>
                  <span>·</span>
                  <span>{new Date(currentReport.timestamp).toLocaleString('cs-CZ')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onCreateCaseFromScan(currentReport)}
                  className="flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-950/30 px-3 py-2 font-mono text-xs text-amber-300 hover:bg-amber-950/50 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Převést do Incident Case</span>
                </button>
                <button
                  onClick={() => onConsultCopilot(currentReport)}
                  className="flex items-center gap-1.5 rounded border border-cyan-500/40 bg-cyan-950/30 px-3 py-2 font-mono text-xs text-cyan-300 hover:bg-cyan-950/50 transition-colors"
                >
                  <Bot className="h-4 w-4" />
                  <span>Konzultovat s Copilotem</span>
                </button>
              </div>
            </div>
          </div>

          {/* Shannon Entropy Distribution Histogram */}
          <div className="rounded-xl border border-zinc-800 bg-[#090b10] p-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-cyan-400" />
                <h3 className="font-mono text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Shannonův Entropický Profil (0.00 až 8.00 bitů / bajt)
                </h3>
              </div>
              <span className="font-mono text-[11px] text-zinc-400">
                Kritický práh obfuskace: <strong>7.20 b/B</strong>
              </span>
            </div>

            {/* Visual Histogram */}
            <div className="mt-4">
              <div className="flex items-end gap-1 h-32 w-full pt-4 pb-1">
                {currentReport.entropyDistribution.length === 0 ? (
                  <div className="w-full flex items-center justify-center text-zinc-500 font-mono text-xs">
                    Entropie vypočtena z jednoho bloku.
                  </div>
                ) : (
                  currentReport.entropyDistribution.map((chunk, idx) => {
                    const heightPercent = Math.min(100, (chunk.entropy / 8.0) * 100);
                    const isHigh = chunk.entropy >= 7.2;
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center group relative h-full justify-end"
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-7 hidden group-hover:flex bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-200 z-10 whitespace-nowrap shadow-md">
                          Offset: {chunk.offset} B | H: {chunk.entropy}
                        </div>
                        <div
                          className={`w-full rounded-t transition-all ${
                            isHigh ? 'bg-red-500 shadow-sm shadow-red-500/50' : 'bg-emerald-500/80'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                <span>0 B (Začátek souboru)</span>
                <span className="text-red-400">--- Práh zabaleného kódu (7.20) ---</span>
                <span>{(currentReport.fileSize / 1024).toFixed(0)} KB (Konec souboru)</span>
              </div>
            </div>
          </div>

          {/* Heuristic Detections & Mapped Techniques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Heuristics list */}
            <div className="rounded-xl border border-zinc-800 bg-[#090b10] p-5">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h3 className="font-mono text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Nalezené Heuristické Příznaky ({currentReport.heuristicFlags.length})
                </h3>
              </div>

              {currentReport.heuristicFlags.length === 0 ? (
                <div className="py-8 text-center font-mono text-xs text-zinc-500">
                  Nebyly nalezeny žádné známé zlomyslné heuristické signatury.
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {currentReport.heuristicFlags.map((flag) => (
                    <div
                      key={flag.id}
                      className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-zinc-100">
                          {flag.name}
                        </span>
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold ${
                            flag.severity === 'Critical'
                              ? 'border-red-500/40 bg-red-950/30 text-red-400'
                              : flag.severity === 'High'
                              ? 'border-amber-500/40 bg-amber-950/30 text-amber-400'
                              : 'border-blue-500/40 bg-blue-950/30 text-blue-400'
                          }`}
                        >
                          {flag.severity}
                        </span>
                      </div>
                      <p className="mt-1 font-sans text-xs text-zinc-300 leading-relaxed">
                        {flag.description}
                      </p>
                      {flag.evidence.length > 0 && (
                        <div className="mt-2 font-mono text-[11px] text-zinc-400 bg-zinc-950/60 p-1.5 rounded border border-zinc-800">
                          Důkazy: {flag.evidence.join(' · ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Extracted IOCs */}
            <div className="rounded-xl border border-zinc-800 bg-[#090b10] p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <FileCheck className="h-4 w-4 text-emerald-400" />
                <h3 className="font-mono text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Extrahované Indikátory Kompromitace (IOCs)
                </h3>
              </div>

              {/* Hashes */}
              <div>
                <span className="font-mono text-[11px] text-zinc-400 uppercase font-bold block mb-1">
                  SHA-256 Hash:
                </span>
                <div className="flex items-center justify-between rounded bg-zinc-900/80 p-2 font-mono text-xs text-zinc-200 border border-zinc-800">
                  <span className="truncate">{currentReport.iocs.sha256[0]}</span>
                  <button
                    onClick={() => copyToClipboard(currentReport.iocs.sha256[0], 'sha256')}
                    className="ml-2 text-zinc-400 hover:text-white"
                  >
                    {copiedKey === 'sha256' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Network IPs & Domains */}
              <div className="space-y-2">
                <span className="font-mono text-[11px] text-zinc-400 uppercase font-bold block">
                  Zachycené IP Adresy & C2 Domény:
                </span>
                {currentReport.iocs.ipv4.length === 0 && currentReport.iocs.domains.length === 0 ? (
                  <div className="font-mono text-xs text-zinc-500">Žádné síťové IOC nenalezeny.</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {currentReport.iocs.ipv4.map((ip) => (
                      <span
                        key={ip}
                        className="font-mono text-xs bg-red-950/40 border border-red-500/30 px-2 py-0.5 rounded text-red-300 font-semibold"
                      >
                        IP: {ip}
                      </span>
                    ))}
                    {currentReport.iocs.domains.map((dom) => (
                      <span
                        key={dom}
                        className="font-mono text-xs bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded text-purple-300 font-semibold"
                      >
                        {dom}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Android Package Names */}
              <div className="space-y-2">
                <span className="font-mono text-[11px] text-zinc-400 uppercase font-bold block">
                  Detekované Balíčky (Package Names):
                </span>
                {currentReport.iocs.packages.length === 0 ? (
                  <div className="font-mono text-xs text-zinc-500">Žádné balíčky nenalezeny.</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {currentReport.iocs.packages.map((pkg) => (
                      <span
                        key={pkg}
                        className="font-mono text-xs bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded text-cyan-300"
                      >
                        {pkg}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Mapped Techniques */}
              <div className="pt-2 border-t border-zinc-800">
                <span className="font-mono text-[11px] text-zinc-400 uppercase font-bold block mb-1">
                  Korelace s MITRE ATT&CK Mobile:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentReport.mappedTechniques.map((tid) => (
                    <span
                      key={tid}
                      className="font-mono text-xs bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded text-emerald-300 font-bold"
                    >
                      {tid}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
