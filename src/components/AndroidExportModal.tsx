import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileCode,
  Terminal,
  Smartphone,
  ShieldCheck,
  Folder,
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, AndroidSourceFile } from '../data/androidProjectFiles';

interface AndroidExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidExportModal: React.FC<AndroidExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<AndroidSourceFile>(
    ANDROID_PROJECT_FILES[0]
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCurrent = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.path.split('/').pop() || 'source.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllZip = () => {
    // Generate text bundle containing all files
    let bundle = `=================================================================\n`;
    bundle += `AEGIS MOBILE COMMAND CENTER — ANDROID 15 PROJECT BUNDLE\n`;
    bundle += `Target Device: Infinix Hot 50 Pro Plus (X6880) - aarch64\n`;
    bundle += `Generated At: ${new Date().toISOString()}\n`;
    bundle += `=================================================================\n\n`;

    ANDROID_PROJECT_FILES.forEach((f) => {
      bundle += `\n#################################################################\n`;
      bundle += `FILE: ${f.path}\n`;
      bundle += `DESCRIPTION: ${f.description}\n`;
      bundle += `#################################################################\n\n`;
      bundle += f.content;
      bundle += `\n\n`;
    });

    const blob = new Blob([bundle], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis-mobile-android15-source-bundle.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md">
      <div className="flex h-full max-h-[90vh] w-full max-w-5xl flex-col rounded-xl border border-zinc-800 bg-[#090b10] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded border border-emerald-500/40 bg-emerald-950/40 text-emerald-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 font-sans">
                Aegis Mobile — Nativní Android 15 Zdrojové Kódy
              </h2>
              <p className="font-mono text-xs text-zinc-400">
                Kotlin + Jetpack Compose + Room SQLite + Hilt DI pro Infinix Hot 50 Pro+ (X6880)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAllZip}
              className="flex items-center gap-1.5 rounded bg-emerald-500 px-3 py-1.5 font-mono text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Stáhnout Všechny Kódy</span>
            </button>
            <button
              onClick={onClose}
              className="rounded p-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Note on APK compilation */}
        <div className="border-b border-zinc-800 bg-emerald-950/20 px-5 py-2.5 font-mono text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>
              <strong>Architektura a sestavení:</strong> arm64-v8a, targetSdk 35. Připraveno pro okamžité spuštění příkazu{' '}
              <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-emerald-200">
                ./gradlew assembleRelease
              </code>
            </span>
          </div>
        </div>

        {/* Main Content: File Explorer & Code Preview */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* File Tree (Left) */}
          <div className="md:col-span-4 border-r border-zinc-800 bg-zinc-950/60 p-3 overflow-y-auto space-y-1 font-mono text-xs">
            <div className="px-2 py-1 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Projektové Soubory ({ANDROID_PROJECT_FILES.length})
            </div>

            {ANDROID_PROJECT_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full flex items-center gap-2 rounded px-2.5 py-2 text-left transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <FileCode className="h-4 w-4 shrink-0 text-cyan-400" />
                  <span className="truncate">{file.path}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer (Right) */}
          <div className="md:col-span-8 flex flex-col bg-[#090b10] overflow-hidden">
            {/* Viewer Toolbar */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5 bg-zinc-950/40 font-mono text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="text-zinc-500">Cesta:</span>
                <strong className="text-emerald-400">{selectedFile.path}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-zinc-300 hover:text-white"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copied ? 'Zkopírováno' : 'Kopírovat'}</span>
                </button>
                <button
                  onClick={handleDownloadCurrent}
                  className="flex items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-zinc-300 hover:text-white"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Stáhnout</span>
                </button>
              </div>
            </div>

            {/* Description bar */}
            <div className="border-b border-zinc-800/80 bg-zinc-900/30 px-4 py-1.5 font-sans text-xs text-zinc-400">
              {selectedFile.description}
            </div>

            {/* Source Code */}
            <pre className="flex-1 overflow-auto p-4 font-mono text-xs text-zinc-200 leading-relaxed bg-[#06070a]">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
