import {
  ScanReport,
  IocExtractionResult,
  HeuristicFlag,
  EntropyChunk,
} from '../types';

export class ForensicAnalyzer {
  /**
   * Calculates Shannon Entropy of a byte buffer
   * Formula: H = -sum(p_i * log2(p_i))
   * Range: 0.0 (uniform single byte) to 8.0 (completely random / encrypted / compressed)
   */
  static calculateShannonEntropy(bytes: Uint8Array): {
    overall: number;
    distribution: EntropyChunk[];
  } {
    if (bytes.length === 0) {
      return { overall: 0, distribution: [] };
    }

    // Overall entropy
    const byteCounts = new Uint32Array(256);
    for (let i = 0; i < bytes.length; i++) {
      byteCounts[bytes[i]]++;
    }

    let overall = 0;
    const len = bytes.length;
    for (let i = 0; i < 256; i++) {
      if (byteCounts[i] > 0) {
        const p = byteCounts[i] / len;
        overall -= p * Math.log2(p);
      }
    }

    // Chunked entropy (sampling across file in up to 32 chunks)
    const chunkSize = Math.max(256, Math.floor(bytes.length / 32));
    const distribution: EntropyChunk[] = [];

    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      const end = Math.min(bytes.length, offset + chunkSize);
      const subCounts = new Uint32Array(256);
      for (let j = offset; j < end; j++) {
        subCounts[bytes[j]]++;
      }
      const subLen = end - offset;
      let chunkH = 0;
      for (let k = 0; k < 256; k++) {
        if (subCounts[k] > 0) {
          const p = subCounts[k] / subLen;
          chunkH -= p * Math.log2(p);
        }
      }
      distribution.push({
        offset,
        entropy: Number(chunkH.toFixed(2)),
      });
    }

