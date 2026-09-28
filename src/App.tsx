import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav, MainTab, OperationsSubTab } from './components/BottomNav';
import { DeviceHudBanner } from './components/DeviceHudBanner';
import { DashboardView } from './components/DashboardView';
import { AttackCatalogView } from './components/AttackCatalogView';
import { CasesView } from './components/CasesView';
import { PlaybooksView } from './components/PlaybooksView';
import { CoverageView } from './components/CoverageView';
import { ThreatIntelView } from './components/ThreatIntelView';
import { FileScannerView } from './components/FileScannerView';
import { AiCopilotView } from './components/AiCopilotView';
import { LearningLabView } from './components/LearningLabView';
import { SettingsView } from './components/SettingsView';
import { AndroidExportModal } from './components/AndroidExportModal';

import {
  IncidentCase,
  Playbook,
  ValidationTest,
  ThreatIntelItem,
  ScanReport,
  AppSettings,
  CopilotMessage,
  MitreTechnique,
} from './types';
import { StorageService } from './services/storage';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
  const [operationsSubTab, setOperationsSubTab] = useState<OperationsSubTab>('cases');
  const [viewportMode, setViewportMode] = useState<'mobile' | 'desktop'>('desktop');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activePlaybookId, setActivePlaybookId] = useState<string | undefined>(undefined);

  // Data Store State (Offline-first Room-equivalent)
  const [cases, setCases] = useState<IncidentCase[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [tests, setTests] = useState<ValidationTest[]>([]);
  const [intel, setIntel] = useState<ThreatIntelItem[]>([]);
  const [scans, setScans] = useState<ScanReport[]>([]);
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());

  // Copilot Chat State
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      expert: 'Threat Analyst',
      content: `Vítejte v Aegis Mobile Command Center pro Android 15 (Infinix Hot 50 Pro+). Jsem váš MoE defenzivní asistent. Můžete se mnou konzultovat analýzu zachycených souborů, pravidla MITRE ATT&CK Mobile nebo postupy pro izolaci incidentu.`,
      timestamp: new Date().toISOString(),
    },
  ]);

  // Load from local Room-equivalent storage on mount
  useEffect(() => {
    setCases(StorageService.getCases());
    setPlaybooks(StorageService.getPlaybooks());
    setTests(StorageService.getValidationTests());
    setIntel(StorageService.getThreatIntel());
    setScans(StorageService.getScanReports());
    const storedSettings = StorageService.getSettings();
    setSettings(storedSettings);
    setViewportMode(storedSettings.viewportMode || 'desktop');
  }, []);

  // --- Handlers for Cases ---
  const handleAddCase = (newCase: IncidentCase) => {
    StorageService.addCase(newCase);
    setCases(StorageService.getCases());
  };

  const handleUpdateCase = (updated: IncidentCase) => {
    StorageService.updateCase(updated);
    setCases(StorageService.getCases());
  };

  const handleDeleteCase = (id: string) => {
    StorageService.deleteCase(id);
    setCases(StorageService.getCases());
  };

  // --- Handlers for Playbooks ---
  const handleAddPlaybook = (newPb: Playbook) => {
    StorageService.addPlaybook(newPb);
    setPlaybooks(StorageService.getPlaybooks());
  };

  const handleUpdatePlaybook = (updated: Playbook) => {
    StorageService.updatePlaybook(updated);
    setPlaybooks(StorageService.getPlaybooks());
  };

  // --- Handlers for Validation Tests ---
  const handleUpdateTest = (updated: ValidationTest) => {
    StorageService.updateValidationTest(updated);
    setTests(StorageService.getValidationTests());
  };

  const handleSeedMissingTests = (newTests: ValidationTest[]) => {
    const combined = [...tests, ...newTests];
    StorageService.saveValidationTests(combined);
    setTests(combined);
  };

  // --- Handlers for Threat Intel ---
  const handleAddIntel = (item: ThreatIntelItem) => {
    StorageService.addThreatIntel(item);
    setIntel(StorageService.getThreatIntel());
  };

  const handleDeleteIntel = (id: string) => {
    StorageService.deleteThreatIntel(id);
    setIntel(StorageService.getThreatIntel());
  };

  // --- Handlers for Scanner ---
  const handleSaveScan = (scan: ScanReport) => {
    StorageService.saveScanReport(scan);
    setScans(StorageService.getScanReports());
  };

  // --- Cross-module Action Handlers ---
  const handleCreateCaseFromScan = (scan: ScanReport) => {
    const caseNumber = `INC-2026-${String(cases.length + 101).padStart(3, '0')}`;
    const newCase: IncidentCase = {
      id: `case-${Date.now()}`,
      caseNumber,
      title: `Incident ze skenu: ${scan.fileName} (${scan.verdict})`,
      description: `Automaticky vytvořeno z Forenzního Skeneru. Entropie: ${scan.shannonEntropy} b/B. Skóre rizika: ${scan.riskScore}/100. Nalezeno ${scan.heuristicFlags.length} heuristických příznaků.`,
      severity: scan.riskScore >= 70 ? 'Critical' : scan.riskScore >= 35 ? 'High' : 'Medium',
      status: 'Triage',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      associatedTechniques: scan.mappedTechniques,
      artifacts: [scan.fileName, scan.iocs.sha256[0], ...scan.iocs.ipv4],
      timeline: [
        {
          id: `t-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: 'Aegis File Scanner',
          action: `Záchyt souboru a vyhodnocení verdiktu ${scan.verdict}.`,
        },
      ],
    };
    handleAddCase(newCase);
    setActiveTab('operations');
    setOperationsSubTab('cases');
  };

  const handleConsultCopilotWithScan = (scan: ScanReport) => {
    const prompt = `Proveď forenzní rozbor výsledků statické analýzy artefaktu "${scan.fileName}":
- Shannonova entropie: ${scan.shannonEntropy} / 8.00 b/B
- Verdikt skeneru: ${scan.verdict} (skóre ${scan.riskScore}/100)
- Nalezené heuristiky: ${scan.heuristicFlags.map((f) => f.name).join(', ') || 'Žádné'}
- Extrahovaná C2 a síťová IOC: ${[...scan.iocs.ipv4, ...scan.iocs.domains].join(', ') || 'Žádné'}
- Mapped ATT&CK: ${scan.mappedTechniques.join(', ')}

Jaké konkrétní containment kroky a techniky bys doporučil pro Android 15?`;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    };

    setCopilotMessages((prev) => [...prev, userMsg]);
    setActiveTab('copilot');
  };

  const handleCreatePlaybookFromTechnique = (tech: MitreTechnique) => {
    const steps = tech.mitigations.map((m, idx) => ({
      id: `step-${Date.now()}-${idx}`,
      title: m,
      description: `Mitigační kontrolní postup doporučený pro techniku ${tech.id}.`,
      completed: false,
      mitigationRef: tech.id,
    }));

    const pb: Playbook = {
      id: `pb-${Date.now()}`,
      title: `Obrana proti ${tech.id}: ${tech.name}`,
      techniqueId: tech.id,
      techniqueName: tech.name,
      description: tech.description,
      steps:
        steps.length > 0
          ? steps
          : [
              {
                id: `step-1`,
                title: 'Audit systémových nastavení a oprávnění',
                description: 'Prověřit soulad s bezpečnostními politikami Android 15.',
                completed: false,
              },
            ],
      updatedAt: new Date().toISOString(),
    };

    handleAddPlaybook(pb);
    setActivePlaybookId(pb.id);
    setActiveTab('operations');
    setOperationsSubTab('playbooks');
  };

  const handleCreateCaseFromTechnique = (tech: MitreTechnique) => {
    const caseNumber = `INC-2026-${String(cases.length + 101).padStart(3, '0')}`;
    const newCase: IncidentCase = {
      id: `case-${Date.now()}`,
      caseNumber,
      title: `Podezření na aktivitu ${tech.id}: ${tech.name}`,
      description: `Založeno z katalogu MITRE ATT&CK Mobile. Taktika: ${tech.tactic}. ${tech.description}`,
      severity: tech.isPostExploit ? 'High' : 'Medium',
      status: 'New',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      associatedTechniques: [tech.id],
      artifacts: [],
      timeline: [
        {
          id: `t-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: 'SOC Operátor',
          action: `Založen incident na základě identifikace techniky ${tech.id}.`,
        },
      ],
    };
    handleAddCase(newCase);
    setActiveTab('operations');
    setOperationsSubTab('cases');
  };

  const handleAskCopilotAboutTechnique = (tech: MitreTechnique) => {
    const prompt = `Vysvětli mi do hloubky techniku ${tech.id} (${tech.name}) z matice MITRE ATT&CK Mobile.
Jakým způsobem útočníci zneužívají Android API a jaké konkrétní defenzivní mechanismy máme v Androidu 15 (včetně SELinux a Restricted Settings) pro její neutralizaci?`;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    };

    setCopilotMessages((prev) => [...prev, userMsg]);
    setActiveTab('copilot');
  };

  const handleResetAllData = () => {
    StorageService.resetToDefaults();
    setCases(StorageService.getCases());
    setPlaybooks(StorageService.getPlaybooks());
    setTests(StorageService.getValidationTests());
    setIntel(StorageService.getThreatIntel());
    setScans(StorageService.getScanReports());
    setSettings(StorageService.getSettings());
  };

  // Render view router
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            cases={cases}
            tests={tests}
            intel={intel}
            scans={scans}
            onNavigate={(tab, subTab) => {
              setActiveTab(tab);
              if (subTab) setOperationsSubTab(subTab);
            }}
            onOpenNewCase={() => {
              setActiveTab('operations');
              setOperationsSubTab('cases');
            }}
          />
        );

      case 'attack':
        return (
          <AttackCatalogView
            playbooks={playbooks}
            onCreatePlaybookFromTechnique={handleCreatePlaybookFromTechnique}
            onCreateCaseFromTechnique={handleCreateCaseFromTechnique}
            onAskCopilot={handleAskCopilotAboutTechnique}
            onNavigateToPlaybook={(playbookId) => {
              setActivePlaybookId(playbookId);
              setActiveTab('operations');
              setOperationsSubTab('playbooks');
            }}
          />
        );

      case 'operations':
        switch (operationsSubTab) {
          case 'cases':
            return (
              <CasesView
                cases={cases}
                onAddCase={handleAddCase}
                onUpdateCase={handleUpdateCase}
                onDeleteCase={handleDeleteCase}
              />
            );
          case 'playbooks':
            return (
              <PlaybooksView
                playbooks={playbooks}
                onUpdatePlaybook={handleUpdatePlaybook}
                onAddPlaybook={handleAddPlaybook}
                initialSelectedId={activePlaybookId}
              />
            );
          case 'coverage':
            return (
              <CoverageView
                tests={tests}
                onUpdateTest={handleUpdateTest}
                onSeedMissingTests={handleSeedMissingTests}
              />
            );
          case 'intel':
            return (
              <ThreatIntelView
                intel={intel}
                onAddIntel={handleAddIntel}
                onDeleteIntel={handleDeleteIntel}
              />
            );
          default:
            return null;
        }

      case 'scanner':
        return (
          <FileScannerView
            scans={scans}
            onSaveScan={handleSaveScan}
            onCreateCaseFromScan={handleCreateCaseFromScan}
            onConsultCopilot={handleConsultCopilotWithScan}
          />
        );

      case 'copilot':
        return (
          <AiCopilotView
            messages={copilotMessages}
            onSendMessage={(msg) => setCopilotMessages((prev) => [...prev, msg])}
            onClearChat={() => setCopilotMessages([])}
            onOpenSettings={() => setActiveTab('settings')}
          />
        );

      case 'lab':
        return <LearningLabView />;

      case 'settings':
        return (
          <SettingsView
            settings={settings}
            onUpdateSettings={(newSettings) => {
              StorageService.saveSettings(newSettings);
              setSettings(newSettings);
            }}
            onOpenAndroidExport={() => setIsExportModalOpen(true)}
            onResetAllData={handleResetAllData}
          />
        );

      default:
        return null;
    }
  };

  const activeCaseCount = cases.filter((c) => c.status !== 'Closed').length;

  return (
    <div className="min-h-screen bg-[#06070a] text-zinc-100 flex flex-col font-sans hud-grid selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Target Device Status Bar */}
      <DeviceHudBanner compact={viewportMode === 'mobile'} />

      {/* Main Tactical Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t as MainTab)}
        viewportMode={viewportMode}
        setViewportMode={(mode) => {
          setViewportMode(mode);
          const updated = { ...settings, viewportMode: mode };
          setSettings(updated);
          StorageService.saveSettings(updated);
        }}
        onOpenAndroidExport={() => setIsExportModalOpen(true)}
      />

      {/* Viewport Container: Either full screen or Infinix Hot 50 Pro+ 6.78" phone frame simulation */}
      <main className="flex-1 flex justify-center py-4 px-2 sm:px-6">
        {viewportMode === 'mobile' ? (
          /* Phone Frame Container simulating 6.78" AMOLED */
          <div className="relative w-full max-w-[440px] rounded-[36px] border-4 border-zinc-800 bg-[#06070a] shadow-2xl overflow-hidden flex flex-col min-h-[820px] max-h-[92vh]">
            {/* Phone speaker & camera notch */}
            <div className="h-6 bg-zinc-950 flex items-center justify-center shrink-0 border-b border-zinc-900">
              <div className="h-2.5 w-16 bg-zinc-800 rounded-full" />
            </div>

            {/* Scrollable Phone Screen */}
            <div className="flex-1 overflow-y-auto px-3.5 py-4">
              {renderCurrentView()}
            </div>
          </div>
        ) : (
          /* Full Desktop Dual-Pane SOC Command View */
          <div className="w-full max-w-7xl">{renderCurrentView()}</div>
        )}
      </main>

      {/* Tactical Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        operationsSubTab={operationsSubTab}
        setOperationsSubTab={setOperationsSubTab}
        activeCaseCount={activeCaseCount}
      />

      {/* Android Studio Source Code & Release APK Export Modal */}
      <AndroidExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
