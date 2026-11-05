import React, { useState } from 'react';
import { Mail, ShieldAlert, CheckCircle2, Search, ArrowRight, CornerDownRight } from 'lucide-react';
import { Challenge } from '../../../types';

interface EmailForensicsLabProps {
  challenge: Challenge;
  onFlagDiscovered: (flag: string) => void;
}

export const EmailForensicsLab: React.FC<EmailForensicsLabProps> = ({ challenge, onFlagDiscovered }) => {
  const [searchTerm, setSearchTerm] = useState('flag');
  const [testedValidation, setTestedValidation] = useState(false);

  const rawEml = `Received: from mail.attacker-spoof-relay.net (198.51.100.77)
    by mx.empresa-protegida.com with ESMTP id ABC1234
    for <colaborador@empresa-protegida.com>; Mon, 12 Oct 2026 09:14:22 -0300
From: "Equipe de TI Corporativa" <suporte@empresa-protegida.com>
Reply-To: <urgente-coleta@attacker-spoof-relay.net>
Subject: [URGENTE] Bloqueio Imediato da sua Conta Corporativa em 15 minutos!
Authentication-Results: mx.empresa-protegida.com;
    spf=fail (sender IP 198.51.100.77 is not permitted by domain empresa-protegida.com)
    dkim=none (no signature found)
    dmarc=fail action=quarantine
X-Phish-Flag: CYBER{spf_dmarc_fail_spoofed_sender_caught}
Content-Type: text/html; charset="UTF-8"

Prezado Colaborador,
Sua conta sera desativada permanentemente. Clique no link para manter o acesso:
https://login-microsoft365-recadastro-falso.com/login`;

  const handleRunDnsAudit = () => {
    setTestedValidation(true);
    onFlagDiscovered(challenge.flag);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Target Info */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-sans">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Mail className="w-4 h-4" />
          <span>Analisador Forense de Cabeçalhos de E-mail (RFC 822)</span>
        </div>
        <p className="text-slate-400 text-xs">
          Investigue a tentativa de falsificação de remetente (Email Spoofing) e extraia os registros de autenticação do gateway de correio.
        </p>
      </div>

      {/* Interactive SPF/DKIM Checker */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-sans">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Auditoria de Autenticação de Domínio (MX Gateway):
          </span>
          <button
            type="button"
            onClick={handleRunDnsAudit}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Verificar SPF/DMARC contra DNS Oficial
          </button>
        </div>

        {testedValidation && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl space-y-1.5 animate-in fade-in">
            <div className="text-rose-400 font-bold flex items-center gap-1.5 text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>SPOOFING CONFIRMADO! O IP 198.51.100.77 NÃO POSSUI PERMISSÃO NO REGISTRO TXT/SPF DO DOMÍNIO.</span>
            </div>
            <div className="text-slate-300 font-mono text-[11px]">
              Flag extraída do cabeçalho customizado X-Phish-Flag: <strong className="text-emerald-400">{challenge.flag}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Raw EML Viewer */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
          <span className="font-bold text-slate-300 font-mono">email_headers.eml</span>
          <span className="text-slate-500 text-[11px]">RFC 822 Message Dump</span>
        </div>

        <pre className="p-3 bg-slate-900 rounded-lg text-slate-200 text-xs overflow-x-auto whitespace-pre leading-relaxed border border-slate-800 max-h-64 scrollbar-thin">
          {rawEml.split('\n').map((line, idx) => {
            const isSpf = line.includes('spf=fail') || line.includes('dmarc=fail');
            const isFlag = line.includes('X-Phish-Flag');
            return (
              <div
                key={idx}
                className={
                  isFlag
                    ? 'bg-emerald-950/80 text-emerald-300 font-bold px-1 rounded'
                    : isSpf
                    ? 'text-rose-400 bg-rose-950/20 px-1 rounded font-bold'
                    : line.startsWith('From:') || line.startsWith('Reply-To:')
                    ? 'text-cyan-300'
                    : 'text-slate-400'
                }
              >
                {line}
              </div>
            );
          })}
        </pre>
      </div>

    </div>
  );
};
