import React, { useState } from 'react';
import { Search, Filter, ShieldAlert, CheckCircle2, ArrowRight, CornerDownRight, FileCode } from 'lucide-react';
import { Challenge } from '../../../types';

interface NetworkForensicsLabProps {
  challenge: Challenge;
  onFlagDiscovered: (flag: string) => void;
}

export const NetworkForensicsLab: React.FC<NetworkForensicsLabProps> = ({ challenge, onFlagDiscovered }) => {
  const [filterText, setFilterText] = useState('http');
  const [selectedPacketIndex, setSelectedPacketIndex] = useState(3); // Default to POST packet
  const [decoderInput, setDecoderInput] = useState('');
  const [decodedOutput, setDecodedOutput] = useState<string | null>(null);

  const packets = [
    {
      no: 1,
      time: '14:02:11.412',
      source: '192.168.10.45',
      destination: '8.8.8.8',
      protocol: 'DNS',
      length: 74,
      info: 'Standard query 0x1a2b A intranet.empresa.internal',
      details: 'DNS Query for corporate intranet IP resolution.'
    },
    {
      no: 2,
      time: '14:03:00.001',
      source: '192.168.10.45',
      destination: '185.220.101.5',
      protocol: 'HTTP',
      length: 218,
      info: 'GET /checkin?host=fin-pc04&os=win11 HTTP/1.1',
      details: 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\nHost: 185.220.101.5\nAccept: */*\n\nHeartbeat check-in from infected finance endpoint.'
    },
    {
      no: 3,
      time: '14:04:00.003',
      source: '192.168.10.45',
      destination: '185.220.101.5',
      protocol: 'HTTP',
      length: 218,
      info: 'GET /checkin?host=fin-pc04&os=win11 HTTP/1.1',
      details: 'Interval: exatamente 60 segundos após o pacote #2 (Periodic Beaconing).'
    },
    {
      no: 4,
      time: '14:05:00.015',
      source: '192.168.10.45',
      destination: '185.220.101.5',
      protocol: 'HTTP',
      length: 486,
      info: 'POST /data?exfil=Q1lCRVJ7ZG5zX3R1bm5lbGluZ19jMl9leGZpbHRyYXRpb25fZGV0ZWN0ZWR9 HTTP/1.1',
      details: `POST /data?exfil=Q1lCRVJ7ZG5zX3R1bm5lbGluZ19jMl9leGZpbHRyYXRpb25fZGV0ZWN0ZWR9 HTTP/1.1\nHost: 185.220.101.5:80\nUser-Agent: C2-Loader/2.1\nContent-Type: application/x-www-form-urlencoded\nContent-Length: 64\n\n[DADOS DE EXFILTRAÇÃO CODIFICADOS EM BASE64 NO PARÂMETRO EXFIL]`,
      hasExfil: true,
      exfilBase64: 'Q1lCRVJ7ZG5zX3R1bm5lbGluZ19jMl9leGZpbHRyYXRpb25fZGV0ZWN0ZWR9'
    },
    {
      no: 5,
      time: '14:06:00.002',
      source: '192.168.10.45',
      destination: '185.220.101.5',
      protocol: 'HTTP',
      length: 218,
      info: 'GET /checkin?host=fin-pc04&os=win11 HTTP/1.1',
      details: 'Retorno ao beaconing de rotina.'
    }
  ];

  const filteredPackets = packets.filter(p => {
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return (
      p.protocol.toLowerCase().includes(q) ||
      p.info.toLowerCase().includes(q) ||
      p.source.includes(q) ||
      p.destination.includes(q)
    );
  });

  const selectedPacket = packets[selectedPacketIndex];

  const handleDecode = (textToDecode: string) => {
    try {
      const decoded = atob(textToDecode.trim());
      setDecodedOutput(decoded);
      if (decoded.includes('CYBER{')) {
        onFlagDiscovered(decoded);
      }
    } catch {
      setDecodedOutput('Erro: String Base64 inválida ou corrompida.');
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Target Info */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-sans">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <ShieldAlert className="w-4 h-4" />
          <span>Wireshark Web & Analisador de Tráfego de Rede (PCAP)</span>
        </div>
        <p className="text-slate-400 text-xs">
          Investigação de beaconing periódico do malware C2 e exfiltração de dados sensíveis da estação <code className="text-cyan-400 font-mono">192.168.10.45</code>.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
        <Filter className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-slate-500 font-sans text-xs">Filtro de Exibição:</span>
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="http, dns, 185.220.101.5..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono text-xs focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setFilterText('')}
          className="px-2 py-1 text-slate-400 hover:text-white bg-slate-900 rounded border border-slate-800 text-[11px]"
        >
          Limpar
        </button>
      </div>

      {/* Packet List View */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
        <div className="overflow-x-auto max-h-52 scrollbar-thin">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase font-mono sticky top-0">
              <tr>
                <th className="p-2">No.</th>
                <th className="p-2">Time</th>
                <th className="p-2">Source</th>
                <th className="p-2">Destination</th>
                <th className="p-2">Protocol</th>
                <th className="p-2">Length</th>
                <th className="p-2">Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPackets.map((pkt) => {
                const isSelected = packets[selectedPacketIndex]?.no === pkt.no;
                return (
                  <tr
                    key={pkt.no}
                    onClick={() => setSelectedPacketIndex(pkt.no - 1)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/50 text-cyan-200 border-l-2 border-l-cyan-400'
                        : pkt.hasExfil
                        ? 'bg-rose-950/20 text-rose-300 hover:bg-rose-950/30'
                        : 'hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <td className="p-2 font-bold">{pkt.no}</td>
                    <td className="p-2">{pkt.time}</td>
                    <td className="p-2">{pkt.source}</td>
                    <td className="p-2 text-cyan-300">{pkt.destination}</td>
                    <td className="p-2">
                      <span className={`px-1.5 py-0.2 rounded font-bold ${pkt.protocol === 'DNS' ? 'bg-purple-900/60 text-purple-300' : 'bg-emerald-900/60 text-emerald-300'}`}>
                        {pkt.protocol}
                      </span>
                    </td>
                    <td className="p-2">{pkt.length}</td>
                    <td className="p-2 truncate max-w-xs">{pkt.info}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Packet Stream Breakdown */}
      {selectedPacket && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200 font-sans text-xs">
              Detalhes do Pacote #{selectedPacket.no} ({selectedPacket.protocol})
            </span>
            {selectedPacket.hasExfil && (
              <span className="text-rose-400 font-sans font-bold flex items-center gap-1 text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                EXFILTRAÇÃO DE DADOS DETECTADA!
              </span>
            )}
          </div>

          <pre className="p-3 bg-slate-900 rounded-lg text-slate-200 text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800 max-h-36">
            {selectedPacket.details}
          </pre>

          {/* Quick Decoder Action if Packet has Exfil */}
          {selectedPacket.exfilBase64 && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans font-bold text-slate-300">
                  Parâmetro Suspeito Base64 Identificado:
                </span>
                <button
                  type="button"
                  onClick={() => handleDecode(selectedPacket.exfilBase64!)}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Decodificar Base64 Agora
                </button>
              </div>
              <code className="block bg-slate-950 p-2 rounded text-cyan-300 font-mono text-xs break-all border border-slate-800">
                {selectedPacket.exfilBase64}
              </code>
            </div>
          )}
        </div>
      )}

      {/* Decoded Output Box */}
      {decodedOutput && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-1.5 animate-in fade-in">
          <div className="text-xs font-sans font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>PAYLOAD DE EXFILTRAÇÃO DECIFRADO COM SUCESSO:</span>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800 font-mono text-emerald-300 font-bold text-xs">
            {decodedOutput}
          </div>
        </div>
      )}

    </div>
  );
};
