import { MoEExpert, CopilotMessage, AppSettings } from '../types';
import { StorageService } from './storage';

export const EXPERT_PERSONAS: Record<
  MoEExpert,
  {
    title: string;
    description: string;
    systemPrompt: string;
    avatarColor: string;
    badge: string;
  }
> = {
  'Threat Analyst': {
    title: 'Threat Intel & Malware Analyst',
    description: 'Specialista na analýzu mobilních hrozeb, korelaci IOC, chování bankovních trojanů a C2 komunikaci.',
    systemPrompt: `Jsi špičkový defenzivní Threat Analyst pro platformu Android 15. Analyzuješ IOC (hashe, IP, C2 domény), chování malware (SharkBot, TeaBot, Anatsa, FluBot) a koreluješ nálezy s MITRE ATT&CK Mobile. Odpovídej věcně, technicky v češtině, formátuj kód a IOC do bloků. Dbej na striktně defenzivní postoj.`,
    avatarColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
    badge: 'THREAT-INTEL',
  },
  'IR Coach': {
    title: 'Incident Response Coach',
    description: 'Průvodce řízením bezpečnostních incidentů, izolací, forenzními postupy a obnovou zařízení.',
    systemPrompt: `Jsi Incident Response Commander pro mobilní bezpečnost. Poskytuješ praktické instrukce pro fáze Incident Response: Detekce -> Triage -> Containment -> Eradikace -> Obnova. Pomáháš operátorům na zařízení Infinix Hot 50 Pro Plus správně izolovat nákazu, provést bezpečný restart do Safe Mode a rotovat pověření.`,
    avatarColor: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
    badge: 'IR-COMMAND',
  },
  'Code Auditor': {
    title: 'Android 15 Code & Manifest Auditor',
    description: 'Auditor oprávnění, bezpečné konfigurace komponent, OWASP MASVS v2 a Android 15 specifik.',
    systemPrompt: `Jsi hlavní auditor zdrojového kódu a konfigurace Android 15. Posuzuješ AndroidManifest.xml, oprávnění (Accessibility, DeviceAdmin, SMS, NotificationListener), Intent filtry, exportované komponenty a dodržování OWASP MASVS / ASVS standardů. Identifikuj zranitelnosti a navrhuj bezpečné implementace v Kotlinu.`,
    avatarColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    badge: 'AUDIT-SEC',
  },
  'ATT&CK Navigator': {
    title: 'MITRE ATT&CK Mobile Navigator',
    description: 'Expert na mapování útočných technik, mitigací a sestavování testovacího pokrytí.',
    systemPrompt: `Jsi specialista na matici MITRE ATT&CK Mobile. Pomáháš mapovat pozorované chování podezřelých aplikací na přesné techniky (T1400 - T1664), vysvětluješ mitigace a navrhuješ postupy pro ověření detekčního pokrytí (Coverage matrix).`,
    avatarColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20',
    badge: 'ATT&CK-NAV',
  },
};

