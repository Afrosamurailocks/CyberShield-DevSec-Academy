import React, { useState } from 'react';
import { Play, Globe, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { Challenge } from '../../../types';

interface IdorLabProps {
  challenge: Challenge;
  onFlagDiscovered: (flag: string) => void;
}

export const IdorLab: React.FC<IdorLabProps> = ({ challenge, onFlagDiscovered }) => {
  const [employeeId, setEmployeeId] = useState('1042');
  const [httpMethod] = useState<'GET'>('GET');
  const [authToken] = useState('eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxMDQyLCJyb2xlIjoiZnVuY2lvbmFyaW8ifQ...');
  const [isSending, setIsSending] = useState(false);
  
  const [responseState, setResponseState] = useState<{
    status: number;
    statusText: string;
    responseTimeMs: number;
    headers: Record<string, string>;
    data: unknown;
    isVulnerableHit: boolean;
  } | null>(null);

  const mockDatabase: Record<string, { name: string; role: string; salary: string; bonus: string; flag?: string }> = {
    '1001': {
      name: 'Dr. Roberto Albuquerque',
      role: 'Diretor Presidente / CEO',
      salary: 'R$ 48.000,00',
      bonus: 'R$ 15.000,00',
      flag: challenge.flag
    },
    '1002': {
      name: 'Juliana Mendes',
      role: 'Diretora Financeira (CFO)',
      salary: 'R$ 38.000,00',
      bonus: 'R$ 10.000,00'
    },
    '1003': {
      name: 'Marcos Prado',
      role: 'Gerente Geral de Recursos Humanos',
      salary: 'R$ 18.500,00',
      bonus: 'R$ 4.000,00'
    },
    '1042': {
      name: 'Carlos Silva (Você)',
      role: 'Analista de Sistemas Pleno',
      salary: 'R$ 6.800,00',
      bonus: 'R$ 1.200,00'
    }
  };

  const handleSendRequest = () => {
    setIsSending(true);
    setResponseState(null);

    setTimeout(() => {
      setIsSending(false);
      const cleanId = employeeId.trim();
      const record = mockDatabase[cleanId];

      if (record) {
        const isTargetCEO = cleanId === '1001';
        setResponseState({
          status: 200,
          statusText: 'OK',
          responseTimeMs: 38,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'server': 'nginx/1.24.0',
            'x-powered-by': 'Express',
            'access-control-allow-origin': '*'
          },
          data: {
            status: 200,
            status_message: "Holerite recuperado com sucesso.",
            data: {
              employee_id: cleanId,
              colaborador: record.name,
              cargo: record.role,
              salario_bruto: record.salary,
              plr_bonus: record.bonus,
              descontos_inss_irrf: "R$ 12.430,00",
              salario_liquido: record.salary,
              banco_pagamento: "341 - Itaú Unibanco S.A.",
              conta_corrente: "Agência 0451 / CC 18920-4",
              ...(record.flag ? { audit_flag: record.flag } : {})
            }
          },
          isVulnerableHit: isTargetCEO
        });

        if (isTargetCEO) {
          onFlagDiscovered(challenge.flag);
        }
      } else {
        setResponseState({
          status: 404,
          statusText: 'Not Found',
          responseTimeMs: 25,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'server': 'nginx/1.24.0'
          },
          data: {
            status: 404,
            error: `Colaborador com ID '${cleanId}' não localizado na base corporativa.`,
            hint: "Dica: Os IDs da diretoria iniciam em 1001."
          },
          isVulnerableHit: false
        });
      }
    }, 350);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Target API Header */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-sans">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Globe className="w-4 h-4" />
          <span>API REST: Portal de Holerites & Folha Salarial da Intranet</span>
        </div>
        <p className="text-slate-400 text-xs">
          Esta API não valida se o token da sessão possui permissão para ler o registro do <code className="text-cyan-400 font-mono">employee_id</code> fornecido.
        </p>
      </div>

      {/* HTTP Request Builder */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        
        {/* Method & URL */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <span className="px-3 py-2 bg-emerald-500/20 text-emerald-400 font-bold rounded-lg border border-emerald-500/30 text-center font-mono">
            {httpMethod}
          </span>

          <div className="flex-1 flex items-center bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 font-mono text-xs text-slate-300">
            <span className="text-slate-500">https://intranet.empresa.internal/api/payrolls/user?employee_id=</span>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="bg-slate-950 text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-500/50 w-24 focus:outline-none"
              placeholder="1001"
            />
          </div>

          <button
            type="button"
            onClick={handleSendRequest}
            disabled={isSending}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isSending ? 'Requisitando...' : 'Enviar GET'}</span>
          </button>
        </div>

        {/* Quick IDs Buttons */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-sans pt-1">
          <span className="text-slate-500">Testar Matrículas:</span>
          <button
            type="button"
            onClick={() => { setEmployeeId('1042'); }}
            className={`px-2 py-1 rounded border transition-colors ${
              employeeId === '1042' ? 'bg-slate-800 text-white border-slate-600' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            ID 1042 (Seu Holerite)
          </button>
          <button
            type="button"
            onClick={() => { setEmployeeId('1001'); }}
            className={`px-2 py-1 rounded border transition-colors ${
              employeeId === '1001' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 font-bold' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            ID 1001 (Diretor Executivo / CEO)
          </button>
          <button
            type="button"
            onClick={() => { setEmployeeId('1002'); }}
            className={`px-2 py-1 rounded border transition-colors ${
              employeeId === '1002' ? 'bg-slate-800 text-white border-slate-600' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            ID 1002 (CFO)
          </button>
          <button
            type="button"
            onClick={() => { setEmployeeId('1003'); }}
            className={`px-2 py-1 rounded border transition-colors ${
              employeeId === '1003' ? 'bg-slate-800 text-white border-slate-600' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            ID 1003 (Gerente RH)
          </button>
        </div>

        {/* Request Headers info */}
        <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-800/80">
          <div><strong>Authorization:</strong> Bearer {authToken.slice(0, 30)}...</div>
          <div><strong>Accept:</strong> application/json</div>
        </div>

      </div>

      {/* Response Display */}
      {responseState && (
        <div className={`p-4 rounded-xl border space-y-3 animate-in fade-in ${
          responseState.isVulnerableHit
            ? 'bg-slate-950 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
            : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                responseState.status === 200 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                HTTP {responseState.status} {responseState.statusText}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                {responseState.responseTimeMs} ms
              </span>
            </div>

            {responseState.isVulnerableHit ? (
              <span className="text-emerald-400 font-sans font-bold flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                DADOS DO CEO ACESSADOS (IDOR COMPROVADO!)
              </span>
            ) : (
              <span className="text-slate-400 font-sans text-[11px]">
                Resposta Recebida
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Corpo da Resposta JSON:</div>
            <pre className="p-3 bg-slate-900 rounded-lg text-emerald-300 overflow-x-auto max-h-56 scrollbar-thin border border-slate-800">
              {JSON.stringify(responseState.data, null, 2)}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};
