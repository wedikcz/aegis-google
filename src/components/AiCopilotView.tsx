import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Shield,
  Layers,
  Terminal,
  Settings,
  Trash2,
  Cpu,
  User,
} from 'lucide-react';
import { MoEExpert, CopilotMessage } from '../types';
import { EXPERT_PERSONAS, AiCopilotService } from '../services/aiCopilot';

interface AiCopilotViewProps {
  messages: CopilotMessage[];
  onSendMessage: (msg: CopilotMessage) => void;
  onClearChat: () => void;
  onOpenSettings: () => void;
}

const QUICK_PROMPTS: Record<MoEExpert, string[]> = {
  'Threat Analyst': [
    'Jak analyzovat APK maskované za Flashlight s C2 komunikací?',
    'Vysvětli rozdíl v chování bankovních trojanů Anatsa a SharkBot.',
    'Co indikuje Shannonova entropie 7.85 v souboru classes.dex?',
  ],
  'IR Coach': [
    'Uživatel nahlásil neznámé okno s požadavkem na kód z SMS. Jak postupovat?',
    'Jak bezpečně restartovat Infinix Hot 50 Pro+ do Nouzového režimu?',
    'Sestav 5 kroků okamžité izolace telefonu od firemní sítě.',
  ],
  'Code Auditor': [
    'Zkontroluj bezpečnostní rizika deklarace BIND_ACCESSIBILITY_SERVICE v manifestu.',
    'Jak v Android 15 správně zabezpečit exportovaný BroadcastReceiver?',
    'Uveď doporučenou konfiguraci pro EncryptedSharedPreferences s MasterKey.',
  ],
  'ATT&CK Navigator': [
    'Jaké techniky odpovídají odcizení jednorázových hesel přes SMS?',
    'Které mitigace doporučuje MITRE pro techniku T1628 (Accessibility Abuse)?',
    'Navrhni testovací scénář pro ověření ochrany proti Screen Overlay útoku (T1411).',
  ],
};

export const AiCopilotView: React.FC<AiCopilotViewProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  onOpenSettings,
}) => {
  const [selectedExpert, setSelectedExpert] = useState<MoEExpert>('Threat Analyst');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const expertMeta = EXPERT_PERSONAS[selectedExpert];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    onSendMessage(userMsg);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const response = await AiCopilotService.sendMessage(
        text,
        selectedExpert,
        [...messages, userMsg]
      );

      const assistantMsg: CopilotMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        expert: selectedExpert,
        content: response,
        timestamp: new Date().toISOString(),
      };
      onSendMessage(assistantMsg);
    } catch (err) {
      console.error('Copilot send error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
            <Bot className="h-4 w-4" />
            <span>MIXTURE-OF-EXPERTS (MoE) DEFENSIVE COPILOT</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-100 font-sans">
            AI Bezpečnostní Asistent
          </h1>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            4 specializované expertní modely. Podpora vlastního API klíče (OpenRouter / DeepSeek / Qwen) nebo offline SOC enginu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 font-mono text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Nastavení Klíče</span>
          </button>
          <button
            onClick={onClearChat}
            className="rounded border border-zinc-800 bg-[#090b10] p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
            title="Smazat historii konverzace"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* MoE Expert Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {(Object.keys(EXPERT_PERSONAS) as MoEExpert[]).map((expert) => {
          const isSelected = selectedExpert === expert;
          const meta = EXPERT_PERSONAS[expert];
          return (
            <button
              key={expert}
              onClick={() => setSelectedExpert(expert)}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                isSelected
                  ? `${meta.avatarColor} border-opacity-100 shadow-lg`
                  : 'border-zinc-800 bg-[#090b10] text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                  {meta.badge}
                </span>
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
              <span className="mt-1 font-sans text-xs font-bold text-zinc-100">
                {meta.title}
              </span>
              <span className="mt-0.5 font-sans text-[11px] text-zinc-400 line-clamp-1">
                {meta.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Log */}
      <div className="min-h-[350px] max-h-[500px] overflow-y-auto rounded-xl border border-zinc-800 bg-[#090b10] p-4 sm:p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400">
            <Bot className="h-10 w-10 text-cyan-400/50 mb-2" />
            <h3 className="font-sans text-sm font-bold text-zinc-200">
              Připraven expertní model: {expertMeta.title}
            </h3>
            <p className="mt-1 font-mono text-xs max-w-md">
              Zeptejte se na analýzu zachycených podezřelých souborů, postup izolace v Incident Response nebo kontrolu kódu v Android 15.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-400">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-3.5 text-xs font-sans leading-relaxed ${
                    isUser
                      ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/40'
                      : 'bg-zinc-900/80 text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {!isUser && msg.expert && (
                    <div className="mb-1 font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                      {msg.expert}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div className="mt-2 text-right font-mono text-[10px] text-zinc-500">
                    {new Date(msg.timestamp).toLocaleTimeString('cs-CZ')}
                  </div>
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-emerald-400">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
            <span className="flex h-2 w-2 animate-ping rounded-full bg-cyan-400" />
            <span>{expertMeta.title} analyzuje dotaz...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts Carousel */}
      <div>
        <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider block mb-1.5">
          Doporučené dotazy pro {expertMeta.title}:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS[selectedExpert].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 font-sans text-xs text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          placeholder={`Zeptejte se experta (${expertMeta.title})...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-800 bg-[#090b10] px-4 py-2.5 font-mono text-xs text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2.5 font-mono text-xs font-semibold text-zinc-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors shadow-lg shadow-cyan-950/50"
        >
          <Send className="h-4 w-4" />
          <span>Odeslat</span>
        </button>
      </form>
    </div>
  );
};
