import { calculateMD5 } from './cryptoUtils';
import { Challenge } from '../types';

export interface CommandOutput {
  text: string;
  type?: 'input' | 'output' | 'error' | 'success';
}

export function executeVirtualShellCommand(
  rawCommand: string,
  challenge: Challenge,
  fileSystem: Record<string, string>,
  onFlagDiscovered?: (flag: string) => void
): CommandOutput[] {
  const trimmed = rawCommand.trim();
  if (!trimmed) return [];

  // Check pipes (e.g. echo "xyz" | base64 -d)
  if (trimmed.includes('|')) {
    const segments = trimmed.split('|').map(s => s.trim());
    let currentInput = '';
    
    if (segments[0].startsWith('echo ')) {
      currentInput = segments[0].replace('echo ', '').replace(/^["']|["']$/g, '');
    } else if (segments[0].startsWith('cat ')) {
      const fileName = segments[0].replace('cat ', '').trim();
      currentInput = fileSystem[fileName] || '';
    }

    if (segments[1] && segments[1].includes('base64 -d')) {
      try {
        const decoded = atob(currentInput.trim());
        if (decoded.includes('CYBER{') && onFlagDiscovered) {
          onFlagDiscovered(challenge.flag);
        }
        return [
          { text: decoded, type: decoded.includes('CYBER{') ? 'success' : 'output' }
        ];
      } catch {
        return [{ text: 'base64: entrada inválida', type: 'error' }];
      }
    }

    if (segments[1] && segments[1].startsWith('grep ')) {
      const term = segments[1].replace('grep ', '').trim();
      const lines = currentInput.split('\n').filter(l => l.toLowerCase().includes(term.toLowerCase()));
      return lines.map(l => ({ text: l, type: l.includes('CYBER{') ? 'success' : 'output' }));
    }
  }

  const parts = trimmed.split(/\s+/);
  const mainCmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  const fullArg = args.join(' ');

  switch (mainCmd) {
    case 'help':
    case '?':
      return [
        {
          text: `Comandos suportados no Shell Seguro CyberShield:
  ls, dir                   - Listar arquivos no diretório atual
  cat <arquivo>             - Exibir conteúdo completo de um arquivo
  head <arquivo>            - Exibir primeiras linhas do arquivo
  tail <arquivo>            - Exibir últimas linhas do arquivo
  grep <termo> <arquivo>    - Buscar ocorrências de uma palavra em um arquivo
  md5 <texto>               - Calcular hash MD5 real de qualquer sequência de caracteres
  base64 [-d] <texto>       - Codificar ou decodificar Base64
  curl <url> [-H "header"]  - Simular requisição HTTP contra APIs
  git <log|show|diff>       - Comandos do repositório de controle de versão
  aws <s3 ls|s3 cp>         - Comandos de auditoria em nuvem AWS/GCP
  whoami, id, uname         - Identificação do usuário e sistema
  clear                     - Limpar histórico da tela do terminal`,
          type: 'output'
        }
      ];

    case 'pwd':
      return [{ text: '/home/analyst/ctf-workspace', type: 'output' }];

    case 'whoami':
      return [{ text: 'analyst_blue_team', type: 'output' }];

    case 'id':
      return [{ text: 'uid=1000(analyst) gid=1000(analyst) groups=1000(analyst),27(sudo),104(docker)', type: 'output' }];

    case 'uname':
      return [{ text: 'Linux cybershield-soc-workstation 6.8.0-31-generic #31-Ubuntu SMP x86_64 GNU/Linux', type: 'output' }];

    case 'ls':
    case 'dir': {
      const files = Object.keys(fileSystem);
      if (files.length === 0) {
        return [{ text: 'total 0\n(nenhum arquivo no diretório atual)', type: 'output' }];
      }
      return [{ text: files.join('    '), type: 'output' }];
    }

    case 'cat': {
      if (!fullArg) {
        return [{ text: 'Uso: cat <nome_do_arquivo>', type: 'error' }];
      }
      const cleanPath = fullArg.replace('./', '').trim();
      const content = fileSystem[cleanPath];
      if (content !== undefined) {
        if (content.includes('CYBER{') && onFlagDiscovered) {
          onFlagDiscovered(challenge.flag);
        }
        return [{ text: content, type: content.includes('CYBER{') ? 'success' : 'output' }];
      }
      return [{ text: `cat: ${fullArg}: Arquivo ou diretório inexistente. Use "ls" para verificar.`, type: 'error' }];
    }

    case 'head': {
      if (!fullArg) return [{ text: 'Uso: head <arquivo>', type: 'error' }];
      const cleanPath = fullArg.replace('./', '').trim();
      const content = fileSystem[cleanPath];
      if (!content) return [{ text: `head: ${fullArg}: Arquivo não encontrado`, type: 'error' }];
      return [{ text: content.split('\n').slice(0, 5).join('\n'), type: 'output' }];
    }

    case 'tail': {
      if (!fullArg) return [{ text: 'Uso: tail <arquivo>', type: 'error' }];
      const cleanPath = fullArg.replace('./', '').trim();
      const content = fileSystem[cleanPath];
      if (!content) return [{ text: `tail: ${fullArg}: Arquivo não encontrado`, type: 'error' }];
      return [{ text: content.split('\n').slice(-5).join('\n'), type: 'output' }];
    }

    case 'grep': {
      if (args.length < 2) {
        return [{ text: 'Uso: grep <termo_busca> <arquivo>', type: 'error' }];
      }
      const term = args[0].toLowerCase();
      const filename = args[1].replace('./', '');
      const content = fileSystem[filename];
      if (!content) {
        return [{ text: `grep: ${filename}: Arquivo não encontrado`, type: 'error' }];
      }
      const matches = content
        .split('\n')
        .filter(line => line.toLowerCase().includes(term));
      if (matches.length === 0) {
        return [{ text: `Nenhuma ocorrência de "${term}" encontrada em ${filename}.`, type: 'output' }];
      }
      return matches.map(m => {
        if (m.includes('CYBER{') && onFlagDiscovered) {
          onFlagDiscovered(challenge.flag);
          return { text: m, type: 'success' };
        }
        return { text: m, type: 'output' };
      });
    }

    case 'md5': {
      if (!fullArg) {
        return [{ text: 'Uso: md5 <texto_ou_senha>', type: 'error' }];
      }
      const hash = calculateMD5(fullArg);
      const isTargetMatch = hash === 'e10adc3949ba59abbe56e057f20f883e';
      if (isTargetMatch) {
        if (onFlagDiscovered) onFlagDiscovered(`CYBER{${fullArg}}`);
        return [
          { text: `[+] MD5("${fullArg}") = ${hash}`, type: 'success' },
          { text: `[!] MATCH CONFIRMADO COM O HASH ALVO DO DUMP CORPORATIVO!`, type: 'success' },
          { text: `[+] Flag Construída: CYBER{${fullArg}}`, type: 'success' }
        ];
      }
      return [
        { text: `MD5("${fullArg}") = ${hash}`, type: 'output' }
      ];
    }

    case 'base64': {
      if (args[0] === '-d' || args[0] === '--decode') {
        const textToDecode = args.slice(1).join(' ').trim();
        if (!textToDecode) {
          return [{ text: 'Uso: base64 -d <string_base64>', type: 'error' }];
        }
        try {
          const decoded = atob(textToDecode);
          if (decoded.includes('CYBER{') && onFlagDiscovered) {
            onFlagDiscovered(challenge.flag);
            return [
              { text: `Decodificado: ${decoded}`, type: 'success' },
              { text: `[+] Flag extraída com sucesso!`, type: 'success' }
            ];
          }
          return [{ text: `Decodificado: ${decoded}`, type: 'output' }];
        } catch {
          return [{ text: 'base64: erro ao decodificar: dados de entrada inválidos.', type: 'error' }];
        }
      } else {
        try {
          const encoded = btoa(fullArg);
          return [{ text: `Codificado em Base64: ${encoded}`, type: 'output' }];
        } catch {
          return [{ text: 'base64: erro na codificação', type: 'error' }];
        }
      }
    }

    case 'git': {
      const sub = args[0]?.toLowerCase();
      if (sub === 'log') {
        const gitHistory = fileSystem['.git_history.log'];
        if (gitHistory) {
          return [{ text: gitHistory, type: 'output' }];
        }
        return [{ text: 'fatal: não é um repositório git (ou qualquer dos diretórios pai)', type: 'error' }];
      }
      if (sub === 'show') {
        const commitHash = args[1] || 'HEAD';
        if (commitHash.includes('4b21e89') || commitHash === 'HEAD~1') {
          if (onFlagDiscovered) onFlagDiscovered(challenge.flag);
          return [
            {
              text: `commit 4b21e89bca74e21a
Author: Dev Junior <junior@empresa.com>
Date:   Há 2 dias às 14:15

    feat: adicionar conexao com gateway de producao

diff --git a/src/gateway/client.ts b/src/gateway/client.ts
index 8a3429..f48201 100644
--- a/src/gateway/client.ts
+++ b/src/gateway/client.ts
@@ -12,3 +12,12 @@
+ // CHAVE DE API DE PRODUCAO DO GATEWAY FINANCEIRO:
+ const API_KEY = "${challenge.flag}";
+ const GATEWAY_URL = "https://pay.internal-secure.com";`,
              type: 'success'
            }
          ];
        }
        return [{ text: `commit 9fa81bc (HEAD -> main)\nchore: remover config.json com credencial por seguranca`, type: 'output' }];
      }
      if (sub === 'status') {
        return [{ text: 'On branch main\nYour branch is up to date with \'origin/main\'.\nnothing to commit, working tree clean', type: 'output' }];
      }
      return [{ text: 'Uso: git log, git show <commit_hash>, git status', type: 'output' }];
    }

    case 'aws': {
      if (fullArg.includes('s3 ls')) {
        const manifest = fileSystem['bucket_manifest.json'];
        if (manifest) {
          return [{ text: manifest, type: 'output' }];
        }
        return [{ text: '2026-10-11 08:30:14  index.html\n2026-10-11 08:31:02  internal_confidential/db_master_credentials.txt', type: 'output' }];
      }
      return [{ text: 'Uso: aws s3 ls s3://empresa-infra-prod-backup-public', type: 'output' }];
    }

    case 'curl': {
      if (fullArg.includes('admin') || fullArg.includes('token') || fullArg.includes('CYBER')) {
        if (onFlagDiscovered) onFlagDiscovered(challenge.flag);
        return [
          {
            text: `HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "authenticated": true,\n  "role": "admin",\n  "flag": "${challenge.flag}"\n}`,
            type: 'success'
          }
        ];
      }
      return [
        {
          text: `HTTP/1.1 401 Unauthorized\nContent-Type: application/json\n\n{"error": "Acesso não autorizado. Envie credenciais válidas ou explore os parâmetros."}`,
          type: 'error'
        }
      ];
    }

    default:
      return [
        { text: `bash: comando não encontrado: ${mainCmd}. Digite "help" para ver os comandos disponíveis.`, type: 'error' }
      ];
  }
}
