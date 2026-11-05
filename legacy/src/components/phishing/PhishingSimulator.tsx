import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  MailWarning, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  HelpCircle, 
  FileWarning, 
  CornerDownRight, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Flame,
  Award
} from 'lucide-react';
import { PhishingEmail, UserProfile } from '../../types';
import { PHISHING_SCENARIOS } from '../../data/phishingScenarios';

interface PhishingSimulatorProps {
  user: UserProfile;
  onUpdatePhishingStats: (reportedSuccess: boolean, pointsEarned: number) => void;
}

export const PhishingSimulator: React.FC<PhishingSimulatorProps> = ({
  user,
  onUpdatePhishingStats
}) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const currentScenario = PHISHING_SCENARIOS[selectedScenarioIndex];

  const [showHeaders, setShowHeaders] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  // Simulation test flow states
  const [testState, setTestState] = useState<'idle' | 'reporting' | 'reported_success' | 'clicked_trap'>('idle');
  const [selectedRedFlags, setSelectedRedFlags] = useState<string[]>([]);
  const [reportError, setReportError] = useState('');

  const handleSelectScenario = (index: number) => {
    setSelectedScenarioIndex(index);
    setTestState('idle');
    setSelectedRedFlags([]);
    setReportError('');
    setShowHeaders(false);
  };

  const toggleRedFlag = (flagId: string) => {
    setSelectedRedFlags(prev => 
      prev.includes(flagId) ? prev.filter(id => id !== flagId) : [...prev, flagId]
    );
  };

  const handleConfirmReport = () => {
    if (selectedRedFlags.length === 0) {
      setReportError('Selecione pelo menos um indicador suspeito (Red Flag) para justificar a denúncia de phishing.');
      return;
    }

    // Success!
    setReportError('');
    setTestState('reported_success');
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
    onUpdatePhishingStats(true, 120);
  };

  const handleSimulateClickTrap = () => {
    setTestState('clicked_trap');
    onUpdatePhishingStats(false, 0);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
            <MailWarning className="w-3.5 h-3.5" />
            <span>Simulações Controladas de Engenharia Social</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Laboratório Prático de Detecção de Phishing
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Ataques de phishing são responsáveis por mais de <strong className="text-amber-400">80% das invasões corporativas</strong>. Inspecione e-mails autênticos simulados, verifique cabeçalhos técnicos de autenticação (SPF/DKIM) e reporte as ameaças antes que comprometam a empresa.
          </p>
        </div>

        {/* Resiliência Stats */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 min-w-[250px] shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Sua Resiliência a Phishing</span>
            <span className="font-mono text-emerald-400 font-bold">
              {user.phishingSimulationsTested > 0 
                ? `${Math.round((user.phishingSimulationsReported / user.phishingSimulationsTested) * 100)}%`
                : '100%'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <div className="text-emerald-400 font-mono font-bold text-base">{user.phishingSimulationsReported}</div>
              <div className="text-[10px] text-slate-400">Reportados</div>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <div className="text-rose-400 font-mono font-bold text-base">{user.phishingSimulationsFailed}</div>
              <div className="text-[10px] text-slate-400">Cliques Falsos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {PHISHING_SCENARIOS.map((scenario, idx) => (
          <button
            key={scenario.id}
            onClick={() => handleSelectScenario(idx)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedScenarioIndex === idx
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-950/20 flex items-center justify-center font-mono text-[11px]">
              0{idx + 1}
            </span>
            <span>{scenario.campaignTitle.split(':')[1] || scenario.campaignTitle}</span>
          </button>
        ))}
      </div>

      {/* Main Mail Client Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Email Client Simulator */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          
          {/* Email Client Header Bar */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-mono text-slate-300 ml-2">Inbox &bull; Microsoft 365 Web Client (Simulador)</span>
            </div>
            
            <button
              onClick={() => setShowHeaders(!showHeaders)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showHeaders ? 'Ocultar Cabeçalhos RFC' : 'Inspecionar Cabeçalhos'}</span>
              {showHeaders ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Technical Headers Drawer (SPF, DKIM, DMARC) */}
          {showHeaders && (
            <div className="bg-slate-950/90 border-b border-slate-800 p-4 font-mono text-xs space-y-2 text-slate-300 animate-in fade-in">
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Análise de Autenticação de Email (Gateway Antispam)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span>SPF Check:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    currentScenario.headers.spf === 'FAIL' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {currentScenario.headers.spf}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span>DKIM Signature:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    currentScenario.headers.dkim === 'FAIL' || currentScenario.headers.dkim === 'NONE'
                      ? 'bg-rose-500/20 text-rose-400' 
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {currentScenario.headers.dkim}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span>DMARC Policy:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    currentScenario.headers.dmarc === 'FAIL' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {currentScenario.headers.dmarc}
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                <div><strong>Return-Path:</strong> {currentScenario.headers.returnPath}</div>
                <div><strong>Reply-To:</strong> <span className="text-amber-400 font-bold">{currentScenario.headers.replyTo}</span></div>
                <div><strong>Auth-Results:</strong> {currentScenario.headers.authResults}</div>
              </div>
            </div>
          )}

          {/* Email Envelope Summary */}
          <div className="p-4 sm:p-6 border-b border-slate-800 space-y-3 bg-slate-900/40">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {currentScenario.subject}
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-300 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 border border-slate-700">
                  {currentScenario.senderName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-white">{currentScenario.senderName}</div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    &lt;{currentScenario.senderEmail}&gt;
                  </div>
                </div>
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                {currentScenario.date}
              </div>
            </div>
          </div>

          {/* Email Body Content */}
          <div className="p-4 sm:p-6 bg-slate-950 flex-1 overflow-y-auto">
            <div 
              className="bg-white rounded-xl p-4 sm:p-6 text-slate-900 shadow-lg"
              dangerouslySetInnerHTML={{ __html: currentScenario.bodyHtml }}
            />

            {/* Simulated Suspicious Link preview trigger */}
            {currentScenario.suspiciousLink && (
              <div className="mt-4 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Destino real do link embutido no botão:</span>
                </span>
                <code className="text-amber-400 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  {currentScenario.suspiciousLink.actualUrl}
                </code>
              </div>
            )}
          </div>

          {/* Actions Bar (Report vs Simulate Click) */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              O que você faria como colaborador ao receber esta mensagem?
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Trap Trigger */}
              <button
                type="button"
                onClick={handleSimulateClickTrap}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
              >
                Simular Clique no Link / Anexo
              </button>

              {/* Phishing Report Action */}
              <button
                type="button"
                onClick={() => setTestState('reporting')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <MailWarning className="w-4 h-4" />
                <span>Reportar como Phishing</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Col: Interactive Red Flag Checklist & Educational Feedback */}
        <div className="space-y-4">
          
          {/* State 1: IDLE / Guidelines */}
          {testState === 'idle' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Eye className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white">Instruções de Análise</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Analise minuciosamente os dados do email ao lado:
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-amber-400 font-bold">1.</span>
                  <span>O domínio do remetente bate exatamente com o oficial da empresa?</span>
                </li>
                <li className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-amber-400 font-bold">2.</span>
                  <span>Existe tom de urgência ou ameaça de perda se não agir rápido?</span>
                </li>
                <li className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-amber-400 font-bold">3.</span>
                  <span>O botão ou anexo direciona para um servidor externo desconhecido?</span>
                </li>
              </ul>
              <div className="pt-2">
                <button
                  onClick={() => setTestState('reporting')}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Identificar Red Flags Agora
                </button>
              </div>
            </div>
          )}

          {/* State 2: REPORTING / Red Flags Checklist Selection */}
          {testState === 'reporting' && (
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <MailWarning className="w-5 h-5" />
                  <h3 className="font-bold text-sm text-white">Quais Red Flags você encontrou?</h3>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                Marque todos os sinais de perigo presentes nesta mensagem para justificar o alerta ao SOC:
              </p>

              <div className="space-y-2">
                {currentScenario.redFlags.map((rf) => {
                  const isChecked = selectedRedFlags.includes(rf.id);
                  return (
                    <div
                      key={rf.id}
                      onClick={() => toggleRedFlag(rf.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked 
                          ? 'bg-amber-950/40 border-amber-500 text-amber-200' 
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-0"
                        />
                        <div className="space-y-1">
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>{rf.title}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono">
                              {rf.severity}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {rf.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {reportError && (
                <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/40 p-2 rounded-lg">
                  {reportError}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTestState('idle')}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white rounded-lg bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReport}
                  className="flex-1 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors cursor-pointer"
                >
                  Confirmar Denúncia ao SOC (+120 pts)
                </button>
              </div>
            </div>
          )}

          {/* State 3: REPORTED SUCCESS */}
          {testState === 'reported_success' && (
            <div className="bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-500/40 rounded-2xl p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white">Excelente! Denúncia Efetuada com Sucesso</h3>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300">
                Você identificou a ameaça com precisão e protegeu a rede corporativa! Sua pontuação aumentou em <strong>+120 pontos</strong>.
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] block">
                  Análise da Tática Utilizada:
                </span>
                <p className="text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <strong className="text-white">Gatilho Psicológico:</strong> {currentScenario.educationalExplanation.psychologicalTrigger}
                </p>
                <p className="text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <strong className="text-white">Vetor:</strong> {currentScenario.educationalExplanation.tactic}
                </p>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] block">
                  Como Prevenir no Dia a Dia:
                </span>
                {currentScenario.educationalExplanation.howToPrevent.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 bg-slate-950 p-2 rounded border border-slate-800 text-slate-300 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setTestState('idle')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition-colors"
              >
                Voltar à Análise
              </button>
            </div>
          )}

          {/* State 4: CLICKED TRAP (Educational Pwned Screen) */}
          {testState === 'clicked_trap' && (
            <div className="bg-gradient-to-b from-rose-950/40 to-slate-900 border border-rose-500/50 rounded-2xl p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
                <h3 className="font-bold text-sm text-white">Atenção: Você Caiu na Simulação de Phishing!</h3>
              </div>

              <p className="text-xs text-rose-200 bg-rose-950/40 border border-rose-500/30 p-3 rounded-xl leading-relaxed">
                Em um cenário real, clicar neste link ou anexo teria resultado no <strong>roubo imediato das suas credenciais de rede</strong> ou na execução de ransomware no seu computador.
              </p>

              <div className="space-y-2 text-xs">
                <span className="font-semibold text-white uppercase tracking-wider text-[11px] block">
                  Veja os Sinais que Você Não Notou:
                </span>
                {currentScenario.redFlags.map((rf) => (
                  <div key={rf.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 space-y-1">
                    <div className="font-semibold text-amber-400 text-xs flex items-center gap-1.5">
                      <span>&bull;</span>
                      <span>{rf.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{rf.description}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setTestState('reporting')}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                >
                  Tentar Reportar Novamente
                </button>
                <button
                  onClick={() => setTestState('idle')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}

          {/* Corporate Phishing Campaign Metrics Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Impacto Corporativo das Simulações</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>Taxa de cliques inicial na empresa:</span>
                <span className="text-rose-400 font-mono font-bold">28.4%</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>Taxa atual após treinamentos:</span>
                <span className="text-emerald-400 font-mono font-bold">8.2% (-71%)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Meta da Diretoria de Segurança:</span>
                <span className="text-cyan-400 font-mono font-bold">&lt; 3.0%</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
