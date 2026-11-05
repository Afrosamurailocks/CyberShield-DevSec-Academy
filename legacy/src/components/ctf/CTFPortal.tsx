import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Flame, 
  Terminal, 
  Sparkles, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Building,
  Tag
} from 'lucide-react';
import { Challenge, Category, Difficulty, UserProfile } from '../../types';

interface CTFPortalProps {
  challenges: Challenge[];
  user: UserProfile;
  onOpenChallenge: (challenge: Challenge) => void;
}

export const CTFPortal: React.FC<CTFPortalProps> = ({
  challenges,
  user,
  onOpenChallenge
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unsolved' | 'solved'>('all');

  const categories: Array<string> = [
    'Todas',
    'Web Security',
    'Engenharia Social',
    'Criptografia & Senhas',
    'Forense & Logs',
    'Cloud & APIs'
  ];

  const difficulties: Array<string> = ['Todas', 'Iniciante', 'Intermediário', 'Avançado'];

  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      const isSolved = user.completedChallengeIds.includes(c.id);
      
      if (selectedCategory !== 'Todas' && c.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'Todas' && c.difficulty !== selectedDifficulty) return false;
      if (statusFilter === 'solved' && !isSolved) return false;
      if (statusFilter === 'unsolved' && isSolved) return false;
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesDesc = c.description.toLowerCase().includes(query);
        const matchesTags = c.tags.some(t => t.toLowerCase().includes(query));
        const matchesContext = c.corporateContext.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesTags && !matchesContext) return false;
      }

      return true;
    });
  }, [challenges, user.completedChallengeIds, selectedCategory, selectedDifficulty, statusFilter, searchQuery]);

  const totalPointsAvailable = challenges.reduce((acc, c) => acc + c.points, 0);
  const userSolvedPoints = challenges
    .filter(c => user.completedChallengeIds.includes(c.id))
    .reduce((acc, c) => acc + c.points, 0);
  const completionPercentage = Math.round((user.completedChallengeIds.length / challenges.length) * 100) || 0;

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case 'Iniciante':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Intermediário':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Avançado':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
  };

  const getCategoryColor = (cat: Category) => {
    switch (cat) {
      case 'Web Security': return 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20';
      case 'Engenharia Social': return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
      case 'Criptografia & Senhas': return 'text-purple-400 border-purple-500/30 bg-purple-950/20';
      case 'Forense & Logs': return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
      case 'Cloud & APIs': return 'text-blue-400 border-blue-500/30 bg-blue-950/20';
      default: return 'text-slate-400 border-slate-700 bg-slate-900';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner de Apresentação Estilo PicoCTF Corporativo */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <Terminal className="w-3.5 h-3.5" />
              <span>Ambiente Interativo de Treinamento Prático</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Desafios Práticos de Cibersegurança Corporativa
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Inspirado no consagrado formato <strong className="text-emerald-400">PicoCTF</strong>. Explore terminais virtuais, inspecione requisições HTTP, analise código vulnerável de sistemas internos e descubra flags no formato <code className="text-emerald-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">CYBER&#123;...&#125;</code> para proteger nossa empresa.
            </p>
          </div>

          {/* Card de Progresso Rápido */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 min-w-[240px] w-full md:w-auto shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Seu Domínio de Flags</span>
              <span className="font-mono text-emerald-400 font-bold">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">
                <strong className="text-white">{user.completedChallengeIds.length}</strong> / {challenges.length} resolvidos
              </span>
              <span className="text-emerald-400 font-bold">
                {userSolvedPoints} / {totalPointsAvailable} PTS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Filtros e Busca */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-4">
        
        {/* Barra de Pesquisa e Status */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por título, tecnologia (SQLi, JWT, SPF), ou contexto corporativo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>

          {/* Filtro de Status */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({challenges.length})
            </button>
            <button
              onClick={() => setStatusFilter('unsolved')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'unsolved' ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pendentes ({challenges.length - user.completedChallengeIds.length})
            </button>
            <button
              onClick={() => setStatusFilter('solved')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'solved' ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Resolvidos ({user.completedChallengeIds.length})
            </button>
          </div>
        </div>

        {/* Linha de Categorias e Dificuldade */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          
          {/* Categorias */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            <span className="text-xs text-slate-500 mr-1 hidden sm:inline">Categoria:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Dificuldade */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 mr-1">Dificuldade:</span>
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-slate-200 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Grid de Desafios Estilo PicoCTF */}
      {filteredChallenges.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center space-y-3">
          <Terminal className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">Nenhum desafio encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tente redefinir os filtros de busca ou categoria para encontrar outros desafios disponíveis.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('Todas');
              setSelectedDifficulty('Todas');
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredChallenges.map((challenge) => {
            const isSolved = user.completedChallengeIds.includes(challenge.id);
            return (
              <div
                key={challenge.id}
                onClick={() => onOpenChallenge(challenge)}
                className={`group relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 cursor-pointer overflow-hidden ${
                  isSolved
                    ? 'bg-slate-900/50 border-emerald-500/30 hover:border-emerald-500/60 shadow-sm'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850 shadow-md hover:shadow-xl'
                }`}
              >
                {/* Solved Banner Indicator */}
                {isSolved && (
                  <div className="absolute top-0 right-0 bg-emerald-500/20 border-b border-l border-emerald-500/40 px-3 py-1 rounded-bl-xl flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>RESOLVIDO</span>
                  </div>
                )}

                {/* Top Badges */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap pr-20">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getCategoryColor(challenge.category)}`}>
                      {challenge.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getDifficultyBadge(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {challenge.title}
                  </h3>

                  {/* Corporate Context Pill */}
                  <div className="flex items-start gap-1.5 text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <Building className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">
                      <strong className="text-slate-300">Cenário:</strong> {challenge.corporateContext}
                    </span>
                  </div>

                  {/* Short description */}
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {challenge.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {challenge.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer of Card */}
                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold text-sm">
                    <span>+{challenge.points}</span>
                    <span className="text-[10px] text-slate-500 font-sans">PTS</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {challenge.solveCount} solves
                    </span>
                    <div className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                      <span>{isSolved ? 'Revisar' : 'Entrar'}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
