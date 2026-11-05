import React, { useState } from 'react';
import { Play, Shield, CheckCircle2, AlertTriangle, KeyRound, Sparkles } from 'lucide-react';
import { base64UrlEncode, base64UrlDecode } from '../../../utils/cryptoUtils';
import { Challenge } from '../../../types';

interface JwtLabProps {
  challenge: Challenge;
  onFlagDiscovered: (flag: string) => void;
}

export const JwtLab: React.FC<JwtLabProps> = ({ challenge, onFlagDiscovered }) => {
  const [alg, setAlg] = useState<'none' | 'HS256'>('none');
  const [role, setRole] = useState<'guest' | 'admin' | 'dev'>('guest');
  const [sub, setSub] = useState('funcionario');
  const [secretKey, setSecretKey] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Compute live JWT parts
  const headerObj = { alg, typ: 'JWT' };
  const payloadObj = { sub, role, company: 'cybershield', iat: 1760000000 };

  const encodedHeader = base64UrlEncode(JSON.stringify(headerObj));
  const encodedPayload = base64UrlEncode(JSON.stringify(payloadObj));
  const signature = alg === 'none' ? '' : (secretKey ? 'mock_sig_' + encodedPayload.slice(0, 10) : 'unsigned');

  const fullJwtToken = `${encodedHeader}.${encodedPayload}.${signature}`;

  const [apiResponse, setApiResponse] = useState<{
    status: number;
    statusText: string;
    body: unknown;
    isSuccess: boolean;
  } | null>(null);

  const handleTestToken = () => {
    setIsSending(true);
    setApiResponse(null);

    setTimeout(() => {
      setIsSending(false);

      if (alg !== 'none') {
        setApiResponse({
          status: 401,
          statusText: 'Unauthorized',
          body: {
            status: 401,
            error: "Assinatura inválida para o algoritmo HS256. A chave secreta do servidor corporativo é desconhecida.",
            hint: "Dica: Você sabia que a biblioteca backend aceita tokens não assinados com 'alg': 'none'?"
          },
          isSuccess: false
        });
        return;
      }

      if (role !== 'admin') {
        setApiResponse({
          status: 403,
          statusText: 'Forbidden',
          body: {
            status: 403,
            error: `Acesso Negado: A role '${role}' não possui privilégios de Administrador de Cloud.`,
            authenticated_user: sub
          },
          isSuccess: false
        });
        return;
      }

      // Success: alg === 'none' and role === 'admin'
      setApiResponse({
        status: 200,
        statusText: 'OK',
        body: {
          status: 200,
          message: "Autenticação bem-sucedida! Elevação de privilégios via token JWT confirmada.",
          user_context: {
            username: sub,
            role: "admin",
            scope: ["cloud:read", "cloud:write", "cloud:admin", "vault:read"],
            cloud_management_token: "CYBER{jwt_privilege_escalation_jwt_2026}"
          }
        },
        isSuccess: true
      });
      onFlagDiscovered(challenge.flag);
    }, 350);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Target API Header */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-sans">
        <div className="flex items-center gap-2 text-blue-400 font-bold">
          <Shield className="w-4 h-4" />
          <span>Alvo: Endpoint de Métricas Cloud & Orquestração (/api/v1/cloud/metrics)</span>
        </div>
        <p className="text-slate-400 text-xs">
          O gateway autentica via cabeçalho <code className="text-cyan-400 font-mono">Authorization: Bearer &lt;JWT&gt;</code>. A biblioteca aceita tokens com algoritmo nulo (<code className="text-amber-400 font-mono">alg: none</code>).
        </p>
      </div>

      {/* Interactive JWT Editor (Header, Payload, Signature) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Left: Interactive Controls */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-sans">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            1. Editor de Claims do Token:
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Algoritmo de Assinatura (Header.alg):</label>
            <select
              value={alg}
              onChange={(e) => setAlg(e.target.value as 'none' | 'HS256')}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:outline-none"
            >
              <option value="none">none (Sem verificação de assinatura - Exploit!)</option>
              <option value="HS256">HS256 (HMAC com SHA-256 - Requer segredo)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Claim de Privilégio (Payload.role):</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRole('guest')}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                  role === 'guest' ? 'bg-slate-800 text-white border-slate-600' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                guest (Padrão)
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors ${
                  role === 'admin' ? 'bg-amber-950/60 text-amber-300 border-amber-500/60' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                admin (Elevação)
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Identificação do Usuário (Payload.sub):</label>
            <input
              type="text"
              value={sub}
              onChange={(e) => setSub(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Right: Decoded JSON Visualizer */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-sans">
            2. Estrutura Decodificada (RFC 7519):
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <span className="text-[11px] text-rose-400 font-bold">HEADER:</span>
              <pre className="p-2 bg-slate-900 rounded border border-rose-950 text-rose-300 text-[11px]">
                {JSON.stringify(headerObj, null, 2)}
              </pre>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-purple-400 font-bold">PAYLOAD:</span>
              <pre className="p-2 bg-slate-900 rounded border border-purple-950 text-purple-300 text-[11px]">
                {JSON.stringify(payloadObj, null, 2)}
              </pre>
            </div>
          </div>
        </div>

      </div>

      {/* Raw JWT Token String Bar */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
        <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider font-sans">
          Token JWT Codificado Gerado:
        </div>
        <div className="p-2 bg-slate-900 rounded border border-slate-800 break-all text-[11px] font-mono leading-relaxed">
          <span className="text-rose-400">{encodedHeader}</span>.
          <span className="text-purple-400">{encodedPayload}</span>.
          <span className="text-cyan-400">{signature}</span>
        </div>
      </div>

      {/* Test Token Button */}
      <button
        type="button"
        onClick={handleTestToken}
        disabled={isSending}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer font-sans text-xs"
      >
        <Play className="w-4 h-4 fill-current" />
        <span>{isSending ? 'Transmitindo Requisição com Token...' : 'Submeter Token para a API Cloud (/api/v1/cloud/metrics)'}</span>
      </button>

      {/* Response Box */}
      {apiResponse && (
        <div className={`p-4 rounded-xl border space-y-3 animate-in fade-in ${
          apiResponse.isSuccess ? 'bg-slate-950 border-emerald-500/60' : 'bg-slate-950 border-rose-500/40'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className={`px-2 py-0.5 rounded font-mono font-bold ${
              apiResponse.status === 200 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              HTTP {apiResponse.status} {apiResponse.statusText}
            </span>
            <span className="text-xs font-sans text-slate-400">
              {apiResponse.isSuccess ? 'Elevação de Privilégio Efetuada!' : 'Acesso Negado'}
            </span>
          </div>

          <pre className="p-3 bg-slate-900 rounded-lg text-emerald-300 overflow-x-auto max-h-48 scrollbar-thin border border-slate-800">
            {JSON.stringify(apiResponse.body, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
};
