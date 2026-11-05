import React, { useState } from 'react';
import { Play, KeyRound, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, Copy, Check } from 'lucide-react';
import { calculateMD5 } from '../../../utils/cryptoUtils';
import { Challenge } from '../../../types';

interface CryptoHashLabProps {
  challenge: Challenge;
  onFlagDiscovered: (flag: string) => void;
}

export const CryptoHashLab: React.FC<CryptoHashLabProps> = ({ challenge, onFlagDiscovered }) => {
  const targetHash = 'e10adc3949ba59abbe56e057f20f883e';

  // Live calculator state
  const [testString, setTestString] = useState('123456');
  const liveHash = calculateMD5(testString);
  const isMatchLive = liveHash.toLowerCase() === targetHash.toLowerCase();

  // Dictionary attack state
  const [wordlistText, setWordlistText] = useState(
    'password\n123456\nqwerty\nadmin123\n12345678\nwelcome\nempresa2024\nsuporte123\nfinanceiro'
  );
  const [isRunningAttack, setIsRunningAttack] = useState(false);
  const [attackLogs, setAttackLogs] = useState<string[]>([]);
  const [crackedPassword, setCrackedPassword] = useState<string | null>(null);

  const handleRunDictionaryAttack = () => {
    setIsRunningAttack(true);
    setAttackLogs([
      `[+] Iniciando auditoria de quebra de hash com Hashcat v6.2 (Modo MD5 - 0)...`,
      `[+] Alvo: ${targetHash}`,
      `[+] Carregando candidatos da wordlist...`
    ]);
    setCrackedPassword(null);

    const words = wordlistText.split('\n').map(w => w.trim()).filter(Boolean);
    let index = 0;

    const interval = setInterval(() => {
      if (index >= words.length) {
        clearInterval(interval);
        setIsRunningAttack(false);
        setAttackLogs(prev => [...prev, `[-] Fim da wordlist. Nenhuma correspondência adicional.`]);
        return;
      }

      const currentWord = words[index];
      const currentMd5 = calculateMD5(currentWord);

      if (currentMd5.toLowerCase() === targetHash.toLowerCase()) {
        clearInterval(interval);
        setIsRunningAttack(false);
        setCrackedPassword(currentWord);
        setAttackLogs(prev => [
          ...prev,
          `[!] MATCH ENCONTRADO!`,
          `    Candidato: "${currentWord}"`,
          `    Hash Calculado: ${currentMd5}`,
          `[+] Hash quebrado com sucesso em ${index + 1} tentativas!`,
          `[+] Construindo Flag: CYBER{${currentWord}}`
        ]);
        onFlagDiscovered(`CYBER{${currentWord}}`);
      } else {
        setAttackLogs(prev => [
          ...prev.slice(-6),
          `[-] Testando "${currentWord}" => ${currentMd5} (Incorreto)`
        ]);
      }

      index++;
    }, 250);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Target Info */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 font-sans">
        <div className="flex items-center gap-2 text-purple-400 font-bold">
          <KeyRound className="w-4 h-4" />
          <span>Laboratório de Criptoanálise & Quebra de Hashes</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
          <div>
            <span className="text-slate-500">Hash Alvo (MD5 sem Salt): </span>
            <span className="text-amber-300 font-bold">{targetHash}</span>
          </div>
          <span className="text-slate-400 text-[11px] font-sans">Usuário: suporte_financeiro</span>
        </div>
      </div>

      {/* Real Live MD5 Hash Calculator */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-sans flex items-center justify-between">
          <span>1. Calculador de Hash MD5 em Tempo Real (RFC 1321):</span>
          {isMatchLive && (
            <span className="text-emerald-400 font-mono flex items-center gap-1 font-bold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" /> MATCH COM O HASH ALVO!
            </span>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-slate-400 font-sans block text-xs">
            Digite qualquer texto/senha para computar seu hash MD5 exato:
          </label>
          <input
            type="text"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-purple-500 focus:outline-none"
            placeholder="Digite uma senha para testar..."
          />
        </div>

        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400">MD5 Resultado Calculado:</div>
          <div className={`font-mono text-xs font-bold break-all ${isMatchLive ? 'text-emerald-400' : 'text-slate-300'}`}>
            {liveHash}
          </div>
        </div>
      </div>

      {/* Dictionary Attack Runner */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-sans">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            2. Ataque de Dicionário Automatizado (Hashcat Simulator):
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {wordlistText.split('\n').filter(Boolean).length} palavras carregadas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Wordlist (uma palavra por linha):</label>
            <textarea
              rows={5}
              value={wordlistText}
              onChange={(e) => setWordlistText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none scrollbar-thin"
            />
          </div>

          <div className="space-y-1 flex flex-col justify-between">
            <div>
              <label className="text-[11px] text-slate-400">Log de Execução:</label>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono text-slate-300 h-28 overflow-y-auto space-y-1 scrollbar-thin">
                {attackLogs.length === 0 ? (
                  <span className="text-slate-600">// Aguardando início do ataque...</span>
                ) : (
                  attackLogs.map((log, i) => (
                    <div key={i} className={log.includes('MATCH') ? 'text-emerald-400 font-bold' : ''}>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunDictionaryAttack}
              disabled={isRunningAttack}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs mt-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunningAttack ? 'Processando Dicionário...' : 'Iniciar Quebra por Wordlist'}</span>
            </button>
          </div>
        </div>

        {crackedPassword && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl space-y-1 text-xs">
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>SENHA DECIFRADA COM SUCESSO: "{crackedPassword}"</span>
            </div>
            <p className="text-slate-300 font-mono text-[11px]">
              Flag gerada: <strong className="text-white">CYBER&#123;{crackedPassword}&#125;</strong>
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
