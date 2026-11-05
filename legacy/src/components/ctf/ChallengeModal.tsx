import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Terminal as TerminalIcon, 
  Globe, 
  Code2, 
  Lightbulb, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Building2, 
  ShieldAlert, 
  Sparkles,
  FlaskConical,
  KeyRound,
  GitBranch,
  Cloud,
  Mail
} from 'lucide-react';
import { Challenge, UserProfile } from '../../types';
import { executeVirtualShellCommand, CommandOutput } from '../../utils/virtualTerminal';

// Specialized Interactive Labs
import { SqlInjectionLab } from './labs/SqlInjectionLab';
import { IdorLab } from './labs/IdorLab';
import { CryptoHashLab } from './labs/CryptoHashLab';
import { JwtLab } from './labs/JwtLab';
import { NetworkForensicsLab } from './labs/NetworkForensicsLab';
import { GitLab } from './labs/GitLab';
import { CloudBucketLab } from './labs/CloudBucketLab';
import { EmailForensicsLab } from './labs/EmailForensicsLab';

interface ChallengeModalProps {
  challenge: Challenge;
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSolve: (challengeId: string, earnedPoints: number) => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  challenge,
  user,
  isOpen,
  onClose,
  onSolve
}) => {
  const isAlreadySolved = user.completedChallengeIds.includes(challenge.id);
  const [activeTab, setActiveTab] = useState<'lab' | 'terminal' | 'code' | 'hints'>('lab');
  
  // Flag input state
  const [flagInput, setFlagInput] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedFlag, setCopiedFlag] = useState(false);
  const [discoveredFlag, setDiscoveredFlag] = useState<string | null>(null);

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<CommandOutput[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Hints state
  const [revealedHints, setRevealedHints] = useState<string[]>([]);

  // Sound chime synthesizer
  const playSuccessChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.3); // C6
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {
      // Audio not supported or blocked
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSubmissionStatus(isAlreadySolved ? 'success' : 'idle');
      setFlagInput(isAlreadySolved ? challenge.flag : '');
      setActiveTab('lab'); // default to practical lab!
      setDiscoveredFlag(null);
      
      // Initialize terminal welcome
      setTerminalHistory([
        { text: `[+] Conectado ao ambiente seguro corporativo CyberShield v2.6`, type: 'success' },
        { text: `[+] Alvo: ${challenge.corporateContext}`, type: 'output' },
        { text: `[+] Digite "help" para ver comandos disponíveis ou "ls" para inspecionar arquivos.\n`, type: 'output' }
      ]);
    }
  }, [isOpen, challenge, isAlreadySolved]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  if (!isOpen) return null;

  const handleFlagDiscoveredInLab = (foundFlag: string) => {
    setDiscoveredFlag(foundFlag);
    setFlagInput(foundFlag);
  };

  // Terminal command handler
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    if (cmd.toLowerCase() === 'clear') {
      setTerminalHistory([]);
      setTerminalInput('');
      return;
    }

    const promptText = challenge.terminalPrompt || 'analyst@corp-sec:~$';
    const outputs = executeVirtualShellCommand(
      cmd,
      challenge,
      challenge.initialFiles || {},
      handleFlagDiscoveredInLab
    );

    setTerminalHistory(prev => [
      ...prev,
      { text: `${promptText} ${cmd}`, type: 'input' },
      ...outputs
    ]);

    setCommandHistory(prev => [...prev, cmd]);
    setHistoryPointer(-1);
    setTerminalInput('');
  };

  const handleTerminalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextPointer = historyPointer === -1 ? commandHistory.length - 1 : Math.max(0, historyPointer - 1);
      setHistoryPointer(nextPointer);
      setTerminalInput(commandHistory[nextPointer] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer === -1) return;
      const nextPointer = historyPointer + 1;
      if (nextPointer >= commandHistory.length) {
        setHistoryPointer(-1);
        setTerminalInput('');
      } else {
        setHistoryPointer(nextPointer);
        setTerminalInput(commandHistory[nextPointer] || '');
      }
    }
  };

  // Flag submission validator
  const handleSubmitFlag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFlag = flagInput.trim();

    if (!cleanFlag) {
      setErrorMessage('Por favor, insira a flag no formato CYBER{...}');
      setSubmissionStatus('error');
      return;
    }

    if (cleanFlag === challenge.flag) {
      setSubmissionStatus('success');
      setErrorMessage('');
      playSuccessChime();
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });
      if (!isAlreadySolved) {
        onSolve(challenge.id, challenge.points);
      }
    } else {
      setSubmissionStatus('error');
      setErrorMessage('Flag incorreta. Realize os testes nos laboratórios ou no terminal para extrair o valor exato.');
    }
  };

  const copyFlagToClipboard = () => {
    navigator.clipboard.writeText(challenge.flag);
    setCopiedFlag(true);
    setTimeout(() => setCopiedFlag(false), 2000);
  };

  // Render the tailored specialized lab
  const renderSpecializedLab = () => {
    switch (challenge.id) {
      case 'ctf-01':
        return <SqlInjectionLab challenge={challenge} onFlagDiscovered={handleFlagDiscoveredInLab} />;
      case 'ctf-02':
        return <CryptoHashLab challenge={challenge} onFlagDiscovered={handleFlagDiscoveredInLab} />;
      case 'ctf-03':
        return <IdorLab challenge={challenge} onFlagDiscovered={handleFlagDiscoveredInLab} />;
      case 'ctf-04':
        return <JwtLab challenge={challenge} onFlagDiscovered={handleFlagDiscoveredInLab} />;
      case 'ctf-05':
        return <NetworkForensicsLab challenge={challenge} onFlagDiscovered={handleFlagDiscoveredInLab} />;
      case 'ctf-06':
        return <GitLab challenge={challenge} onFlagDiscovered={handleFlagDiscoveredInLab} />;
      case 'ctf-07':
        return <EmailForensicsLab challenge={challenge} onFlagDiscovered={handleFlagDiscoveredInLab} />;
      case 'ctf-08':
        return <CloudBucketLab challenge={challenge} onFlagDiscovered={handleFlagDiscoveredInLab} />;
      default:
        return null;
    }
  };

  const getLabIcon = () => {
    switch (challenge.id) {
      case 'ctf-01': return Globe;
      case 'ctf-02': return KeyRound;
      case 'ctf-03': return Globe;
      case 'ctf-04': return Cloud;
      case 'ctf-05': return ShieldAlert;
      case 'ctf-06': return GitBranch;
      case 'ctf-07': return Mail;
      case 'ctf-08': return Cloud;
      default: return FlaskConical;
    }
  };

  const LabIcon = getLabIcon();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {challenge.category}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                  +{challenge.points} PTS
                </span>
                {isAlreadySolved && (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    RESOLVIDO
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white mt-1 leading-snug">
                {challenge.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Corporate Context Banner */}
          <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-4 flex items-start gap-3 shadow-inner">
            <Building2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Cenário Corporativo Real
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {challenge.corporateContext}
              </p>
            </div>
          </div>

          {/* Objective Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Objetivo da Missão
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800">
              {challenge.description}
            </p>
          </div>

          {/* Discovered Flag Notice */}
          {discoveredFlag && submissionStatus !== 'success' && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-500/60 rounded-xl flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Flag capturada nos testes: <strong className="font-mono text-white">{discoveredFlag}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setFlagInput(discoveredFlag)}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
              >
                Preencher Campo
              </button>
            </div>
          )}

          {/* Tabs Bar */}
          <div className="space-y-3">
            <div className="flex items-center gap-1 border-b border-slate-800 pb-1">
              
              <button
                onClick={() => setActiveTab('lab')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
                  activeTab === 'lab'
                    ? 'bg-slate-950 text-cyan-400 border-t-2 border-cyan-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <LabIcon className="w-3.5 h-3.5" />
                <span>Laboratório de Testes Reais</span>
              </button>

              <button
                onClick={() => setActiveTab('terminal')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
                  activeTab === 'terminal'
                    ? 'bg-slate-950 text-emerald-400 border-t-2 border-emerald-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <TerminalIcon className="w-3.5 h-3.5" />
                <span>Terminal Bash Interativo</span>
              </button>

              {challenge.sourceCodeSnippet && (
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
                    activeTab === 'code'
                      ? 'bg-slate-950 text-amber-400 border-t-2 border-amber-500'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Código Fonte Backend</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('hints')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
                  activeTab === 'hints'
                    ? 'bg-slate-950 text-purple-400 border-t-2 border-purple-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Dicas Graduais ({challenge.hints.length})</span>
              </button>
            </div>

            {/* TAB CONTENT: SPECIALIZED LAB */}
            {activeTab === 'lab' && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                {renderSpecializedLab()}
              </div>
            )}

            {/* TAB CONTENT: TERMINAL */}
            {activeTab === 'terminal' && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs shadow-2xl">
                <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-[11px] text-slate-400 ml-2 font-mono">bash &bull; {challenge.terminalPrompt || 'analyst@corp-sec'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Ajuda: digite "help" | Histórico: Setas &uarr; &darr;</span>
                </div>

                <div className="p-4 h-64 overflow-y-auto space-y-1.5 scrollbar-thin">
                  {terminalHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className={`whitespace-pre-wrap ${
                        item.type === 'input'
                          ? 'text-cyan-300 font-bold'
                          : item.type === 'error'
                          ? 'text-rose-400'
                          : item.type === 'success'
                          ? 'text-emerald-400 font-bold'
                          : 'text-slate-300'
                      }`}
                    >
                      {item.text}
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>

                {/* Terminal Input Line */}
                <form onSubmit={handleTerminalSubmit} className="flex items-center border-t border-slate-800/80 bg-slate-950 px-3 py-2">
                  <span className="text-emerald-400 font-mono font-bold mr-2">
                    {challenge.terminalPrompt || 'analyst@corp-sec:~$'}
                  </span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={handleTerminalKeyDown}
                    placeholder="ls, cat arquivo, md5 texto, base64 -d, git log, help..."
                    className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder-slate-600"
                    autoFocus
                  />
                  <button type="submit" className="text-slate-500 hover:text-emerald-400 px-2 py-0.5 text-xs font-mono">
                    ENTER
                  </button>
                </form>
              </div>
            )}

            {/* TAB CONTENT: CODE */}
            {activeTab === 'code' && challenge.sourceCodeSnippet && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs shadow-inner space-y-2">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <span className="text-cyan-400 font-semibold">{challenge.sourceCodeSnippet.fileName}</span>
                  <span className="text-[11px] uppercase">{challenge.sourceCodeSnippet.language}</span>
                </div>
                <pre className="overflow-x-auto text-slate-300 p-2 leading-relaxed">
                  {challenge.sourceCodeSnippet.code}
                </pre>
              </div>
            )}

            {/* TAB CONTENT: HINTS */}
            {activeTab === 'hints' && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="text-xs text-slate-400">
                  Dicas graduais para orientar sua investigação sem entregar a resposta completa:
                </div>
                {challenge.hints.map((hint, idx) => {
                  const isRevealed = revealedHints.includes(hint.id) || isAlreadySolved;
                  return (
                    <div key={hint.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">
                          Dica #{idx + 1}
                        </span>
                        {!isRevealed ? (
                          <button
                            type="button"
                            onClick={() => setRevealedHints([...revealedHints, hint.id])}
                            className="text-xs px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:bg-purple-900 transition-colors cursor-pointer"
                          >
                            Revelar Dica (-{hint.cost} pts)
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-mono">Desbloqueada</span>
                        )}
                      </div>
                      {isRevealed && (
                        <p className="text-xs text-purple-200 leading-relaxed font-sans bg-purple-950/20 p-2 rounded border border-purple-500/20">
                          {hint.content}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* FLAG SUBMISSION BAR */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Submissão de Flag (Formato: CYBER&#123;...&#125;)</span>
              </label>
              {isAlreadySolved && (
                <button
                  type="button"
                  onClick={copyFlagToClipboard}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  {copiedFlag ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFlag ? 'Copiada!' : 'Copiar Flag'}</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitFlag} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={flagInput}
                onChange={(e) => {
                  setFlagInput(e.target.value);
                  if (submissionStatus === 'error') setSubmissionStatus('idle');
                }}
                placeholder="CYBER{...}"
                className={`flex-1 px-4 py-2.5 bg-slate-900 border rounded-lg font-mono text-sm text-white placeholder-slate-600 focus:outline-none transition-colors ${
                  submissionStatus === 'error'
                    ? 'border-rose-500 focus:border-rose-500'
                    : submissionStatus === 'success'
                    ? 'border-emerald-500 focus:border-emerald-500 text-emerald-300'
                    : 'border-slate-700 focus:border-emerald-500'
                }`}
              />

              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Validar Flag</span>
              </button>
            </form>

            {submissionStatus === 'error' && (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 border border-rose-500/30 p-2.5 rounded-lg">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {submissionStatus === 'success' && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Parabéns! Flag correta confirmada pelo sistema de validação corporativo.</span>
              </div>
            )}
          </div>

          {/* EDUCATIONAL BREAKDOWN & CORPORATE PREVENTION GUIDE (Visible when solved or if already solved) */}
          {(submissionStatus === 'success' || isAlreadySolved) && (
            <div className="border border-emerald-500/40 bg-gradient-to-b from-slate-950 to-emerald-950/20 rounded-xl p-5 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-emerald-400 border-b border-emerald-500/30 pb-2">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white">
                  Análise Pós-Incidente & Guia de Prevenção Corporativa
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    Causa Raiz da Vulnerabilidade:
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    {challenge.explanation.rootCause}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    Impacto no Negócio da Empresa:
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    {challenge.explanation.realWorldImpact}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] block">
                  Como Evitar nos Nossos Sistemas Internos:
                </span>
                <ul className="space-y-1.5">
                  {challenge.explanation.mitigationBestPractices.map((practice, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-emerald-300 bg-slate-950/80 p-2 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{practice}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {challenge.explanation.cweReference && (
                <div className="text-[11px] text-slate-500 font-mono">
                  Referência Técnica: {challenge.explanation.cweReference}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <span>Autor do Desafio: <strong className="text-slate-400">{challenge.author}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>

    </div>
  );
};
