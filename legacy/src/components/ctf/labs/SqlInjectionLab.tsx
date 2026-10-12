import React, { useState } from 'react';
import { Play, CheckCircle2, AlertTriangle, Database, ArrowRight } from 'lucide-react';
import { Challenge } from '../../../types';

interface SqlInjectionLabProps {
  challenge: Challenge;
  onFlagDiscovered: (flag: string) => void;
}

export const SqlInjectionLab: React.FC<SqlInjectionLabProps> = ({
  challenge,
  onFlagDiscovered
}) => {
  const [usernameInput, setUsernameInput] = useState<string>("admin' OR '1'='1' --");
  const [passwordInput, setPasswordInput] = useState<string>('qualquer_senha');
  const [queryState, setQueryState] = useState<{
    executedQuery: string;
    status: number | null;
    response: unknown;
    explanation: string;
    isSuccess: boolean;
  } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Constructs the SQL query live
  const constructedQuery = `SELECT * FROM employees WHERE user = '${usernameInput}' AND pass = '${passwordInput}' LIMIT 1;`;

  const handleExecute = () => {
    setIsExecuting(true);
    setQueryState(null);

    setTimeout(() => {
      setIsExecuting(false);

      const trimmedUser = usernameInput.trim();
      const hasComment = trimmedUser.includes('--') || trimmedUser.includes('#') || trimmedUser.includes('/*');
      
      // Check SQL injection boolean tautology patterns
      const isBypass = 
        trimmedUser.includes("' OR '1'='1") ||
        trimmedUser.includes("' or '1'='1") ||
        trimmedUser.includes("' OR 1=1") ||
        trimmedUser.includes("' or 1=1") ||
        trimmedUser.includes("' OR ''='") ||
        trimmedUser.includes("' OR 'a'='a") ||
        (trimmedUser.startsWith("admin'") && hasComment);

      if (isBypass) {
        const flag = challenge.flag;
        setQueryState({
          executedQuery: constructedQuery,
          status: 200,
          response: {
            status: 200,
            message: "Autenticação bem-sucedida! Bypass de controle de acesso confirmado.",
            session: {
              token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4ifQ...",
              user_id: 1,
              username: "admin",
              full_name: "Administrador de Sistemas",
              email: "admin@empresa-corp.internal",
              role: "SUPER_ADMIN",
              internal_vault_flag: flag
            }
          },
          explanation: "O payload injetado fechou a aspa simples da string e adicionou uma condição OR booleana sempre verdadeira ('1'='1'), enquanto o comentário (-- / /*) anulou a checagem da senha. O banco retornou o primeiro registro (usuário admin)!",
          isSuccess: true
        });
        onFlagDiscovered(flag);
      } else {
        setQueryState({
          executedQuery: constructedQuery,
          status: 401,
          response: {
            status: 401,
            error: "Credenciais inválidas: Nenhum registro encontrado correspondente ao usuário e senha informados.",
            rows_returned: 0
          },
          explanation: "A consulta SQL foi executada, mas a condição WHERE retornou 0 linhas no banco de dados. Tente fechar as aspas do SQL e injetar uma cláusula OR verdadeira acompanhada de um comentário (--).",
          isSuccess: false
        });
      }
    }, 400);
  };

  const applyPayload = (user: string, pass: string) => {
    setUsernameInput(user);
    setPasswordInput(pass);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Target Description */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-sans">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Database className="w-4 h-4" />
          <span>Alvo: Formulário de Autenticação do Portal de Vendas (ERP)</span>
        </div>
        <p className="text-slate-400 text-xs">
          O código backend concatena as entradas sem validação: <code className="text-amber-300 font-mono">SELECT * FROM employees WHERE user = '&#123;user&#125;' AND pass = '&#123;pass&#125;'</code>.
        </p>
      </div>

      {/* SQL Query Live Visualizer */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
        <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider flex items-center justify-between">
          <span>Consulta SQL Gerada em Tempo Real:</span>
          <span className="text-emerald-400 font-mono">PostgreSQL / MySQL</span>
        </div>
        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
          <span className="text-purple-400 font-bold">SELECT</span> * <span className="text-purple-400 font-bold">FROM</span> employees <span className="text-purple-400 font-bold">WHERE</span> user = '
          <span className="text-cyan-300 font-bold bg-cyan-950/50 px-1 rounded">{usernameInput || ' '}</span>
          ' <span className="text-purple-400 font-bold">AND</span> pass = '
          <span className="text-amber-300 font-bold bg-amber-950/50 px-1 rounded">{passwordInput || ' '}</span>
          ' <span className="text-purple-400 font-bold">LIMIT</span> 1;
        </div>
      </div>

      {/* Inputs Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-slate-300 font-sans text-xs font-semibold">
            Campo de Entrada: <code className="text-cyan-400">username</code>
          </label>
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="admin' OR '1'='1' --"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-slate-300 font-sans text-xs font-semibold">
            Campo de Entrada: <code className="text-amber-400">password</code>
          </label>
          <input
            type="text"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="senha_qualquer"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Quick Payloads helper */}
      <div className="flex items-center gap-2 flex-wrap pt-1 font-sans text-xs">
        <span className="text-slate-500">Payloads para testar:</span>
        <button
          type="button"
          onClick={() => applyPayload("admin' OR '1'='1' --", "qualquer")}
          className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-400 hover:bg-slate-800 transition-colors"
        >
          admin' OR '1'='1' --
        </button>
        <button
          type="button"
          onClick={() => applyPayload("' OR 1=1 --", "x")}
          className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-400 hover:bg-slate-800 transition-colors"
        >
          ' OR 1=1 --
        </button>
        <button
          type="button"
          onClick={() => applyPayload("admin' #", "")}
          className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-400 hover:bg-slate-800 transition-colors"
        >
          admin' #
        </button>
        <button
          type="button"
          onClick={() => applyPayload("colaborador_comum", "123456")}
          className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors"
        >
          Normal (Sem SQLi)
        </button>
      </div>

      {/* Execute Button */}
      <button
        type="button"
        onClick={handleExecute}
        disabled={isExecuting}
        className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-900/20 font-sans text-xs"
      >
        <Play className="w-4 h-4 fill-current" />
        <span>{isExecuting ? 'Executando Consulta no Banco...' : 'Testar Requisição de Login & Executar SQL'}</span>
      </button>

      {/* Execution Results */}
      {queryState && (
        <div className={`p-4 rounded-xl border space-y-3 animate-in fade-in ${
          queryState.isSuccess 
            ? 'bg-slate-950 border-emerald-500/50' 
            : 'bg-slate-950 border-rose-500/40'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded font-mono font-bold ${
              queryState.status === 200 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              STATUS: {queryState.status} {queryState.status === 200 ? 'OK' : 'UNAUTHORIZED'}
            </span>
            <span className="text-slate-400 font-sans text-[11px]">
              {queryState.isSuccess ? 'Bypass Bem-Sucedido!' : 'Falha na Autenticação'}
            </span>
          </div>

          <div className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            {queryState.explanation}
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Resposta JSON da API:</div>
            <pre className="p-3 bg-slate-900 rounded-lg text-emerald-300 overflow-x-auto max-h-48 scrollbar-thin border border-slate-800">
              {JSON.stringify(queryState.response, null, 2)}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};
