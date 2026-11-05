import React, { useState } from 'react';
import { 
  Trophy, 
  Medal, 
  Award, 
  Flame, 
  Building2, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Star
} from 'lucide-react';
import { UserProfile, DepartmentScore, Badge } from '../../types';
import { TEAM_LEADERBOARD } from '../../data/mockTeamData';
import { DEPARTMENT_METRICS } from '../../data/vulnerabilityData';
import { BADGES } from '../../data/badges';

interface LeaderboardViewProps {
  currentUser: UserProfile;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ currentUser }) => {
  const [tab, setTab] = useState<'individual' | 'departments' | 'badges'>('individual');
  const [departmentFilter, setDepartmentFilter] = useState<string>('Todos');

  // Combine currentUser into leaderboard list and sort by score
  const fullLeaderboard = [
    ...TEAM_LEADERBOARD.filter(u => u.id !== currentUser.id),
    currentUser
  ].sort((a, b) => b.totalScore - a.totalScore);

  const filteredLeaderboard = departmentFilter === 'Todos'
    ? fullLeaderboard
    : fullLeaderboard.filter(u => u.department === departmentFilter);

  // Top 3 Podium
  const top1 = fullLeaderboard[0];
  const top2 = fullLeaderboard[1];
  const top3 = fullLeaderboard[2];

  const getRarityBadge = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'Lendário': return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'Épico': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'Raro': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono">
            <Trophy className="w-3.5 h-3.5" />
            <span>Gamificação & Competição Saudável</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Hall dos Defensores Corporativos
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Estimule a cultura de segurança na empresa! Conquiste pontos resolvendo desafios CTF, bloqueando simulações de phishing e destravando emblemas de especialista.
          </p>
        </div>

        {/* Current user rank summary */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 min-w-[240px] shadow-xl">
          <div className="text-xs text-slate-400 mb-1">Sua Posição no Ranking Geral</div>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-mono font-extrabold text-emerald-400">
              #{fullLeaderboard.findIndex(u => u.id === currentUser.id) + 1}
            </div>
            <div>
              <div className="text-xs font-bold text-white">{currentUser.name}</div>
              <div className="text-[11px] text-slate-400 font-mono">{currentUser.totalScore} Pontos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setTab('individual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === 'individual'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Ranking Individual</span>
        </button>

        <button
          onClick={() => setTab('departments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === 'departments'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Batalha de Departamentos</span>
        </button>

        <button
          onClick={() => setTab('badges')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === 'badges'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Galeria de Emblemas ({BADGES.length})</span>
        </button>
      </div>

      {/* TAB 1: INDIVIDUAL LEADERBOARD */}
      {tab === 'individual' && (
        <div className="space-y-6">
          
          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            
            {/* 2nd place */}
            {top2 && (
              <div className="order-2 md:order-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center justify-between shadow-xl relative mt-4 md:mt-8">
                <div className="absolute -top-4 w-8 h-8 rounded-full bg-slate-400 text-slate-950 font-bold flex items-center justify-center font-mono text-sm border-2 border-slate-900">
                  2
                </div>
                <div className="space-y-2 mt-2">
                  <img src={top2.avatar} alt={top2.name} className="w-16 h-16 rounded-full mx-auto border-2 border-slate-400 object-cover" />
                  <div className="font-bold text-white text-sm">{top2.name}</div>
                  <div className="text-[11px] text-slate-400">{top2.department}</div>
                </div>
                <div className="pt-3 border-t border-slate-800 w-full mt-3 font-mono text-emerald-400 font-bold text-sm">
                  {top2.totalScore} PTS
                </div>
              </div>
            )}

            {/* 1st place */}
            {top1 && (
              <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/60 rounded-2xl p-6 text-center flex flex-col items-center justify-between shadow-2xl relative scale-105 z-10">
                <div className="absolute -top-5 w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center font-mono text-base border-2 border-slate-900 shadow-lg shadow-amber-500/50">
                  👑
                </div>
                <div className="space-y-2 mt-3">
                  <img src={top1.avatar} alt={top1.name} className="w-20 h-20 rounded-full mx-auto border-3 border-amber-400 object-cover shadow-lg shadow-amber-400/20" />
                  <div className="font-extrabold text-white text-base">{top1.name}</div>
                  <div className="text-xs text-amber-300 font-semibold">{top1.department}</div>
                </div>
                <div className="pt-3 border-t border-slate-800 w-full mt-3 font-mono text-amber-400 font-extrabold text-lg">
                  {top1.totalScore} PTS
                </div>
              </div>
            )}

            {/* 3rd place */}
            {top3 && (
              <div className="order-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center justify-between shadow-xl relative mt-4 md:mt-12">
                <div className="absolute -top-4 w-8 h-8 rounded-full bg-amber-700 text-white font-bold flex items-center justify-center font-mono text-sm border-2 border-slate-900">
                  3
                </div>
                <div className="space-y-2 mt-2">
                  <img src={top3.avatar} alt={top3.name} className="w-16 h-16 rounded-full mx-auto border-2 border-amber-700 object-cover" />
                  <div className="font-bold text-white text-sm">{top3.name}</div>
                  <div className="text-[11px] text-slate-400">{top3.department}</div>
                </div>
                <div className="pt-3 border-t border-slate-800 w-full mt-3 font-mono text-emerald-400 font-bold text-sm">
                  {top3.totalScore} PTS
                </div>
              </div>
            )}

          </div>

          {/* Full Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Classificação Geral dos Colaboradores</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Filtrar Setor:</span>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
                >
                  <option value="Todos">Todos os Setores</option>
                  <option value="Tecnologia & DevOps">Tecnologia & DevOps</option>
                  <option value="Segurança da Informação">Segurança da Informação</option>
                  <option value="Financeiro & Controladoria">Financeiro & Controladoria</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="Comercial & Vendas">Comercial & Vendas</option>
                  <option value="Jurídico & Compliance">Jurídico & Compliance</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4">POS</th>
                    <th className="py-3 px-4">COLABORADOR</th>
                    <th className="py-3 px-4">DEPARTAMENTO</th>
                    <th className="py-3 px-4 text-center">SOLVES</th>
                    <th className="py-3 px-4 text-center">OFENSIVA</th>
                    <th className="py-3 px-4 text-right">PONTUAÇÃO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLeaderboard.map((user, idx) => {
                    const isCurrent = user.id === currentUser.id;
                    return (
                      <tr
                        key={user.id}
                        className={`transition-colors ${
                          isCurrent 
                            ? 'bg-emerald-950/30 text-white font-semibold border-l-4 border-l-emerald-500' 
                            : 'hover:bg-slate-800/50 text-slate-300'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold">
                          {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {isCurrent && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    VOCÊ
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">{user.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {user.department}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          {user.completedChallengeIds.length}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          <span className="inline-flex items-center gap-1 text-amber-400">
                            <Flame className="w-3.5 h-3.5 fill-current" />
                            {user.streakDays}d
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                          {user.totalScore} PTS
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: DEPARTMENTS BATTLE */}
      {tab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DEPARTMENT_METRICS.map((dept, idx) => (
            <div
              key={dept.department}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden"
            >
              <div 
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: dept.color }}
              />

              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-500 font-bold">
                  RANK #{idx + 1}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                  {dept.memberCount} colaboradores
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base">{dept.department}</h3>
                <div className="text-emerald-400 font-mono font-bold text-lg mt-1">
                  {dept.totalPoints} PTS
                </div>
              </div>

              <div className="space-y-2 text-xs pt-2 border-t border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>Média por colaborador:</span>
                  <span className="font-mono text-white font-bold">{dept.avgScore} pts</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Taxa de conclusão CTF:</span>
                  <span className="font-mono text-cyan-400 font-bold">{dept.completionRate}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Resiliência a Phishing:</span>
                  <span className="font-mono text-emerald-400 font-bold">{dept.phishingResilience}%</span>
                </div>
              </div>

              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${dept.completionRate}%`, backgroundColor: dept.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: BADGES GALLERY */}
      {tab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BADGES.map((badge) => {
            const isUnlocked = currentUser.unlockedBadgeIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between space-y-3 transition-all ${
                  isUnlocked
                    ? 'bg-slate-900/90 border-amber-500/40 shadow-xl'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getRarityBadge(badge.rarity)}`}>
                      {badge.rarity}
                    </span>
                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        DESBLOQUEADO
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                        <Lock className="w-3.5 h-3.5" />
                        BLOQUEADO
                      </span>
                    )}
                  </div>

                  <div className="w-14 h-14 rounded-2xl mx-auto bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shadow-inner">
                    {badge.id.includes('phish') ? '🎣' : badge.id.includes('web') ? '🌐' : badge.id.includes('crypto') ? '🔑' : badge.id.includes('soc') ? '🔍' : badge.id.includes('cloud') ? '☁️' : '🛡️'}
                  </div>

                  <div className="text-center space-y-1">
                    <h4 className="font-bold text-white text-sm">{badge.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{badge.description}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-center font-mono">
                  Requisito: {badge.requirement}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