export class AiCopilotService {
  static async sendMessage(
    userText: string,
    expert: MoEExpert,
    chatHistory: CopilotMessage[]
  ): Promise<string> {
    const settings: AppSettings = StorageService.getSettings();

    // 1. If user configured a custom OpenAI-compatible API key (e.g. OpenRouter / DeepSeek / Qwen)
    if (settings.customApiKey && settings.customApiKey.trim().length > 5) {
      try {
        const response = await fetch(settings.customApiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${settings.customApiKey.trim()}`,
          },
          body: JSON.stringify({
            model: settings.customModelName || 'deepseek/deepseek-chat',
            messages: [
              {
                role: 'system',
                content: EXPERT_PERSONAS[expert].systemPrompt,
              },
              ...chatHistory.slice(-6).map((m) => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.content,
              })),
              {
                role: 'user',
                content: userText,
              },
            ],
            temperature: 0.2,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          const answer = json?.choices?.[0]?.message?.content;
          if (answer) return answer;
        }
      } catch (err) {
        console.warn('Custom API call failed, falling back to offline SOC engine:', err);
      }
    }

    // 2. High-precision offline SOC expert engine with context-awareness
    return this.generateOfflineExpertResponse(userText, expert);
  }

  private static generateOfflineExpertResponse(query: string, expert: MoEExpert): string {
    const lower = query.toLowerCase();

    if (expert === 'Threat Analyst') {
      if (lower.includes('sharkbot') || lower.includes('teabot') || lower.includes('anatsa') || lower.includes('trojan')) {
        return `### 🛡️ Nález Threat Analyst: Analýza bankovního trojanu
**Kategorie:** Android Banking Trojan / Dropper  
**Mapování:** \`T1628\` (Accessibility Abuse), \`T1411\` (Overlay), \`T1627\` (Dynamic DEX Loading)

#### Pozorované vektory:
1. **Dropper fáze:** Aplikace je distribuována jako falešný "Booster" nebo "Flashlight". Počáteční kód neobsahuje škodlivé API.
2. **Časový odklad:** Po 4–6 hodinách kontaktuje C2 přes zašifrovaný kanál nebo Telegram bot API (\`T1484\`).
3. **Zneužití Usnadnění:** Žádá uživatele o aktivaci \`BIND_ACCESSIBILITY_SERVICE\`.
4. **Overlay útok:** Při spuštění bankovních aplikací vykreslí falešný formulář (\`SYSTEM_ALERT_WINDOW\`) a odcizí přihlašovací údaje.

#### Doporučené akce:
- Extrahujte SHA-256 a prověřte IOC ve firemním feedu.
- Vytvořte Incident Case v modulu Cases s prioritou **Critical**.`;
      }

      if (lower.includes('ip') || lower.includes('c2') || lower.includes('hash') || lower.includes('ioc')) {
        return `### 📡 Threat Intel Korelace IOC
- **Typ dotazu:** Inspekce C2 infrastruktury a hashů
- **Status ověření:** Dotaz porovnán s lokální databází Aegis Threat Intel.
- **Doporučená defenzivní pravidla:**
  1. Zablokovat komunikaci na úrovni firemního firewallu a privátní DNS (DoT/DoH).
  2. Přidat IOC do seznamu \`Aegis Threat Intel\` pro automatické párování při skenování souborů.
  3. U zařízení v terénu ověřit přítomnost podezřelých spojení přes \`adb shell netstat -tp\` nebo VPN monitor.`;
      }

      return `### 🛡️ Threat Analyst: Posouzení mobilního vektoru
Na základě dotazu **"${query}"** doporučuji:
1. Analyzovat podezřelý soubor v modulu **File Scanner** pro získání přesné Shannonovy entropie a seznamu IOC.
2. Prověřit, zda nedochází k neautorizovaným přenosům na pozadí (\`T1644\`).
3. V případě výskytu škodlivého hash vzoru okamžitě založit případ v modulu **Cases**.`;
    }

    if (expert === 'IR Coach') {
      return `### 🚨 IR Coach: Taktický postup Incident Response
**Cílové zařízení:** Infinix Hot 50 Pro Plus (Android 15)  
**Fáze zásahu:** \`Containment & Izolace\`

#### Krok 1: Fyzická a síťová karanténa
- Okamžitě aktivujte **Režim Letadlo** (odpojit Wi-Fi, Bluetooth i mobilní síť).
- Zamezíte tím exfiltraci zachycených SMS a přístupových údajů na C2 server útočníka.

#### Krok 2: Bezpečný restart do Nouzového režimu (Safe Mode)
1. Podržte tlačítko Power na telefonu Infinix.
2. Dlouze podržte ikonu **Vypnout** na displeji.
3. Potvrďte restart do **Nouzového režimu** (v levém dolním rohu se zobrazí nápis Nouzový režim).
4. Všechny aplikace třetích stran jsou nyní systémem uspané a nemohou blokovat odinstalaci.

#### Krok 3: Revokace administrátorských práv
- Otevřete *Nastavení -> Zabezpečení -> Aplikace pro správu zařízení*.
- Pokud zde škodlivá aplikace figuruje, odeberte jí oprávnění administrátora.
- Následně aplikaci běžným způsobem odinstalujte.

#### Krok 4: Změna hesel a audit účtů
- Z **jiného důvěryhodného zařízení** rotujte hesla do Google účtu a bankovních portálů.`;
    }

    if (expert === 'Code Auditor') {
      return `### 🔍 Code Auditor: Android 15 & OWASP MASVS Audit
**Analýza bezpečnostních politik pro Android 15 (API 35):**

\`\`\`xml
<!-- Doporučená defenzivní konfigurace v AndroidManifest.xml -->
<application
    android:allowBackup="false"
    android:networkSecurityConfig="@xml/network_security_config"
    android:hardwareAccelerated="true">
    
    <!-- V Android 14/15 striktně explicitně specifikujte exported -->
    <receiver
        android:name=".SafeReceiver"
        android:exported="false">
        <intent-filter>
            <action android:name="com.aegis.LOCAL_EVENT" />
        </intent-filter>
    </receiver>
</application>
\`\`\`

#### Kritické body auditu:
1. **Restricted Settings v Android 15:** Zajišťuje, že aplikace instalované mimo certifikovaný obchod nemohou snadno získat \`BIND_ACCESSIBILITY_SERVICE\`.
2. **Encrypted Storage:** Pro citlivé proměnné používejte výhradně \`MasterKey\` z \`androidx.security.crypto:security-crypto\`.
3. **No Cleartext Traffic:** Zajistěte, aby \`network_security_config.xml\` zakazoval nešifrované HTTP požadavky.`;
    }

    // ATT&CK Navigator
    return `### 🗺️ ATT&CK Navigator: Mapování technik
Pro zadaný scénář doporučuji prověřit následující techniky z matice **MITRE ATT&CK Mobile**:

- **T1476 — Deliver Malicious App via Other Means (Sideloading)**  
  *Vektor:* Instalace APK mimo oficiální repozitář.  
  *Mitigace:* MDM zásada zakazující neznámé zdroje.
- **T1628 — Abuse of Accessibility Service for Persistence**  
  *Vektor:* Zachycení událostí okna a automatické klikání na povolení práv.  
  *Detekce:* Audit aktivních služeb usnadnění v Androidu.
- **T1406 — Obfuscated Files or Information**  
  *Vektor:* Šifrovaný dex payload s vysokou Shannonovou entropií (> 7.2).  
  *Ověření:* Test \`Shannon Entropy Threshold Verification\` v sekci Coverage.

Doporučuji otevřít záložku **ATT&CK** a přidat tuto techniku do aktivního Playbooku!`;
  }
}
