export type TacticType =
  | 'Initial Access'
  | 'Execution'
  | 'Persistence'
  | 'Privilege Escalation'
  | 'Defense Evasion'
  | 'Credential Access'
  | 'Discovery'
  | 'Lateral Movement'
  | 'Collection'
  | 'Command and Control'
  | 'Exfiltration'
  | 'Impact'
  | 'Network Effects'
  | 'Remote Service Effects';

export type PlatformType = 'Android' | 'iOS' | 'Generic';

export interface MitreTechnique {
  id: string; // e.g. T1407
  name: string;
  tactic: TacticType;
  platforms: PlatformType[];
  description: string;
  mitigations: string[];
  detection: string;
  isPostExploit: boolean;
  hasMitigation: boolean;
  hasDetection: boolean;
}

export type CaseStatus =
  | 'New'
  | 'Triage'
  | 'Containment'
  | 'Eradication'
  | 'Recovery'
  | 'Closed';

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export interface CaseTimelineEvent {
  id: string;
  timestamp: string;
  author: string;
  action: string;
  notes?: string;
}

export interface IncidentCase {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
  associatedTechniques: string[]; // Technique IDs
  artifacts: string[]; // Filenames or hashes
  timeline: CaseTimelineEvent[];
}

export interface PlaybookStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  mitigationRef?: string;
}

export interface Playbook {
  id: string;
  title: string;
  techniqueId: string;
  techniqueName: string;
  description: string;
  steps: PlaybookStep[];
  updatedAt: string;
}

export type CoverageStatus = 'PASS' | 'FAIL' | 'UNTESTED';

export interface ValidationTest {
  id: string;
  techniqueId: string;
  techniqueName: string;
  tactic: TacticType;
  platform: PlatformType;
  testName: string;
  testProcedure: string;
  status: CoverageStatus;
  lastTested?: string;
  testerNotes?: string;
}

export interface ThreatIntelItem {
  id: string;
  title: string;
  iocType: 'hash' | 'ip' | 'domain' | 'package' | 'url';
  value: string;
  threatActor?: string;
  campaign?: string;
  confidence: 'High' | 'Medium' | 'Low';
  associatedTechnique?: string;
  description: string;
  firstSeen: string;
  tags: string[];
}

export interface IocExtractionResult {
  sha256: string[];
  md5: string[];
  ipv4: string[];
  domains: string[];
  urls: string[];
  emails: string[];
  packages: string[];
}

export interface HeuristicFlag {
  id: string;
  name: string;
  category: 'Keylogger' | 'Accessibility Abuse' | 'Device Admin / Ransom' | 'Exfiltration' | 'Obfuscation' | 'Dangerous Permission';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  evidence: string[];
  techniqueId?: string;
}

export interface EntropyChunk {
  offset: number;
  entropy: number;
}

export interface ScanReport {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  timestamp: string;
  shannonEntropy: number;
  entropyDistribution: EntropyChunk[];
  iocs: IocExtractionResult;
  heuristicFlags: HeuristicFlag[];
  verdict: 'ČISTÝ' | 'PODEZŘELÝ' | 'ŠKODLIVÝ';
  riskScore: number; // 0 - 100
  mappedTechniques: string[];
  rawSummary: string;
}

export type MoEExpert = 'Threat Analyst' | 'IR Coach' | 'Code Auditor' | 'ATT&CK Navigator';

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  expert?: MoEExpert;
  content: string;
  timestamp: string;
}

export interface EthicalLesson {
  id: string;
  category: 'CEH' | 'OWASP MASVS' | 'Incident Response' | 'Threat Hunting';
  title: string;
  summary: string;
  ethicalNotice: string;
  contentMarkdown: string;
  defensiveChecklist: string[];
}

export interface AppSettings {
  language: 'cs' | 'en';
  deviceModel: string;
  customApiKey: string;
  customApiEndpoint: string;
  customModelName: string;
  useBuiltinAi: boolean;
  viewportMode: 'mobile' | 'desktop'; // Mobile frame (Infinix Hot 50 Pro Plus) vs full desktop
}
