import React from 'react';
import { 
  Trophy, 
  Flame, 
  Target, 
  ShieldCheck, 
  Award, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  TrendingUp,
  Terminal,
  Building2,
  Calendar
} from 'lucide-react';
import { UserProfile, Challenge, Category } from '../../types';
import { BADGES } from '../../data/badges';

interface UserDashboardProps {
  user: UserProfile;
  challenges: Challenge[];
  onOpenChallenge: (challenge: Challenge) => void;
  onNavigateToTab: (tab: 'ctf' | 'phishing' | 'leaderboard' | 'vulnerabilities') => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  challenges,
  onOpenChallenge,
  onNavigateToTab
}) => {
  const totalChallengesCount = challenges.length;
  const solvedCount = user.completedChallengeIds.length;
  const completionPercent = Math.round((solvedCount / totalChallengesCount) * 100) || 0;

  // Maturity Level calculation
  const getMaturityLevel = (score: number) => {
    if (score >= 1200) return { title: 'Arquiteto Blue Team (Nível 4)', color: 'text-purple-400', progress: 100 };
    if (score >= 700) return { title: 'Especialista SOC L2 (Nível 3)', color: 'text-cyan-400', progress: 75 };
    if (score >= 350) return { title: 'Guardião Digital (Nível 2)', color: 'text-emerald-400', progress: 50 };
    return { title: 'Recruta de Segurança (Nível 1)', color: 'text-amber-400', progress: 25 };
  };

  const maturity = getMaturityLevel(user.totalScore);

  // Categories progress
  const categories: Category[] = [
    'Web Security',
    'Engenharia Social',
    'Criptografia & Senhas',
    'Forense & Logs',
    'Cloud & APIs'
  ];

  const categoryStats = categories.map((cat) => {
    const totalInCat = challenges.filter(c => c.category === cat).length;
    const solvedInCat = challenges.filter(c => c.category === cat && user.completedChallengeIds.includes(c.id)).length;
    const percent = totalInCat > 0 ? Math.round((solvedInCat / totalInCat) * 100) : 0;
    return {
      category: cat,
      total: totalInCat,
      solved: solvedInCat,
      percent
    };
  });

  // Recommended next challenge
  const nextRecommended = challenges.find(c => !user.completedChallengeIds.includes(c.id));

  // Unlocked badges
  const userBadges = BADGES.filter(b => user.unlockedBadgeIds.includes(b.id));

  return (
    <div className="space-y-6">
      
      {/* Top Welcome / Individual Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-emerald-500/60 object-cover shadow-lg shadow-emerald-500/20"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-700 ${maturity.color}`}>
                {maturity.title}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                {user.department}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Painel de Desempenho de {user.name}
            </h1>
            <p className="text-xs text-slate-400">
              {user.role} &bull; Matrícula Ativa &bull; Última atividade hoje
            </p>
          </div>
        </div>

        {/* Big Quick Stats */}
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:p-4 text-center min-w-[90px] shadow-lg">
            <div className="text-emerald-400 font-mono font-extrabold text-xl sm:text-2xl">
              {user.totalScore}
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pontos</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:p-4 text-center min-w-[90px] shadow-lg">
            <div className="text-amber-400 font-mono font-extrabold text-xl sm:text-2xl flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-400" />
              {user.streakDays}d
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Ofensiva</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:p-4 text-center min-w-[90px] shadow-lg">
            <div className="text-cyan-400 font-mono font-extrabold text-xl sm:text-2xl">
              {userBadges.length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Emblemas</div>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Category Mastery & Recommended Next Step */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Category Mastery Progress */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Radar de Habilidades por Categoria
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {solvedCount} de {totalChallengesCount} Desafios Concluídos ({completionPercent}%)
              </span>
            </div>

            <div className="space-y-4">
              {categoryStats.map((item) => (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{item.category}</span>
                    <span className="text-slate-400 font-mono">
                      {item.solved} de {item.total} ({item.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.percent === 100
                          ? 'bg-emerald-500'
                          : item.percent > 50
                          ? 'bg-cyan-500'
                          : item.percent > 0
                          ? 'bg-amber-500'
                          : 'bg-slate-800'
                      }`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Next Challenge Card */}
          {nextRecommended && (
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 border border-cyan-500/40 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Próxima Missão Recomendada
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  +{nextRecommended.points} PTS
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white">
                  {nextRecommended.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {nextRecommended.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  Categoria: <strong className="text-slate-200">{nextRecommended.category}</strong> &bull; Dificuldade: <strong className="text-amber-400">{nextRecommended.difficulty}</strong>
                </div>

                <button
                  onClick={() => onOpenChallenge(nextRecommended)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Iniciar Laboratório</span>
                </button>
              </div>
            </div>
          )}

          {/* Conquistas Resolvidas Recentemente */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Histórico de Desafios Superados</span>
            </h3>

            <div className="space-y-2">
              {challenges
                .filter(c => user.completedChallengeIds.includes(c.id))
                .map(c => (
                  <div
                    key={c.id}
                    onClick={() => onOpenChallenge(c)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-200 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{c.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {c.category} &bull; {c.corporateContext}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-emerald-400 font-bold">+{c.points} PTS</span>
                      <button className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900">
                        Revisar
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>

        {/* Right Column (1 col): Badges, Phishing Card, and Department Security Insight */}
        <div className="space-y-6">
          
          {/* Badges Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Seus Emblemas</h3>
              </div>
              <button
                onClick={() => onNavigateToTab('leaderboard')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Ver todos</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {userBadges.map(badge => (
                <div
                  key={badge.id}
                  className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-center space-y-1"
                >
                  <div className="w-9 h-9 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    🏆
                  </div>
                  <div className="text-xs font-bold text-white truncate">{badge.title}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-2">{badge.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Resiliência a Phishing Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Resiliência a Phishing</h3>
              </div>
              <button
                onClick={() => onNavigateToTab('phishing')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Praticar</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Simulações Realizadas:</span>
                <span className="font-mono text-white font-bold">{user.phishingSimulationsTested}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Denúncias Corretas:</span>
                <span className="font-mono text-emerald-400 font-bold">{user.phishingSimulationsReported}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Falhas em Armadilhas:</span>
                <span className="font-mono text-rose-400 font-bold">{user.phishingSimulationsFailed}</span>
              </div>
            </div>
          </div>

          {/* Department Vulnerability Alert Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="w-5 h-5" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Alerta de Risco do Seu Setor
              </h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
              O setor <strong className="text-cyan-400">{user.department}</strong> é frequentemente visado por tentativas de vazamento de credenciais e tokens de API.
            </p>

            <button
              onClick={() => onNavigateToTab('vulnerabilities')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors"
            >
              Consultar Relatório de Vulnerabilidades
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
