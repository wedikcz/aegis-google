import {
  IncidentCase,
  Playbook,
  ValidationTest,
  ThreatIntelItem,
  ScanReport,
  AppSettings,
} from '../types';
import {
  INITIAL_CASES,
  INITIAL_PLAYBOOKS,
  INITIAL_VALIDATION_TESTS,
  INITIAL_THREAT_INTEL,
} from '../data/initialData';

const STORAGE_KEYS = {
  CASES: 'aegis_cases_v1',
  PLAYBOOKS: 'aegis_playbooks_v1',
  TESTS: 'aegis_validation_tests_v1',
  INTEL: 'aegis_threat_intel_v1',
  SCANS: 'aegis_scan_reports_v1',
  SETTINGS: 'aegis_settings_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'cs',
  deviceModel: 'Infinix Hot 50 Pro Plus (X6880) — Android 15 (API 35)',
  customApiKey: '',
  customApiEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
  customModelName: 'deepseek/deepseek-chat',
  useBuiltinAi: true,
  viewportMode: 'desktop',
};

export class StorageService {
  // --- CASES ---
  static getCases(): IncidentCase[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CASES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
        return INITIAL_CASES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CASES;
    }
  }

  static saveCases(cases: IncidentCase[]): void {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
  }

  static addCase(newCase: IncidentCase): void {
    const list = this.getCases();
    list.unshift(newCase);
    this.saveCases(list);
  }

  static updateCase(updatedCase: IncidentCase): void {
    const list = this.getCases().map((c) => (c.id === updatedCase.id ? updatedCase : c));
    this.saveCases(list);
  }

  static deleteCase(id: string): void {
    const list = this.getCases().filter((c) => c.id !== id);
    this.saveCases(list);
  }

  // --- PLAYBOOKS ---
  static getPlaybooks(): Playbook[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYBOOKS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PLAYBOOKS, JSON.stringify(INITIAL_PLAYBOOKS));
        return INITIAL_PLAYBOOKS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PLAYBOOKS;
    }
  }

  static savePlaybooks(playbooks: Playbook[]): void {
    localStorage.setItem(STORAGE_KEYS.PLAYBOOKS, JSON.stringify(playbooks));
  }

  static updatePlaybook(updatedPlaybook: Playbook): void {
    const list = this.getPlaybooks().map((p) => (p.id === updatedPlaybook.id ? updatedPlaybook : p));
    this.savePlaybooks(list);
  }

  static addPlaybook(newPlaybook: Playbook): void {
    const list = this.getPlaybooks();
    list.unshift(newPlaybook);
    this.savePlaybooks(list);
  }

  // --- VALIDATION TESTS (COVERAGE) ---
  static getValidationTests(): ValidationTest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TESTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(INITIAL_VALIDATION_TESTS));
        return INITIAL_VALIDATION_TESTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_VALIDATION_TESTS;
    }
  }

  static saveValidationTests(tests: ValidationTest[]): void {
    localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(tests));
  }

  static updateValidationTest(updated: ValidationTest): void {
    const list = this.getValidationTests().map((t) => (t.id === updated.id ? updated : t));
    this.saveValidationTests(list);
  }

  // --- THREAT INTEL ---
  static getThreatIntel(): ThreatIntelItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INTEL);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.INTEL, JSON.stringify(INITIAL_THREAT_INTEL));
        return INITIAL_THREAT_INTEL;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_THREAT_INTEL;
    }
  }

  static saveThreatIntel(intel: ThreatIntelItem[]): void {
    localStorage.setItem(STORAGE_KEYS.INTEL, JSON.stringify(intel));
  }

  static addThreatIntel(item: ThreatIntelItem): void {
    const list = this.getThreatIntel();
    list.unshift(item);
    this.saveThreatIntel(list);
  }

  static deleteThreatIntel(id: string): void {
    const list = this.getThreatIntel().filter((i) => i.id !== id);
    this.saveThreatIntel(list);
  }

  // --- SCAN REPORTS ---
  static getScanReports(): ScanReport[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCANS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveScanReport(report: ScanReport): void {
    const list = this.getScanReports();
    list.unshift(report);
    if (list.length > 50) list.pop();
    localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(list));
  }

  static clearScanReports(): void {
    localStorage.removeItem(STORAGE_KEYS.SCANS);
  }

  // --- SETTINGS ---
  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // --- EXPORT & RESET ---
  static exportAllData(): string {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      cases: this.getCases(),
      playbooks: this.getPlaybooks(),
      tests: this.getValidationTests(),
      intel: this.getThreatIntel(),
      scans: this.getScanReports(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  }

  static importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.cases) this.saveCases(parsed.cases);
      if (parsed.playbooks) this.savePlaybooks(parsed.playbooks);
      if (parsed.tests) this.saveValidationTests(parsed.tests);
      if (parsed.intel) this.saveThreatIntel(parsed.intel);
      if (parsed.settings) this.saveSettings(parsed.settings);
      return true;
    } catch {
      return false;
    }
  }

  static resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
    localStorage.setItem(STORAGE_KEYS.PLAYBOOKS, JSON.stringify(INITIAL_PLAYBOOKS));
    localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(INITIAL_VALIDATION_TESTS));
    localStorage.setItem(STORAGE_KEYS.INTEL, JSON.stringify(INITIAL_THREAT_INTEL));
    localStorage.removeItem(STORAGE_KEYS.SCANS);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }
}
