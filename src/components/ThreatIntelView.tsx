import React, { useState } from 'react';
import {
  Radio,
  PlusCircle,
  Copy,
  Check,
  Search,
  Webhook,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { ThreatIntelItem } from '../types';

interface ThreatIntelViewProps {
  intel: ThreatIntelItem[];
  onAddIntel: (item: ThreatIntelItem) => void;
  onDeleteIntel: (id: string) => void;
}

export const ThreatIntelView: React.FC<ThreatIntelViewProps> = ({
  intel,
  onAddIntel,
  onDeleteIntel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(intel[0]?.id || null);

  // New IOC state
  const [newTitle, setNewTitle] = useState('');
  const [newIocType, setNewIocType] = useState<ThreatIntelItem['iocType']>('ip');
  const [newValue, setNewValue] = useState('');
  const [newActor, setNewActor] = useState('');
  const [newCampaign, setNewCampaign] = useState('');
  const [newConfidence, setNewConfidence] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newTech, setNewTech] = useState('T1437.001');
  const [newDesc, setNewDesc] = useState('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newValue.trim()) return;

    const item: ThreatIntelItem = {
      id: `intel-${Date.now()}`,
      title: newTitle,
      iocType: newIocType,
      value: newValue.trim(),
      threatActor: newActor.trim() || undefined,
      campaign: newCampaign.trim() || undefined,
      confidence: newConfidence,
      associatedTechnique: newTech.trim() || undefined,
      description: newDesc.trim() || 'Manuálně importovaný indikátor hrozby.',
      firstSeen: new Date().toISOString(),
      tags: [newIocType, 'manual-ingest'],
    };

    onAddIntel(item);
    setIsCreating(false);
    setNewTitle('');
    setNewValue('');
    setNewDesc('');
  };

  // Webhook Simulator
  const handleSimulateWebhook = () => {
    const simulated: ThreatIntelItem = {
      id: `intel-sim-${Date.now()}`,
      title: 'Auto-Ingested C2 Node via MISP/OpenCTI Webhook',
      iocType: 'ip',
      value: `193.142.146.${Math.floor(Math.random() * 200) + 10}`,
      threatActor: 'FluBot / TeaBot Network',
      campaign: 'European Smishing Q3/Q4 Wave',
      confidence: 'High',
      associatedTechnique: 'T1437.001',
      description: 'Automaticky přijato přes webhook z partnerského CSIRT feedu (MISP event #8812).',
      firstSeen: new Date().toISOString(),
      tags: ['webhook', 'misp', 'c2', 'teabot'],
    };
    onAddIntel(simulated);
    setExpandedId(simulated.id);
  };

  const filteredIntel = intel.filter((item) => {
    if (filterType !== 'all' && item.iocType !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q) ||
        item.threatActor?.toLowerCase().includes(q) ||
        item.campaign?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-purple-400">
            <Radio className="h-4 w-4" />
            <span>LOCAL THREAT INTELLIGENCE & FEED CORRELATION</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-100 font-sans">
            Threat Intel Feedy ({intel.length})
          </h1>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Lokální databáze IOC (hashe, C2 adresy, škodlivé balíčky) a webhook integrace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWebhookGuide(!showWebhookGuide)}
            className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800/80 px-3 py-2 font-mono text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <Webhook className="h-3.5 w-3.5 text-purple-400" />
            <span>Webhook Příjemce</span>
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 rounded bg-emerald-500 px-3.5 py-2 font-mono text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-950/40"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Přidat IOC</span>
          </button>
        </div>
      </div>

      {/* Webhook Documentation & Simulator Banner */}
      {showWebhookGuide && (
        <div className="rounded-xl border border-purple-500/40 bg-purple-950/20 p-5 space-y-3 font-mono text-xs text-zinc-300">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-400 uppercase tracking-wide flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              <span>Návod pro příjem Threat Intelu přes Webhook</span>
            </span>
            <button
              onClick={handleSimulateWebhook}
              className="rounded bg-purple-500/20 border border-purple-500/40 px-3 py-1 font-mono text-xs text-purple-300 hover:bg-purple-500/30"
            >
              Simulovat příchozí Webhook Packet
            </button>
          </div>
          <p className="font-sans text-xs text-zinc-300">
            Aegis Mobile SOC umožňuje konzumovat MISP, OpenCTI nebo firemní SIEM výstrahy.
            V nativním Android buildu naslouchá lokální Ktor server nebo FCM zpráva s následujícím JSON formátem:
          </p>
          <pre className="overflow-x-auto rounded bg-zinc-950/80 p-3 text-[11px] text-purple-300 border border-purple-900/50">
{`POST /api/v1/threat-intel/webhook
Content-Type: application/json
Authorization: Bearer <LOCAL_DEVICE_TOKEN>

{
  "iocType": "ip",
  "value": "185.220.101.42",
  "title": "Anatsa C2 Node",
  "threatActor": "Anatsa",
  "confidence": "High",
  "associatedTechnique": "T1437.001"
}`}
          </pre>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Hledat indikátory (IP, hash, doména, útočník, kampaň)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-[#090b10] py-2 pl-9 pr-4 font-mono text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-[#090b10] px-3 py-2 font-mono text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
        >
          <option value="all">Všechny Typy IOC</option>
          <option value="ip">IPv4 / IPv6 Adresy</option>
          <option value="domain">Doménová jména</option>
          <option value="hash">Hashe (SHA-256/MD5)</option>
          <option value="package">Android Package Names</option>
          <option value="url">URL Endpoints</option>
        </select>
      </div>

      {/* Indicators List */}
      <div className="space-y-3">
        {filteredIntel.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-xl border border-zinc-800 bg-[#090b10] p-4 transition-colors hover:border-zinc-700/80"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="flex cursor-pointer items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-purple-500/40 bg-purple-950/40 text-purple-300">
                    {item.iocType}
                  </span>
                  <div>
                    <h3 className="font-sans text-sm font-bold text-zinc-100">
                      {item.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 font-mono text-xs">
                      <span className="text-emerald-400 font-semibold">{item.value}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(item.value, item.id);
                        }}
                        className="text-zinc-500 hover:text-zinc-200"
                        title="Zkopírovat hodnotu IOC"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                      item.confidence === 'High'
                        ? 'border-red-500/40 bg-red-950/30 text-red-400'
                        : item.confidence === 'Medium'
                        ? 'border-amber-500/40 bg-amber-950/30 text-amber-400'
                        : 'border-blue-500/40 bg-blue-950/30 text-blue-400'
                    }`}
                  >
                    Důvěra: {item.confidence}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteIntel(item.id);
                    }}
                    className="text-zinc-500 hover:text-red-400 p-1"
                    title="Smazat indikátor"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                  )}
                </div>
              </div>

              {/* Collapsible detail */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2 font-mono text-xs text-zinc-400">
                  <p className="font-sans text-xs text-zinc-300 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px]">
                    <div>
                      <span className="text-zinc-500">Útočník: </span>
                      <strong className="text-zinc-300">{item.threatActor || 'Neuvedeno'}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500">Kampaň: </span>
                      <strong className="text-zinc-300">{item.campaign || 'Neznámá'}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500">ATT&CK Technika: </span>
                      <strong className="text-cyan-400">{item.associatedTechnique || 'Není'}</strong>
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] text-zinc-500 flex items-center justify-between">
                    <span>První záchyt: {new Date(item.firstSeen).toLocaleString('cs-CZ')}</span>
                    <span>Tagy: {item.tags.join(', ')}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add IOC Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-[#090b10] p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-zinc-100 font-sans">
              Přidat Nový Indikátor Kompromitace (IOC)
            </h2>
            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block font-mono text-xs text-zinc-400 mb-1">
                  Název Záznamu
                </label>
                <input
                  type="text"
                  required
                  placeholder="Např. Anatsa C2 Gateway Host..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs text-zinc-400 mb-1">
                    Typ IOC
                  </label>
                  <select
                    value={newIocType}
                    onChange={(e) => setNewIocType(e.target.value as ThreatIntelItem['iocType'])}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="ip">IP Adresa</option>
                    <option value="domain">Doména</option>
                    <option value="hash">Hash (SHA-256)</option>
                    <option value="package">Package Name</option>
                    <option value="url">URL Endpoint</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs text-zinc-400 mb-1">
                    Důvěryhodnost (Confidence)
                  </label>
                  <select
                    value={newConfidence}
                    onChange={(e) => setNewConfidence(e.target.value as any)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="High">Vysoká (High)</option>
                    <option value="Medium">Střední (Medium)</option>
                    <option value="Low">Nízká (Low)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-zinc-400 mb-1">
                  Hodnota IOC
                </label>
                <input
                  type="text"
                  required
                  placeholder="185.220.101.42 nebo malicious-domain.top nebo hash..."
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs text-zinc-400 mb-1">
                    Útočník / Skupina
                  </label>
                  <input
                    type="text"
                    placeholder="SharkBot Syndicate"
                    value={newActor}
                    onChange={(e) => setNewActor(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-zinc-400 mb-1">
                    ATT&CK Technika
                  </label>
                  <input
                    type="text"
                    placeholder="T1437.001"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-zinc-400 mb-1">
                  Popis & Kontext
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Kde byl indikátor zaznamenán a jaké chování způsobuje..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="rounded px-4 py-2 font-mono text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="rounded bg-emerald-500 px-4 py-2 font-mono text-xs font-semibold text-zinc-950 hover:bg-emerald-400"
                >
                  Uložit IOC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
