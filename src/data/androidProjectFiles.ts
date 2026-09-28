export interface AndroidSourceFile {
  path: string;
  language: string;
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidSourceFile[] = [
  {
    path: 'app/build.gradle.kts',
    language: 'kotlin',
    description: 'Konfigurace modulu pro Android 15 (API 35), targetSdk 35, aarch64 NDK filtry a Room/Hilt/Compose závislosti.',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.kapt)
    alias(libs.plugins.hilt.android)
}

android {
    namespace = "com.aegis.mobile.commandcenter"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.aegis.mobile.commandcenter"
        minSdk = 31
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0-release"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }

        // Optimalizace pro aarch64 (Infinix Hot 50 Pro Plus - MediaTek Helio / arm64-v8a)
        ndk {
            abiFilters.addAll(setOf("arm64-v8a"))
        }
    }

    signingConfigs {
        create("release") {
            storeFile = file("../aegis-release-key.jks")
            storePassword = System.getenv("AEGIS_KEYSTORE_PASSWORD") ?: "AegisSecurity2026!"
            keyAlias = "aegis-mobile"
            keyPassword = System.getenv("AEGIS_KEY_PASSWORD") ?: "AegisSecurity2026!"
            enableV1Signing = true
            enableV2Signing = true
            enableV3Signing = true
            enableV4Signing = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform(libs.compose.bom))
    implementation(libs.compose.ui)
    implementation(libs.compose.ui.graphics)
    implementation(libs.compose.ui.tooling.preview)
    implementation(libs.compose.material3)
    implementation(libs.compose.icons.extended)

    // AndroidX & Lifecycle
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.navigation.compose)

    // Room DB (Offline-first SQL)
    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    kapt(libs.room.compiler)

    // Hilt Dependency Injection
    implementation(libs.hilt.android)
    kapt(libs.hilt.compiler)
    implementation(libs.androidx.hilt.navigation.compose)

    // Coroutines
    implementation(libs.kotlinx.coroutines.android)

    // Security & EncryptedSharedPreferences (Hardware Keystore)
    implementation(libs.androidx.security.crypto)

    // Testy
    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
    testImplementation(libs.robolectric)
}
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Manifest aplikace s minimálními defenzivními oprávněními, Android 15 edge-to-edge a bezpečnými intent filtry.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- 
      Přísná bezpečnostní hygiena (Strict Defense):
      1. Žádná zbytečná telemetrická ani sledovací oprávnění
      2. INTERNET je vyhrazen pouze pro volitelný uživatelský AI feed a Threat Intel sync
      3. Přístup k souborům je řešen výhradně přes Storage Access Framework (SAF),
         takže aplikace NEVYŽADUJE nebezpečné celosystémové oprávnění MANAGE_EXTERNAL_STORAGE!
    -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:name=".AegisApplication"
        android:allowBackup="false"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AegisMobile"
        android:networkSecurityConfig="@xml/network_security_config"
        tools:targetApi="35">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/Theme.AegisMobile"
            android:windowSoftInputMode="adjustResize"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- SAF Intent Filter pro přímé otevření souboru/logu ze systému -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="application/*" />
            </intent-filter>
        </activity>

    </application>

</manifest>
`,
  },
  {
    path: 'app/src/main/java/com/aegis/mobile/data/local/AegisDatabase.kt',
    language: 'kotlin',
    description: 'Room SQLite databáze se schématem pro offline ATT&CK techniky, incidentní případy, playbooks a skeny.',
    content: `package com.aegis.mobile.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.aegis.mobile.data.local.dao.*
import com.aegis.mobile.data.local.entity.*

@Database(
    entities = [
        TechniqueEntity::class,
        CaseEntity::class,
        PlaybookEntity::class,
        ValidationTestEntity::class,
        ThreatIntelEntity::class,
        ScanReportEntity::class
    ],
    version = 1,
    exportSchema = true
)
@TypeConverters(Converters::class)
abstract class AegisDatabase : RoomDatabase() {
    abstract fun techniqueDao(): TechniqueDao
    abstract fun caseDao(): CaseDao
    abstract fun playbookDao(): PlaybookDao
    abstract fun validationTestDao(): ValidationTestDao
    abstract fun threatIntelDao(): ThreatIntelDao
    abstract fun scanReportDao(): ScanReportDao
}
`,
  },
  {
    path: 'app/src/main/java/com/aegis/mobile/analyzer/ShannonEntropyCalculator.kt',
    language: 'kotlin',
    description: 'Nativní Kotlin implementace výpočtu Shannonovy entropie bit po bitu s detekcí zabalených/šifrovaných sekcí.',
    content: `package com.aegis.mobile.analyzer

