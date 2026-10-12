import React from 'react';
import { 
  Terminal, 
  MailWarning, 
  LayoutDashboard, 
  Trophy, 
  ShieldAlert,
  Award
} from 'lucide-react';

export type ActiveTab = 'ctf' | 'phishing' | 'dashboard' | 'leaderboard' | 'vulnerabilities';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  unresolvedChallengesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  unresolvedChallengesCount
}) => {
  const tabs = [
    {
      id: 'ctf' as ActiveTab,
      label: 'Desafios CTF',
      sublabel: 'Cenários Reais PicoCTF',
      icon: Terminal,
      badge: unresolvedChallengesCount > 0 ? `${unresolvedChallengesCount}` : undefined
    },
    {
      id: 'phishing' as ActiveTab,
      label: 'Simulador de Phishing',
      sublabel: 'Prática Interativa Anti-Golpe',
      icon: MailWarning
    },
    {
      id: 'dashboard' as ActiveTab,
      label: 'Meu Dashboard',
      sublabel: 'Progresso & Métricas',
      icon: LayoutDashboard
    },
    {
      id: 'leaderboard' as ActiveTab,
      label: 'Ranking & Emblemas',
      sublabel: 'Competição Saudável',
      icon: Trophy
    },
    {
      id: 'vulnerabilities' as ActiveTab,
      label: 'Vulnerabilidades Internas',
      sublabel: 'Relatório Executivo CISO',
      icon: ShieldAlert
    }
  ];

  return (
    <nav className="border-b border-slate-800/80 bg-slate-950/60 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform ${isActive ? 'text-emerald-400 scale-110' : 'text-slate-400'}`} />
              <div className="flex flex-col text-left">
                <span className="leading-tight font-semibold">{tab.label}</span>
                <span className="text-[10px] text-slate-500 hidden md:block leading-tight">{tab.sublabel}</span>
              </div>
              {tab.badge && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
