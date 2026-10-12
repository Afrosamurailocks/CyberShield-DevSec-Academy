import React, { useState } from 'react';
import { GitBranch, GitCommit, FileCode, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { Challenge } from '../../../types';

interface GitLabProps {
  challenge: Challenge;
  onFlagDiscovered: (flag: string) => void;
}

export const GitLab: React.FC<GitLabProps> = ({ challenge, onFlagDiscovered }) => {
  const [selectedCommitHash, setSelectedCommitHash] = useState('4b21e89');
  const [cliInput, setCliInput] = useState('git show 4b21e89');

  const commits = [
    {
      hash: '9fa81bc',
      title: 'chore: remover config.json com credencial por seguranca',
      author: 'Dev Junior <junior@empresa.com>',
      date: 'Ontem às 18:32',
      isHead: true,
      diff: `commit 9fa81bc294a081bc (HEAD -> main)
Author: Dev Junior <junior@empresa.com>
Date:   Ontem às 18:32

    chore: remover config.json com credencial por seguranca
    
diff --git a/config.json b/config.json
deleted file mode 100644
--- a/config.json
+++ /dev/null
@@ -1,4 +0,0 @@
-{
-  "GATEWAY_URL": "https://pay.internal-secure.com",
-  "NOTE": "Arquivo removido do commit recente, mas ainda existe no histórico git!"
-}`
    },
    {
      hash: '4b21e89',
      title: 'feat: adicionar conexao com gateway de producao',
      author: 'Dev Junior <junior@empresa.com>',
      date: 'Há 2 dias às 14:15',
      hasSecret: true,
      diff: `commit 4b21e89bca74e21a
Author: Dev Junior <junior@empresa.com>
Date:   Há 2 dias às 14:15

    feat: adicionar conexao com gateway de producao

diff --git a/src/gateway/client.ts b/src/gateway/client.ts
index 8a3429..f48201 100644
--- a/src/gateway/client.ts
+++ b/src/gateway/client.ts
@@ -12,3 +12,12 @@
+ // CHAVE DE API DE PRODUCAO DO GATEWAY FINANCEIRO:
+ const API_KEY = "CYBER{git_history_leaks_secrets_forever}";
+ const GATEWAY_URL = "https://pay.internal-secure.com";
+ 
+ export async function processPayment(amount: number) {
+   return axios.post(GATEWAY_URL, { key: API_KEY, amount });
+ }`
    },
    {
      hash: '1c028aa',
      title: 'init: setup inicial do projeto de pagamentos',
      author: 'Tech Lead <lead@empresa.com>',
      date: 'Há 1 semana',
      diff: `commit 1c028aa9481bca02
Author: Tech Lead <lead@empresa.com>
Date:   Há 1 semana

    init: setup inicial do projeto de pagamentos

diff --git a/README.md b/README.md
new file mode 100644
+ # Payment Service API
+ Repositorio interno da equipe de Engenharia.`
    }
  ];

  const currentCommit = commits.find(c => c.hash === selectedCommitHash) || commits[0];

  const handleSelectCommit = (hash: string) => {
    setSelectedCommitHash(hash);
    setCliInput(`git show ${hash}`);
    if (hash === '4b21e89') {
      onFlagDiscovered(challenge.flag);
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Target Info */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-sans">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <GitBranch className="w-4 h-4" />
          <span>Git History & Auditoria de Segredos em Repositório Interno</span>
        </div>
        <p className="text-slate-400 text-xs">
          Um segredo foi commitado e posteriormente "apagado" em um commit recente. Investigue o histórico com <code className="text-emerald-400 font-mono">git log</code> e inspecione os diffs com <code className="text-emerald-400 font-mono">git show</code>.
        </p>
      </div>

      {/* Commit Tree List */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-300 font-sans uppercase tracking-wider">
          Histórico de Commits (git log --oneline):
        </div>

        <div className="space-y-1.5">
          {commits.map((c) => {
            const isSelected = selectedCommitHash === c.hash;
            return (
              <div
                key={c.hash}
                onClick={() => handleSelectCommit(c.hash)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/80 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-900 text-slate-400'}`}>
                    <GitCommit className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs flex items-center gap-2">
                      <span className="text-cyan-400 font-mono">{c.hash}</span>
                      <span>{c.title}</span>
                      {c.isHead && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                          HEAD
                        </span>
                      )}
                      {c.hasSecret && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">
                          SEGREDO VAZADO AQUI
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-sans">
                      {c.author} &bull; {c.date}
                    </div>
                  </div>
                </div>

                <button className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-sans">
                  Inspecionar Diff
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Commit Diff View */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
          <span className="font-bold text-slate-300 font-sans">
            Saída do Comando: <code className="text-emerald-400 font-mono">{cliInput}</code>
          </span>
          {currentCommit.hasSecret && (
            <span className="text-emerald-400 font-sans font-bold flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              CHAVE DE API ENCONTRADA NO DIFF!
            </span>
          )}
        </div>

        <pre className="p-3 bg-slate-900 rounded-lg text-slate-200 text-xs overflow-x-auto whitespace-pre leading-relaxed border border-slate-800 max-h-56 scrollbar-thin">
          {currentCommit.diff.split('\n').map((line, idx) => {
            const isAdd = line.startsWith('+');
            const isDel = line.startsWith('-');
            const isFlagLine = line.includes('CYBER{');
            return (
              <div
                key={idx}
                className={
                  isFlagLine
                    ? 'bg-emerald-950/70 text-emerald-300 font-bold px-1 rounded'
                    : isAdd
                    ? 'text-emerald-400 bg-emerald-950/20'
                    : isDel
                    ? 'text-rose-400 bg-rose-950/20'
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
