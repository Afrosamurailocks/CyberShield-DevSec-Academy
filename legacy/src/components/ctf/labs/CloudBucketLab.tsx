import React, { useState } from 'react';
import { Cloud, Folder, File, CheckCircle2, ShieldAlert, Download, Terminal, Eye } from 'lucide-react';
import { Challenge } from '../../../types';

interface CloudBucketLabProps {
  challenge: Challenge;
  onFlagDiscovered: (flag: string) => void;
}

export const CloudBucketLab: React.FC<CloudBucketLabProps> = ({ challenge, onFlagDiscovered }) => {
  const [selectedFile, setSelectedFile] = useState<string>('internal_confidential/db_master_credentials.txt');

  const files = [
    {
      path: 'index.html',
      size: '1.2 KB',
      acl: 'public-read',
      content: '<!DOCTYPE html><html><body><h1>Internal Portal Maintenance</h1></body></html>'
    },
    {
      path: 'assets/logo.png',
      size: '45.0 KB',
      acl: 'public-read',
      content: '[PNG IMAGE DATA - LOGO CORPORATIVO]'
    },
    {
      path: 'internal_confidential/db_master_credentials.txt',
      size: '240 B',
      acl: 'public-read (FALHA GRAVE)',
      hasFlag: true,
      content: `[CREDENCIAIS DE PRODUCAO VAZADAS VIA BUCKET PUBLICO]
DB_HOST=prod-cluster-01.internal
DB_USER=master_dba
DB_PASS=SuperSecr3t#2026
FLAG_AUDITORIA=CYBER{cloud_bucket_public_acl_misconfig_2026}
AVISO: Corrija as politicas IAM deste bucket imediatamente!`
    }
  ];

  const currentFile = files.find(f => f.path === selectedFile) || files[0];

  const handleSelectFile = (path: string) => {
    setSelectedFile(path);
    if (path.includes('db_master_credentials.txt')) {
      onFlagDiscovered(challenge.flag);
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Target Info */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-sans">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Cloud className="w-4 h-4" />
          <span>Console de Armazenamento Cloud S3 / GCS Público</span>
        </div>
        <p className="text-slate-400 text-xs">
          Bucket: <code className="text-emerald-400 font-mono">s3://empresa-infra-prod-backup-public/</code> com permissões abertas para o mundo (<code className="text-amber-400 font-mono">AllUsers: READ</code>).
        </p>
      </div>

      {/* Bucket Objects Explorer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Left: Files Tree */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-sans">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Objetos no Bucket Público:</span>
            <span className="text-[11px] font-mono text-cyan-400">aws s3 ls</span>
          </div>

          <div className="space-y-1.5">
            {files.map((file) => {
              const isSelected = selectedFile === file.path;
              return (
                <div
                  key={file.path}
                  onClick={() => handleSelectFile(file.path)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/80 text-white shadow-md'
                      : file.hasFlag
                      ? 'bg-rose-950/20 border-rose-500/30 text-rose-300 hover:border-rose-500/60'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <File className={`w-4 h-4 shrink-0 ${file.hasFlag ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="font-mono text-xs truncate">{file.path}</span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">{file.size}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: File Viewer */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-300 font-mono truncate">
              {currentFile.path}
            </span>
            {currentFile.hasFlag && (
              <span className="text-emerald-400 font-sans font-bold flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                FLAG DE AUDITORIA LOCALIZADA!
              </span>
            )}
          </div>

          <pre className="p-3 bg-slate-900 rounded-lg text-slate-200 text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800 max-h-56 scrollbar-thin">
            {currentFile.content}
          </pre>
        </div>

      </div>

    </div>
  );
};
