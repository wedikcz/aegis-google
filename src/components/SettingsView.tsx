import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  Smartphone,
  Shield,
  Key,
  Database,
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertTriangle,
  Code2,
} from 'lucide-react';
import { AppSettings } from '../types';
import { StorageService } from '../services/storage';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenAndroidExport: () => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onOpenAndroidExport,
  onResetAllData,
}) => {
  const [apiKey, setApiKey] = useState(settings.customApiKey);
  const [endpoint, setEndpoint] = useState(settings.customApiEndpoint);
  const [modelName, setModelName] = useState(settings.customModelName);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAi = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      ...settings,
      customApiKey: apiKey,
      customApiEndpoint: endpoint,
      customModelName: modelName,
    };
    onUpdateSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportDataBackup = () => {
    const json = StorageService.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis_mobile_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportDataBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importData(content);
      if (success) {
        window.location.reload();
      } else {
        alert('Neplatný formát záložního souboru JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <Settings className="h-4 w-4" />
            <span>SYSTEM ARCHITECTURE & HARDWARE PROFILE</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-100 font-sans">
            Konfigurace Systému & Zařízení
          </h1>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Specifikace Infinix Hot 50 Pro+ (X6880), správa Room DB záloh a napojení AI modelů.
          </p>
        </div>

        <button
          onClick={onOpenAndroidExport}
          className="flex items-center gap-2 rounded bg-emerald-500 px-3.5 py-2 font-mono text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-950/40"
        >
          <Code2 className="h-4 w-4" />
          <span>Zdrojové Kódy Android Studia</span>
        </button>
      </div>

      {/* Target Device Profile Card */}
      <div className="rounded-xl border border-zinc-800 bg-[#090b10] p-5 space-y-4">
        <h2 className="font-mono text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-emerald-400" />
          <span>Cílové Zařízení (Hardware Profile)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
            <span className="text-zinc-500 text-[10px] uppercase block">Model Telefonu</span>
            <strong className="text-zinc-200 text-sm">Infinix Hot 50 Pro Plus (X6880)</strong>
          </div>

          <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
            <span className="text-zinc-500 text-[10px] uppercase block">Architektura CPU / ABI</span>
            <strong className="text-cyan-400 text-sm">aarch64 (arm64-v8a)</strong>
          </div>

          <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
            <span className="text-zinc-500 text-[10px] uppercase block">Displej & Obnovovací frekvence</span>
            <strong className="text-purple-400 text-sm">6.78&quot; AMOLED, 120 Hz, 1080×2436</strong>
          </div>

          <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
            <span className="text-zinc-500 text-[10px] uppercase block">Operační Systém</span>
            <strong className="text-emerald-400 text-sm">Android 15 (Vanilla Ice Cream)</strong>
          </div>

          <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
            <span className="text-zinc-500 text-[10px] uppercase block">Target / Min SDK</span>
            <strong className="text-zinc-200 text-sm">targetSdk: 35 | minSdk: 31</strong>
          </div>

          <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
            <span className="text-zinc-500 text-[10px] uppercase block">Zabezpečení Systému</span>
            <strong className="text-amber-400 text-sm">SELinux Enforcing / W^X ART</strong>
          </div>
        </div>
      </div>

      {/* Permissions Transparency Report */}
      <div className="rounded-xl border border-zinc-800 bg-[#090b10] p-5 space-y-3 font-mono text-xs">
        <h2 className="font-mono text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <Shield className="h-4 w-4 text-cyan-400" />
          <span>Odůvodnění Android Oprávnění (Permissions Audit)</span>
        </h2>
        <div className="space-y-2">
          <div className="rounded border border-zinc-800/80 bg-zinc-900/30 p-2.5">
            <strong className="text-emerald-400">Storage Access Framework (SAF):</strong>{' '}
            <span className="text-zinc-300 font-sans">
              Aplikace záměrně nevyžaduje celosystémové právo MANAGE_EXTERNAL_STORAGE ani READ_MEDIA.
              Uživatel si sám volí soubor/APK k analýze skrze systémový SAF dialog. Nulové riziko sledování.
            </span>
          </div>
          <div className="rounded border border-zinc-800/80 bg-zinc-900/30 p-2.5">
            <strong className="text-cyan-400">android.permission.INTERNET:</strong>{' '}
            <span className="text-zinc-300 font-sans">
              Volitelné oprávnění využité výhradně pro synchronizaci Threat Intel webhooků zadaných uživatelem
              a dotazování uživatelem nastaveného AI API endpointu. Aplikace neobsahuje žádné Google Analytics, Crashlytics ani reklamní SDK!
            </span>
          </div>
        </div>
      </div>

      {/* AI Copilot Endpoint Configuration */}
      <div className="rounded-xl border border-zinc-800 bg-[#090b10] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="font-mono text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Key className="h-4 w-4 text-purple-400" />
            <span>AI Copilot: Konfigurace Vlastního API Klíče</span>
          </h2>
          {savedSuccess && (
            <span className="flex items-center gap-1 font-mono text-xs text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              <span>Nastavení uloženo!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveAi} className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">
              API Endpoint (OpenAI-compatible / OpenRouter / DeepSeek / Ollama)
            </label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 p-2.5 text-zinc-200 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1">
                API Klíč (ukládá se lokálně v šifrovaném formátu)
              </label>
              <input
                type="password"
                placeholder="sk-or-v1-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 p-2.5 text-zinc-200 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Model Name</label>
              <input
                type="text"
                placeholder="deepseek/deepseek-chat"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 p-2.5 text-zinc-200 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-500 transition-colors"
            >
              Uložit API Klíč
            </button>
          </div>
        </form>
      </div>

      {/* Database Backup & Maintenance */}
      <div className="rounded-xl border border-zinc-800 bg-[#090b10] p-5 space-y-4">
        <h2 className="font-mono text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <Database className="h-4 w-4 text-emerald-400" />
          <span>Lokální Databáze (Room Offline-First) & Zálohy</span>
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportDataBackup}
            className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800/80 px-3.5 py-2 font-mono text-xs text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Exportovat Zálohu (JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800/80 px-3.5 py-2 font-mono text-xs text-zinc-200 hover:bg-zinc-700 transition-colors cursor-pointer">
            <Upload className="h-4 w-4 text-cyan-400" />
            <span>Obnovit ze Zálohy</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportDataBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (confirm('Opravdu chcete resetovat všechny záznamy do výchozího stavu?')) {
                onResetAllData();
              }
            }}
            className="flex items-center gap-1.5 rounded border border-red-500/30 bg-red-950/20 px-3.5 py-2 font-mono text-xs text-red-300 hover:bg-red-950/40 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset do Výchozího Stavu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