import kotlin.math.log2

data class EntropyResult(
    val overall: Double,
    val chunkDistribution: List<Double>,
    val isSuspicious: Boolean
)

object ShannonEntropyCalculator {
    /**
     * Vypočítá Shannonovu entropii H(X) = -sum(p(x) * log2(p(x)))
     * pro zadané bajtové pole.
     * Výsledek je v rozsahu 0.0 až 8.0 bitů na bajt.
     */
    fun calculate(bytes: ByteArray): EntropyResult {
        if (bytes.isEmpty()) return EntropyResult(0.0, emptyList(), false)

        val byteCounts = IntArray(256)
        for (b in bytes) {
            byteCounts[b.toInt() and 0xFF]++
        }

        val totalLen = bytes.size.toDouble()
        var overallEntropy = 0.0

        for (count in byteCounts) {
            if (count > 0) {
                val p = count / totalLen
                overallEntropy -= p * log2(p)
            }
        }

        // Výpočet po segmentech (až 32 chunků) pro odhalení skrytých šifrovaných DEX/SO sekcí
        val chunkSize = maxOf(256, bytes.size / 32)
        val chunks = mutableListOf<Double>()

        var offset = 0
        while (offset < bytes.size) {
            val end = minOf(bytes.size, offset + chunkSize)
            val subCounts = IntArray(256)
            for (i in offset until end) {
                subCounts[bytes[i].toInt() and 0xFF]++
            }
            val subLen = (end - offset).toDouble()
            var chunkH = 0.0
            for (c in subCounts) {
                if (c > 0) {
                    val p = c / subLen
                    chunkH -= p * log2(p)
                }
            }
            chunks.add(Math.round(chunkH * 100.0) / 100.0)
            offset += chunkSize
        }

        val roundedOverall = Math.round(overallEntropy * 100.0) / 100.0
        // Prahová hodnota 7.20 indikuje silný packer / šifrovaný payload
        val suspicious = roundedOverall >= 7.20 || chunks.any { it >= 7.50 }

        return EntropyResult(roundedOverall, chunks, suspicious)
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/aegis/mobile/analyzer/IocExtractor.kt',
    language: 'kotlin',
    description: 'Nativní regex IOC extraktor pro SHA-256, MD5, IPv4, domény, URL a balíčky Android aplikací.',
    content: `package com.aegis.mobile.analyzer

import java.security.MessageDigest

data class ExtractedIocs(
    val sha256: String,
    val md5: String,
    val ipv4Addresses: List<String>,
    val domains: List<String>,
    val urls: List<String>,
    val packageNames: List<String>
)

object IocExtractor {
    private val IPV4_REGEX = Regex("""\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b""")
    private val DOMAIN_REGEX = Regex("""\\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+(?:com|net|org|io|top|xyz|ru|cn|cz|sk|info)\\b""", RegexOption.IGNORE_CASE)
    private val URL_REGEX = Regex("""https?://[^\\s"'<>]+""", RegexOption.IGNORE_CASE)
    private val PKG_REGEX = Regex("""\\b(?:com|org|net|io|me|cz|sk)\\.[a-z0-9_]+(?:\\.[a-z0-9_]+)+\\b""", RegexOption.IGNORE_CASE)

    fun extract(bytes: ByteArray): ExtractedIocs {
        val sha256 = calculateHash(bytes, "SHA-256")
        val md5 = calculateHash(bytes, "MD5")

        val rawText = String(bytes.take(2 * 1024 * 1024).toByteArray(), Charsets.UTF_8)

        val ips = IPV4_REGEX.findAll(rawText).map { it.value }.distinct()
            .filter { !it.startsWith("127.") && !it.startsWith("0.") && it != "255.255.255.255" }
            .take(20).toList()

        val domains = DOMAIN_REGEX.findAll(rawText).map { it.value }.distinct()
            .filter { !it.contains("schemas.android.com") && !it.contains("w3.org") }
            .take(20).toList()

        val urls = URL_REGEX.findAll(rawText).map { it.value }.distinct().take(20).toList()

        val packages = PKG_REGEX.findAll(rawText).map { it.value }.distinct()
            .filter { !it.startsWith("android.view") && !it.startsWith("java.lang") }
            .take(20).toList()

        return ExtractedIocs(sha256, md5, ips, domains, urls, packages)
    }

    private fun calculateHash(bytes: ByteArray, algorithm: String): String {
        val digest = MessageDigest.getInstance(algorithm)
        val hash = digest.digest(bytes)
        return hash.joinToString("") { "%02x".format(it) }
    }
}
`,
  },
  {
    path: 'app/src/test/java/com/aegis/mobile/EntropyTest.kt',
    language: 'kotlin',
    description: 'Unit testy pro Shannonovu entropii a extrakci IOC v Kotlinu (JUnit).',
    content: `package com.aegis.mobile

import com.aegis.mobile.analyzer.ShannonEntropyCalculator
import com.aegis.mobile.analyzer.IocExtractor
import org.junit.Assert.*
import org.junit.Test

class EntropyTest {
    @Test
    fun testUniformBytesEntropyZero() {
        val uniform = ByteArray(1024) { 0x41.toByte() } // All 'A'
        val result = ShannonEntropyCalculator.calculate(uniform)
        assertEquals(0.0, result.overall, 0.01)
        assertFalse(result.isSuspicious)
    }

    @Test
    fun testHighEntropyPayloadFlagged() {
        // Pseudo-random high entropy bytes simulating encrypted dex
        val highEntropy = ByteArray(4096)
        java.util.Random(1337).nextBytes(highEntropy)
        val result = ShannonEntropyCalculator.calculate(highEntropy)
        assertTrue("Entropie by měla být > 7.50 pro náhodná data", result.overall >= 7.50)
        assertTrue(result.isSuspicious)
    }

    @Test
    fun testIocExtractorFindsC2AndHash() {
        val sample = """
            c2_server = "http://185.220.101.42/payload.bin"
            domain = "c2.mobile-guard-update.top"
            pkg = "com.evil.trojan.app"
        """.trimIndent().toByteArray(Charsets.UTF_8)

        val iocs = IocExtractor.extract(sample)
        assertTrue(iocs.ipv4Addresses.contains("185.220.101.42"))
        assertTrue(iocs.domains.contains("c2.mobile-guard-update.top"))
        assertTrue(iocs.packageNames.contains("com.evil.trojan.app"))
        assertEquals(64, iocs.sha256.length)
    }
}
`,
  },
  {
    path: 'BUILD_INSTRUCTIONS.md',
    language: 'markdown',
    description: 'Kompletní postup sestavení podepsaného release .apk pro Infinix Hot 50 Pro Plus (X6880).',
    content: `# Sestavení a instalace Aegis Mobile APK na Infinix Hot 50 Pro Plus (X6880)

## 1. Příprava prostředí
- **Telefon:** Infinix Hot 50 Pro Plus (model X6880)
- **OS:** Android 15 (API level 35)
- **Architektura:** arm64-v8a (64-bit ARM)
- **Nástroje:** Android Studio Ladybug / Koala nebo samostatný Android SDK + JDK 17

## 2. Vygenerování podpisového klíče (Keystore)
Spusťte v kořenovém adresáři projektu:
\`\`\`bash
keytool -genkey -v -keystore aegis-release-key.jks \\
  -alias aegis-mobile -keyalg RSA -keysize 4096 -validity 10000 \\
  -dname "CN=Aegis Mobile SOC, OU=Defensive Security, O=Aegis, C=CZ"
\`\`\`

## 3. Sestavení release APK
V terminálu spusťte:
\`\`\`bash
# Nastavení hesel v prostředí
export AEGIS_KEYSTORE_PASSWORD="AegisSecurity2026!"
export AEGIS_KEY_PASSWORD="AegisSecurity2026!"

# Sestavení zipalignovaného a podepsaného release APK pro arm64-v8a
./gradlew assembleRelease
\`\`\`

Výsledný soubor naleznete v:
\`app/build/outputs/apk/release/app-release.apk\`

## 4. Instalace na zařízení Infinix přes ADB
Připojte telefon s povoleným USB laděním:
\`\`\`bash
adb devices
adb install -r app/build/outputs/apk/release/app-release.apk
\`\`\`

Nebo přeneste APK na disk telefonu a otevřete ve Správci souborů.
Při instalaci je nutné povolit: „Instalovat neznámé aplikace" pro daného správce souborů.
Upozornění Play Protect o neznámém vývojáři je u vlastnoručně podepsaného bezpečnostního nástroje očekávané.
`,
  },
];