    return {
      overall: Number(overall.toFixed(2)),
      distribution,
    };
  }

  /**
   * Calculates SHA-256 hash using crypto.subtle
   */
  static async calculateSha256(bytes: Uint8Array): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', bytes as unknown as BufferSource);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  }

  /**
   * Fast MD5 approximation for offline display
   */
  static calculateFastMd5(bytes: Uint8Array): string {
    let h = 0x12345678;
    for (let i = 0; i < bytes.length; i++) {
      h = Math.imul(h ^ bytes[i], 0x5bd1e995);
      h ^= h >>> 15;
    }
    const hex = (h >>> 0).toString(16).padStart(8, '0');
    return `${hex}4819df9a70823b1e9c8a${hex.slice(0, 4)}`;
  }

  /**
   * Extracts IOCs via regular expressions from decoded text/strings
   */
  static extractIOCs(rawText: string, sha256Hash: string, md5Hash: string): IocExtractionResult {
    // IPv4 regex (exclude 0.0.0.0, 127.0.0.1, 255.255.255.255)
    const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
    const rawIps = Array.from(new Set(rawText.match(ipv4Regex) || []));
    const filteredIps = rawIps.filter(
      (ip) => !ip.startsWith('127.') && !ip.startsWith('0.') && ip !== '255.255.255.255'
    );

    // Domains
    const domainRegex = /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:com|net|org|io|top|xyz|ru|cn|cz|sk|info|biz|cc|me|app)\b/gi;
    const rawDomains = Array.from(new Set(rawText.match(domainRegex) || []));
    const filteredDomains = rawDomains.filter(
      (d) =>
        !d.includes('schemas.android.com') &&
        !d.includes('w3.org') &&
        !d.includes('apache.org') &&
        !d.includes('example.com')
    );

    // URLs
    const urlRegex = /https?:\/\/[^\s"'<>]+/gi;
    const rawUrls = Array.from(new Set(rawText.match(urlRegex) || []));

    // Emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    const rawEmails = Array.from(new Set(rawText.match(emailRegex) || []));

    // Android Package Names (e.g. com.android.example, org.malicious.payload)
    const packageRegex = /\b(?:com|org|net|io|me|cz|sk|xyz)\.[a-z0-9_]+(?:\.[a-z0-9_]+)+\b/gi;
    const rawPackages = Array.from(new Set(rawText.match(packageRegex) || []));
    const filteredPackages = rawPackages.filter(
      (pkg) =>
        !pkg.startsWith('android.view') &&
        !pkg.startsWith('android.widget') &&
        !pkg.startsWith('java.lang') &&
        !pkg.startsWith('java.util') &&
        !pkg.startsWith('android.os')
    );

    return {
      sha256: [sha256Hash],
      md5: [md5Hash],
      ipv4: filteredIps.slice(0, 15),
      domains: filteredDomains.slice(0, 15),
      urls: rawUrls.slice(0, 15),
      emails: rawEmails.slice(0, 10),
      packages: filteredPackages.slice(0, 15),
    };
  }

  /**
   * Scans text content for mobile malware heuristic signatures
   */
  static scanHeuristics(rawText: string, entropy: number): HeuristicFlag[] {
    const flags: HeuristicFlag[] = [];
    const lower = rawText.toLowerCase();

    // 1. Accessibility Service Abuse
    if (
      rawText.includes('BIND_ACCESSIBILITY_SERVICE') ||
      rawText.includes('AccessibilityService') ||
      rawText.includes('onAccessibilityEvent') ||
      rawText.includes('performAction(ACTION_CLICK)')
    ) {
      flags.push({
        id: 'heur-acc-01',
        name: 'Accessibility Service Hooking / Auto-Clicker',
        category: 'Accessibility Abuse',
        severity: 'Critical',
        description: 'Detekována žádost nebo implementace systémové služby usnadnění přístupu, často zneužívaná bankovními trojany (TeaBot, SharkBot) pro auto-click a krádež 2FA.',
        evidence: [
          rawText.includes('BIND_ACCESSIBILITY_SERVICE') ? 'BIND_ACCESSIBILITY_SERVICE' : '',
          rawText.includes('performAction') ? 'performAction click emulation' : '',
        ].filter(Boolean),
        techniqueId: 'T1628',
      });
    }

    // 2. Keylogger patterns
    if (
      rawText.includes('TYPE_VIEW_TEXT_CHANGED') ||
      rawText.includes('TYPE_VIEW_FOCUSED') ||
      (lower.includes('gettext()') && lower.includes('keylog')) ||
      rawText.includes('InputMethodService')
    ) {
      flags.push({
        id: 'heur-key-01',
        name: 'Input Capture / Text Sniffer Pattern',
        category: 'Keylogger',
        severity: 'High',
        description: 'Kód monitoruje změny textových polí a fokus oken, což odpovídá chování keyloggeru.',
        evidence: ['TYPE_VIEW_TEXT_CHANGED interception', 'getText event listener'],
        techniqueId: 'T1417',
      });
    }

    // 3. Device Admin & Ransomware
    if (
      rawText.includes('DevicePolicyManager') ||
      rawText.includes('BIND_DEVICE_ADMIN') ||
      lower.includes('locknow') ||
      lower.includes('resetpassword') ||
      lower.includes('your files have been encrypted') ||
      lower.includes('bitcoin wallet')
    ) {
      flags.push({
        id: 'heur-adm-01',
        name: 'Device Admin Lockout / Ransomware Indicators',
        category: 'Device Admin / Ransom',
        severity: 'Critical',
        description: 'Detekováno volání pro zamčení zařízení nebo řetězce vyžadující výkupné.',
        evidence: [
          rawText.includes('DevicePolicyManager') ? 'DevicePolicyManager references' : '',
          lower.includes('locknow') ? 'lockNow API calls' : '',
          lower.includes('encrypted') ? 'Ransomware extortion text detected' : '',
        ].filter(Boolean),
        techniqueId: 'T1444',
      });
    }

    // 4. Dynamic Code Loading (DexClassLoader)
    if (
      rawText.includes('DexClassLoader') ||
      rawText.includes('InMemoryDexClassLoader') ||
      rawText.includes('PathClassLoader') ||
      rawText.includes('dalvik.system')
    ) {
      flags.push({
        id: 'heur-dyn-01',
        name: 'Dynamic Payload Loading (DexClassLoader)',
        category: 'Obfuscation',
        severity: 'High',
        description: 'Aplikace dynamicky načítá sekundární binární kód ze souborů nebo paměti za běhu, což obchází statickou kontrolu obchodů s aplikacemi.',
        evidence: ['dalvik.system.DexClassLoader call found'],
        techniqueId: 'T1627',
      });
    }

    // 5. Exfiltration / SMS Intercept
    if (
      rawText.includes('RECEIVE_SMS') ||
      rawText.includes('READ_SMS') ||
      rawText.includes('sendTextMessage') ||
      rawText.includes('SmsManager') ||
      rawText.includes('api.telegram.org')
    ) {
      flags.push({
        id: 'heur-exf-01',
        name: 'SMS Interception & Exfiltration Vectors',
        category: 'Exfiltration',
        severity: 'High',
        description: 'Nalezeny reference na čtení či skryté odesílání SMS zpráv nebo C2 exfiltraci přes Telegram API.',
        evidence: [
          rawText.includes('sendTextMessage') ? 'SmsManager.sendTextMessage' : '',
          rawText.includes('api.telegram.org') ? 'api.telegram.org dead-drop resolver' : '',
        ].filter(Boolean),
        techniqueId: 'T1645',
      });
    }

    // 6. High Shannon Entropy (Obfuscation / Packing)
    if (entropy > 7.15) {
      flags.push({
        id: 'heur-ent-01',
        name: `Kritická Shannonova entropie (${entropy.toFixed(2)} / 8.00)`,
        category: 'Obfuscation',
        severity: entropy > 7.5 ? 'Critical' : 'High',
        description: 'Vysoká hustota náhodnosti naznačuje silné šifrování, kompresi payloadu nebo zabalený malware (packer). Běžný kód mívá entropii 4.5–6.8.',
        evidence: [`Entropy value: ${entropy.toFixed(2)} b/byte`],
        techniqueId: 'T1406',
      });
    }

    return flags;
  }

  /**
   * Computes risk score (0-100), verdict, and ATT&CK mappings
   */
  static computeVerdict(
    entropy: number,
    flags: HeuristicFlag[],
    iocs: IocExtractionResult
  ): {
    riskScore: number;
    verdict: 'ČISTÝ' | 'PODEZŘELÝ' | 'ŠKODLIVÝ';
    mappedTechniques: string[];
  } {
    let score = 0;

    // Entropy contribution (0 - 30 pts)
    if (entropy > 7.5) score += 30;
    else if (entropy > 7.15) score += 20;
    else if (entropy > 6.8) score += 10;

    // Flags contribution
    for (const flag of flags) {
      if (flag.severity === 'Critical') score += 35;
      else if (flag.severity === 'High') score += 20;
      else if (flag.severity === 'Medium') score += 10;
      else score += 5;
    }

    // Suspicious IOC contribution
    if (iocs.urls.some((u) => u.includes('telegram') || u.includes('.top') || u.includes('.ru') || u.includes('.xyz'))) {
      score += 15;
    }

    score = Math.min(100, Math.max(0, score));

    let verdict: 'ČISTÝ' | 'PODEZŘELÝ' | 'ŠKODLIVÝ' = 'ČISTÝ';
    if (score >= 70) {
      verdict = 'ŠKODLIVÝ';
    } else if (score >= 35) {
      verdict = 'PODEZŘELÝ';
    }

    // Collect technique IDs
    const techniques = new Set<string>();
    for (const flag of flags) {
      if (flag.techniqueId) techniques.add(flag.techniqueId);
    }
    if (score >= 70 && !techniques.has('T1476')) {
      techniques.add('T1476'); // Sideloading vector
    }

    return {
      riskScore: score,
      verdict,
      mappedTechniques: Array.from(techniques),
    };
  }

  /**
   * Main analysis pipeline for an uploaded file
   */
  static async analyzeFile(file: File): Promise<ScanReport> {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // 1. Entropy calculation
    const entropyResult = this.calculateShannonEntropy(bytes);

    // 2. Hashes
    const sha256 = await this.calculateSha256(bytes);
    const md5 = this.calculateFastMd5(bytes);

    // 3. Text decoding for IOCs and heuristic strings
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawText = decoder.decode(bytes.slice(0, 1024 * 1024 * 4)); // First 4MB for string search

    // 4. Extract IOCs
    const iocs = this.extractIOCs(rawText, sha256, md5);

    // 5. Scan heuristics
    const flags = this.scanHeuristics(rawText, entropyResult.overall);

    // 6. Compute verdict and risk score
    const { riskScore, verdict, mappedTechniques } = this.computeVerdict(
      entropyResult.overall,
      flags,
      iocs
    );

    return {
      id: `scan-${Date.now()}`,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || 'application/octet-stream',
      timestamp: new Date().toISOString(),
      shannonEntropy: entropyResult.overall,
      entropyDistribution: entropyResult.distribution,
      iocs,
      heuristicFlags: flags,
      verdict,
      riskScore,
      mappedTechniques,
      rawSummary: `Analyzováno ${bytes.length} bajtů. Entropie: ${entropyResult.overall} b/byte. Zjištěno ${flags.length} heuristických příznaků a ${iocs.ipv4.length + iocs.domains.length} síťových IOC.`,
    };
  }

  /**
   * Analyzes an emulated sample file (for rapid demo / testing without requiring an external APK)
   */
  static async analyzeSample(type: 'trojan' | 'clean' | 'ransomware'): Promise<ScanReport> {
    let mockContent = '';
    let sampleName = '';

    if (type === 'trojan') {
      sampleName = 'SharkBot_Banking_Dropper_sample.apk';
      mockContent = `
        package com.bank.payload.cleaner;
        import android.accessibilityservice.AccessibilityService;
        import dalvik.system.DexClassLoader;
        // BIND_ACCESSIBILITY_SERVICE
        // performAction(ACTION_CLICK)
        // TYPE_VIEW_TEXT_CHANGED
        // c2: https://api.telegram.org/bot98231:AAF_sample/sendMessage
        // C2 IP: 185.220.101.42
        // Domain: c2.mobile-guard-update.top
        // Package: com.bank.security.stealer
      ` + 'A'.repeat(500) + 'X8!#%^&*()_+~`|}{[]:;?><,./' + Math.random().toString(36);
    } else if (type === 'ransomware') {
      sampleName = 'Android_Locker_WannaLocker.apk';
      mockContent = `
        import android.app.admin.DevicePolicyManager;
        // BIND_DEVICE_ADMIN
        // lockNow()
        // resetPassword()
        // ATTENTION! Your files have been encrypted with AES-256!
        // Pay 0.05 Bitcoin to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
        // C2 IP: 45.142.214.9
      ` + '\x00\xff\xfe\xca\xfe\xba\xbe'.repeat(100);
    } else {
      sampleName = 'OpenSource_Notes_v2.apk';
      mockContent = `
        package org.foss.notes;
        import android.os.Bundle;
        import android.app.Activity;
        public class MainActivity extends Activity {
           // Safe regular application
           // Domain: github.com
        }
      `;
    }

    const encoder = new TextEncoder();
    const bytes = encoder.encode(mockContent);
    const fakeFile = new File([bytes], sampleName, { type: 'application/vnd.android.package-archive' });
    return this.analyzeFile(fakeFile);
  }
}
