import { IncidentCase, Playbook, ValidationTest, ThreatIntelItem, EthicalLesson } from '../types';

export const INITIAL_CASES: IncidentCase[] = [
  {
    id: 'case-001',
    caseNumber: 'INC-2026-089',
    title: 'Detekce bankovního trojanu s Accessibility abuse (SharkBot vzor)',
    description: 'Statická analýza sideloadovaného APK "Infinix_Battery_Booster.apk" odhalila BIND_ACCESSIBILITY_SERVICE a skryté volání DexClassLoader s C2 doménou c2.mobile-guard-update.top.',
    severity: 'Critical',
    status: 'Containment',
    createdAt: '2026-09-24T14:22:00Z',
    updatedAt: '2026-09-26T19:40:00Z',
    associatedTechniques: ['T1628', 'T1627', 'T1417', 'T1411'],
    artifacts: ['Infinix_Battery_Booster.apk', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
    timeline: [
      {
        id: 't-1',
        timestamp: '2026-09-24T14:22:00Z',
        author: 'Aegis Scanner',
        action: 'Automatický záchyt souboru skrze SAF skener se skóre 94/100 (ŠKODLIVÝ).',
        notes: 'Nalezena vysoká Shannonova entropie (7.84) v classes2.dex a Accessibility abuse indikátory.',
      },
      {
        id: 't-2',
        timestamp: '2026-09-24T15:10:00Z',
        author: 'SOC Operátor (L2)',
        action: 'Zahájen containment: aplikace odinstalována, revokována oprávnění v systému Android 15.',
        notes: 'Uživatel potvrdil, že aplikaci stáhl z neoficiálního Telegram fóra.',
      },
      {
        id: 't-3',
        timestamp: '2026-09-25T09:30:00Z',
        author: 'Incident Responder',
        action: 'Zablokována C2 IP 194.87.112.55 na perimetrovém firewallu a nahlášena doména.',
      },
    ],
  },
  {
    id: 'case-002',
    caseNumber: 'INC-2026-092',
    title: 'Podezření na Spyware / SMS stealer u doručovací kampaně',
    description: 'Uživatel obdržel phishingovou SMS s odkazem na podvodnou stránku Pošty. Stažený balíček vyžadoval RECEIVE_SMS a SEND_SMS bez odpovídající funkcionality.',
    severity: 'High',
    status: 'Triage',
    createdAt: '2026-09-26T08:15:00Z',
    updatedAt: '2026-09-26T11:20:00Z',
    associatedTechniques: ['T1456', 'T1409', 'T1645', 'T1633'],
    artifacts: ['CeskaPosta_Tracking.apk', '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'],
    timeline: [
      {
        id: 't-4',
        timestamp: '2026-09-26T08:15:00Z',
        author: 'Uživatel zařízení',
        action: 'Nahlášen podezřelý soubor a importován do Aegis Skeneru.',
      },
      {
        id: 't-5',
        timestamp: '2026-09-26T11:20:00Z',
        author: 'Aegis Threat Analyst',
        action: 'Klasifikováno jako FluBot/TeaBot varianta zaměřená na zachytávání jednorázových bankovních kódů.',
      },
    ],
  },
  {
    id: 'case-003',
    caseNumber: 'INC-2026-077',
    title: 'Pokus o instalaci neznámého certifikačního orgánu (Rogue CA)',
    description: 'Zaměstnanec se pokusil nainstalovat nedůvěryhodný .crt certifikát stažený z neznámé Wi-Fi sítě.',
    severity: 'Medium',
    status: 'Closed',
    createdAt: '2026-09-20T16:00:00Z',
    updatedAt: '2026-09-21T10:00:00Z',
    associatedTechniques: ['T1478', 'T1464'],
    artifacts: ['captive_portal_cert.der'],
    timeline: [
      {
        id: 't-6',
        timestamp: '2026-09-20T16:00:00Z',
        author: 'MDM Audit',
        action: 'Zachycen pokus o instalaci uživatelského certifikátu.',
      },
      {
        id: 't-7',
        timestamp: '2026-09-21T10:00:00Z',
        author: 'Bezpečnostní správce',
        action: 'Certifikát vymazán, zařízení ověřeno jako bezpečné. Případ uzavřen.',
      },
    ],
  },
];

export const INITIAL_PLAYBOOKS: Playbook[] = [
  {
    id: 'pb-001',
    title: 'Reakce na zneužití Accessibility Service (T1628 / T1458)',
    techniqueId: 'T1628',
    techniqueName: 'Abuse of Accessibility Service for Persistence',
    description: 'Kroky pro okamžitou izolaci a odstranění malware zneužívajícího systémové služby usnadnění přístupu pro kradení gest a zadávaného textu.',
    updatedAt: '2026-09-26T12:00:00Z',
    steps: [
      {
        id: 's-1',
        title: 'Okamžitá izolace zařízení ze sítě',
        description: 'Přepnout zařízení Infinix Hot 50 Pro Plus do Leteckého režimu (Airplane Mode) nebo odpojit Wi-Fi a mobilní data.',
        completed: true,
        mitigationRef: 'Network Isolation',
      },
      {
        id: 's-2',
        title: 'Revokace oprávnění Usnadnění přístupu',
        description: 'V Nastavení -> Usnadnění přístupu (Accessibility) -> Stažené aplikace najít podezřelou aplikaci a vypnout přepínač.',
        completed: true,
        mitigationRef: 'Android 15 Settings Audit',
      },
      {
        id: 's-3',
        title: 'Vynucené zastavení a odinstalace',
        description: 'V Nastavení -> Aplikace kliknout na "Vynutit ukončení" (Force Stop) a následně "Odinstalovat". Pokud je tlačítko šedé, zkontroluj Device Admin.',
        completed: false,
        mitigationRef: 'PackageManager Action',
      },
      {
        id: 's-4',
        title: 'Reset bankovních a e-mailových hesel',
        description: 'Jelikož Accessibility může fungovat jako keylogger (T1417), neprodleně změňte hesla ke všem citlivým službám z jiného důvěryhodného zařízení.',
        completed: false,
        mitigationRef: 'Credential Rotation',
      },
      {
        id: 's-5',
        title: 'Ověření integrity systémových certifikátů',
        description: 'Zkontrolujte v Nastavení -> Zabezpečení -> Důvěryhodná pověření záložku Uživatel, zda malware nenainstaloval MITM certifikát.',
        completed: false,
        mitigationRef: 'Certificate Store Inspection',
      },
    ],
  },
  {
    id: 'pb-002',
    title: 'Mitigace Sideloadovaného APK se skrytým C2 (T1476)',
    techniqueId: 'T1476',
    techniqueName: 'Deliver Malicious App via Other Means (Sideloading)',
    description: 'Postup vyšetření a sanace incidentu způsobeného instalací neautorizovaného instalačního balíčku mimo Google Play.',
    updatedAt: '2026-09-25T17:30:00Z',
    steps: [
      {
        id: 's-6',
        title: 'Extrakce SHA-256 hashe a IOC',
        description: 'Spustit soubor přes Aegis File Scanner, zaznamenat hash, zjištěné C2 domény a IP adresy.',
        completed: true,
        mitigationRef: 'Forensic Static Analysis',
      },
      {
        id: 's-7',
        title: 'Korelace s Threat Intel a blacklist C2',
        description: 'Zadat extrahované IP a domény do firemního DNS filtru nebo lokální blokace.',
        completed: true,
        mitigationRef: 'IOC Feed Sync',
      },
      {
        id: 's-8',
        title: 'Deaktivace možnosti instalace z neznámých zdrojů',
        description: 'V Nastavení zkontrolovat všechna oprávnění "Instalovat neznámé aplikace" u prohlížečů, správců souborů i Telegramu a nastavit na Zakázáno.',
        completed: false,
        mitigationRef: 'OS Hardening',
      },
    ],
  },
  {
    id: 'pb-003',
    title: 'Obrana proti mobilnímu Ransomware / Screen Locker (T1444)',
    techniqueId: 'T1444',
    techniqueName: 'Device Lockout / Ransomware',
    description: 'Pohotovostní instrukce při uzamčení obrazovky nebo požadavku na výkupné.',
    updatedAt: '2026-09-20T10:00:00Z',
    steps: [
      {
        id: 's-9',
        title: 'Restart do Nouzového režimu (Safe Mode)',
        description: 'Na telefonu Infinix podržte tlačítko napájení, poté dlouze stiskněte ikonu "Vypnout" a potvrďte restart do nouzového režimu. Aplikace třetích stran se nespustí.',
        completed: false,
        mitigationRef: 'Hardware Boot Vector',
      },
      {
        id: 's-10',
        title: 'Odebrání administrátorských práv škůdci',
        description: 'V nouzovém režimu přejděte do Zabezpečení -> Aplikace pro správu zařízení a zrušte zaškrtnutí vyděračské aplikace.',
        completed: false,
        mitigationRef: 'DevicePolicyManager Revoke',
      },
      {
        id: 's-11',
        title: 'Odstranění APK a kontrola stažených souborů',
        description: 'V aplikaci Správce souborů smazat původní stažený balíček ze složky Download a provést restart do běžného režimu.',
        completed: false,
        mitigationRef: 'Storage Cleanup',
      },
    ],
  },
];

export const INITIAL_VALIDATION_TESTS: ValidationTest[] = [
  {
    id: 'test-001',
    techniqueId: 'T1476',
    techniqueName: 'Deliver Malicious App via Sideloading',
    tactic: 'Initial Access',
    platform: 'Android',
    testName: 'Sideload Restriction Enforcement',
    testProcedure: 'Ověřit, že je v Android 15 politice zakázána volba "Instalovat neznámé aplikace" pro prohlížeče Chrome a správce souborů.',
    status: 'PASS',
    lastTested: '2026-09-25T10:00:00Z',
    testerNotes: 'Potvrzeno v systémových zásadách Infinix XOS 14/15.',
  },
  {
    id: 'test-002',
    techniqueId: 'T1628',
    techniqueName: 'Abuse of Accessibility Service for Persistence',
    tactic: 'Persistence',
    platform: 'Android',
    testName: 'Restricted Settings Protection Test',
    testProcedure: 'Nainstalovat testovací APK z disku a ověřit, zda Android 15 zobrazí "Omezené nastavení (Restricted Setting)" při pokusu o aktivaci Accessibility.',
    status: 'PASS',
    lastTested: '2026-09-26T14:30:00Z',
    testerNotes: 'Android 15 nativně blokuje zapnutí usnadnění pro nestorové balíčky.',
  },
  {
    id: 'test-003',
    techniqueId: 'T1411',
    techniqueName: 'Screen Capture & Overlay Attack',
    tactic: 'Credential Access',
    platform: 'Android',
    testName: 'FLAG_SECURE & SYSTEM_ALERT_WINDOW Prevention',
    testProcedure: 'Ověřit, že citlivé obrazovky aplikace mají nastaven WindowManager.LayoutParams.FLAG_SECURE proti zachycení snímků obrazovky.',
    status: 'PASS',
    lastTested: '2026-09-24T09:15:00Z',
    testerNotes: 'Screenshoty v Aegis i bankovních aplikacích vrací černý obraz.',
  },
  {
    id: 'test-004',
    techniqueId: 'T1627',
    techniqueName: 'Dynamic Payload Loading (DexClassLoader)',
    tactic: 'Execution',
    platform: 'Android',
    testName: 'Dynamic Code Loading from Writable Dir Audit',
    testProcedure: 'Test načtení sekundárního .dex souboru z kontextového úložiště bez nastavení read-only příznaku.',
    status: 'FAIL',
    lastTested: '2026-09-26T16:00:00Z',
    testerNotes: 'Android 14+ vyžaduje přísnou kontrolu atributů souboru, starší SDK knihovna selhává.',
  },
  {
    id: 'test-005',
    techniqueId: 'T1418',
    techniqueName: 'Dumping Credentials from SharedPreferences',
    tactic: 'Credential Access',
    platform: 'Android',
    testName: 'EncryptedSharedPreferences Verification',
    testProcedure: 'Zkontrolovat, zda jsou veškeré přihlašovací údaje a API klíče šifrovány pomocí AndroidKeyStore (AES-256-GCM).',
    status: 'PASS',
    lastTested: '2026-09-26T18:00:00Z',
    testerNotes: 'Klíč MasterKey.DEFAULT_AES256_GCM_SPEC úspěšně vynucen.',
  },
  {
    id: 'test-006',
    techniqueId: 'T1406',
    techniqueName: 'Obfuscated Files or Information',
    tactic: 'Defense Evasion',
    platform: 'Android',
    testName: 'Shannon Entropy Threshold Verification',
    testProcedure: 'Otestovat detekci obfuskace a balení: soubory s entropií > 7.20 musí vyvolat varovný příznak.',
    status: 'PASS',
    lastTested: '2026-09-27T02:00:00Z',
    testerNotes: 'Aegis File Scanner algoritmus spolehlivě identifikuje zabalené dex/so soubory.',
  },
  {
    id: 'test-007',
    techniqueId: 'T1444',
    techniqueName: 'Device Lockout / Ransomware',
    tactic: 'Impact',
    platform: 'Android',
    testName: 'Device Admin Privilege Rejection',
    testProcedure: 'Zkontrolovat, zda žádná uživatelská aplikace nedrží neoprávněně roli BIND_DEVICE_ADMIN.',
    status: 'UNTESTED',
    testerNotes: 'Spustit adb shell dpm list-active-admins a potvrdit prázdný výstup pro nedůvěryhodné balíčky.',
  },
];

export const INITIAL_THREAT_INTEL: ThreatIntelItem[] = [
  {
    id: 'intel-001',
    title: 'Anatsa / TeaBot C2 Infrastructure Active Node',
    iocType: 'ip',
    value: '185.220.101.42',
    threatActor: 'Anatsa Group',
    campaign: 'European Banking Troj-Campaign Q3/Q4 2026',
    confidence: 'High',
    associatedTechnique: 'T1437.001',
    description: 'Aktivní C2 uzel obsluhující infikované telefony v ČR, SR, Polsku a Německu. Příkazy pro fake banking overlay.',
    firstSeen: '2026-09-22T04:12:00Z',
    tags: ['banking', 'c2', 'teabot', 'android'],
  },
  {
    id: 'intel-002',
    title: 'SharkBot Dropper SHA-256 Hash',
    iocType: 'hash',
    value: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
    threatActor: 'SharkBot Syndicate',
    campaign: 'Utility & Cleaner App Masquerade',
    confidence: 'High',
    associatedTechnique: 'T1628',
    description: 'Dropper maskovaný jako čistič paměti "Fast RAM Booster". Po 4 hodinách žádá o povolení Accessibility.',
    firstSeen: '2026-09-24T18:00:00Z',
    tags: ['hash', 'sha256', 'dropper', 'accessibility'],
  },
  {
    id: 'intel-003',
    title: 'Phishing SMS Gateway Domain (Ceska Posta theme)',
    iocType: 'domain',
    value: 'posta-zasilka-overeni-cz.net',
    threatActor: 'SmishCZ Network',
    campaign: 'SMS Smishing Express Parcels',
    confidence: 'High',
    associatedTechnique: 'T1456',
    description: 'Doména používaná v SMS pro distribuci škodlivého balíčku pro krádež SMS kódů.',
    firstSeen: '2026-09-26T01:30:00Z',
    tags: ['smishing', 'phishing', 'domain', 'posta'],
  },
  {
    id: 'intel-004',
    title: 'Podezřelý Spyware Package Name',
    iocType: 'package',
    value: 'com.syssystem.service.googleupdate',
    threatActor: 'Commodity RAT',
    campaign: 'Stealth Surveillance APK',
    confidence: 'Medium',
    associatedTechnique: 'T1633',
    description: 'Falešný balíček vydávající se za systémovou aktualizaci Google. Zaznamenává mikrofon a SMS.',
    firstSeen: '2026-09-25T11:45:00Z',
    tags: ['package', 'masquerade', 'spyware'],
  },
  {
    id: 'intel-005',
    title: 'Exfiltration Dead-Drop Telegram Bot URL',
    iocType: 'url',
    value: 'https://api.telegram.org/bot712891924:AAEk91fK-L990zX/sendMessage',
    threatActor: 'Unknown Infostealer',
    campaign: 'Telegram Bot C2',
    confidence: 'High',
    associatedTechnique: 'T1484',
    description: 'Endpoint pro odesílání odcizených 2FA SMS kódů přímo do soukromého Telegram kanálu útočníka.',
    firstSeen: '2026-09-26T20:10:00Z',
    tags: ['c2', 'telegram', 'exfiltration', 'url'],
  },
];

export const ETHICAL_LESSONS: EthicalLesson[] = [
  {
    id: 'lesson-1',
    category: 'OWASP MASVS',
    title: 'OWASP MASVS v2 & ASVS: Bezpečná architektura mobilních aplikací',
    summary: 'Komplexní bezpečnostní požadavky na úložiště, kryptografii, ověřování identity a integritu platformy Android 15.',
    ethicalNotice: 'Veškeré koncepty slouží výhradně k defenzivnímu návrhu a bezpečnostním auditům v souladu s etickým kodexem certifikovaného etického hackera (CEH).',
    contentMarkdown: `### 1. MASVS-STORAGE (Zabezpečení úložiště dat)
- **MSTG-STORAGE-1**: Žádná citlivá data nesmí být uložena mimo aplikační sandbox v nešifrované podobě.
- V Android 15 využívejte \`EncryptedSharedPreferences\` s klíčem uloženým v hardwarovém modulu \`AndroidKeyStore\` (StrongBox nebo TEE).
- Zakázat zálohování citlivých dat v \`AndroidManifest.xml\`: \`android:allowBackup="false"\`.

### 2. MASVS-CRYPTO (Kryptografie)
- Nikdy nepoužívejte zastaralé šifry: DES, 3DES, RC4 nebo MD5/SHA-1 pro integritu hesel.
- Standard: AES-256-GCM s náhodným inicializačním vektorem (IV) pro každý blok dat.
- Odvození klíčů z hesla: PBKDF2 (min. 100 000 iterací) nebo Argon2id.

### 3. MASVS-RESILIENCE (Odolnost proti manipulaci)
- Play Integrity API s hardwarovou atestací pro ověření, že zařízení není rootnuté a aplikace nebyla přebalena.
- Zero-Trust validace každého příchozího Intentu a zamezení útoků typu Intent Spoofing.`,
    defensiveChecklist: [
      'android:allowBackup je nastaveno na false v manifestu',
      'Všechny tokeny uloženy v EncryptedSharedPreferences nebo Keystore',
      'Žádné API klíče nejsou natvrdo vloženy v Java/Kotlin kódu (využito BuildConfig nebo NDK)',
      'Certificate Pinning nebo network-security-config vynucuje TLS 1.3',
      'Citlivé UI komponenty mají aktivní FLAG_SECURE',
    ],
  },
  {
    id: 'lesson-2',
    category: 'Incident Response',
    title: 'Mobilní Incident Response: 5-fázový protokol pro SOC týmy',
    summary: 'Postup zvládání narušení mobilního perimetru od záchytu přes izolaci, forenzní extrakci až po obnovu.',
    ethicalNotice: 'Při vyšetřování incidentů dbejte na zachování integrity důkazů (Chain of Custody). Nikdy nespouštějte neznámé soubory na produkčním zařízení.',
    contentMarkdown: `### Fáze 1: Detekce a Triage (Identifikace)
1. Zachycení anomálie skrze EMM/MDM, Aegis Scanner nebo hlášení uživatele (např. neočekávaná spotřeba baterie, vyskakovací okna).
2. Výpočet SHA-256 a MD5 hashů zachycených artefaktů.
3. Stanovení závažnosti (Critical / High / Medium / Low).

### Fáze 2: Containment (Izolace a ohraničení)
1. **Fyzická / Síťová izolace**: Přepnutí do režimu Letadlo, odpojení od podnikové Wi-Fi, odebrání VPN profilu.
2. Zamezení C2 komunikaci: Zařazení C2 IP adres a domén na perimetrový firewall a DNS sinkhole.
3. Revokace uživatelských session tokenů (Google Workspace, Office 365, podnikové portály).

### Fáze 3: Forenzní analýza (Eradikace)
1. Extrakce podezřelého APK přes \`adb pull\` v izolovaném prostředí.
2. Statická analýza: Shannonova entropie sekcí, extrakce řetězců, dekompilace manifestu (jadx).
3. Hledání persistence: inspekce \`dumpsys accessibility\`, \`dumpsys device_policy\`.

### Fáze 4: Obnova (Recovery)
1. Odstranění škodlivého balíčku v Nouzovém režimu (Safe Mode) nebo Factory Reset zařízení.
2. Obnova dat výhradně z ověřené předincidentní zálohy.
3. Nastavení silného zámku obrazovky a biometrie.

### Fáze 5: Lessons Learned (Poučení)
1. Zavedení testovacího scénáře do Aegis Coverage matice.
2. Aktualizace MITRE ATT&CK Mobile mapování a playbooků.`,
    defensiveChecklist: [
      'Zařízení je okamžitě izolováno ze sítě',
      'Session tokeny a hesla účtů byly okamžitě resetovány',
      'Byl pořízen neměnný forenzní hash (SHA-256) instalačního balíčku',
      'C2 domény nahlášeny na CSIRT / CIRT',
      'Případ zdokumentován s časovou osou v Cases modulu',
    ],
  },
  {
    id: 'lesson-3',
    category: 'Threat Hunting',
    title: 'Statická analýza APK: Shannonova entropie, IOC a Heuristiky',
    summary: 'Jak funguje defenzivní detekce škodlivých kódů bez nutnosti spouštění v chráněném prostředí.',
    ethicalNotice: 'Výpočet entropie a statická heuristika je standardní vědecká metoda používaná antivirovými laboratořemi k ochraně uživatelů.',
    contentMarkdown: `### Co je Shannonova entropie?
Shannonova entropie měří míru náhodnosti dat v souboru a nabývá hodnot od **0,0 do 8,0 bitů na bajt**:
- **0.0 - 4.5**: Prostý text, XML, JSON, čitelné řetězce a zdrojový kód.
- **4.5 - 6.8**: Běžně kompilovaný kód (Java bytecode, běžný dex soubor).
- **6.8 - 7.2**: Mírně komprimovaná data nebo grafika (PNG, WebP).
- **> 7.20**: **Kritický indikátor!** Silně šifrovaná data, kryptografické payloady nebo zabalené (packed) binárky.

### Indikátory podezření v Android Manifestu:
- Žádost o \`BIND_ACCESSIBILITY_SERVICE\` bez zjevného důvodu
- Kombinace \`RECEIVE_BOOT_COMPLETED\` + \`SYSTEM_ALERT_WINDOW\` + \`READ_SMS\`
- Použití \`DexClassLoader\` nebo \`InMemoryDexClassLoader\` pro dynamické načítání z nechráněných úložišť
- Řetězce odkazující na deobfuskaci \`javax.crypto.Cipher\` a přímé volání \`Runtime.getRuntime().exec()\`.`,
    defensiveChecklist: [
      'Provést sken souboru přes Aegis Shannonův analyzátor',
      'Zkontrolovat graf entropie: ploché špičky nad 7.2 indikují skrytý payload',
      'Zkontrolovat extrahované IP a domény proti Threat Intel feedu',
      'Ověřit deklaraci nebezpečných práv v AndroidManifest.xml',
    ],
  },
  {
    id: 'lesson-4',
    category: 'CEH',
    title: 'CEH Mobile Attack Vectors & Defensive Countermeasures',
    summary: 'Přehled zkouškových okruhů Certified Ethical Hacker pro mobilní platformy a jejich defenzivní neutralizace.',
    ethicalNotice: 'Určeno pro certifikační přípravu CEH v12/v13 a legální cvičné laboratoře (TryHackMe, HackTheBox).',
    contentMarkdown: `### 1. Reverse Engineering a Deobfuskace
- Útočníci používají nástroje jako **apktool**, **dex2jar** a **jadx-gui** k rekonstrukci zdrojového kódu.
- **Obrana**: Využití R8/ProGuard se silným přejmenováním tříd a metod, odstranění ladicích symbolů (debugging information).

### 2. Dynamické hookování přes Frida a Xposed
- Analytické i útočné nástroje vkládají JavaScript engine do paměti běžícího procesu pro obcházení SSL Pinningu nebo biometrického ověření.
- **Obrana**: Detekce portů (27042), kontrola paměťových map \`/proc/self/maps\` na přítomnost \`frida-agent.so\` a ověření ptrace attach.

### 3. Zneužití IPC (Inter-Process Communication)
- Přístup k exportovaným Content Providerům, Broadcast Receiverům a Službám.
- **Obrana**: Vždy explicitně deklarovat \`android:exported="false"\` u všech komponent, které neslouží externímu OS. Pro sdílení používat vlastní \`signature\` oprávnění.`,
    defensiveChecklist: [
      'Všechny interní komponenty v manifestu mají android:exported="false"',
      'Aplikace ověřuje integritu runtime prostředí',
      'Je nasazen striktní Network Security Config se zakázaným Cleartext HTTP',
      'Žádné citlivé debugovací hlášky nejsou posílány do Android Logcatu v produkčním buildu',
    ],
  },
];
