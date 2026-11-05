import React, { useState } from 'react';
import { 
  Shield, 
  Flame, 
  Trophy, 
  Bell, 
  Building2, 
  User, 
  CheckCircle2, 
  Sparkles,
  Volume2
} from 'lucide-react';
import { UserProfile, SecurityAlert } from '../types';

interface HeaderProps {
  user: UserProfile;
  alerts: SecurityAlert[];
  onOpenNotifications: () => void;
  onSelectDepartment: (dept: string) => void;
  availableDepartments: string[];
}

export const Header: React.FC<HeaderProps> = ({
  user,
  alerts,
  onOpenNotifications,
  onSelectDepartment,
  availableDepartments
}) => {
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Shield className="w-6 h-6 animate-pulse" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg lg:text-xl tracking-tight text-white font-mono flex items-center gap-1.5">
                Cyber<span className="text-emerald-400">Shield</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded uppercase tracking-wider">
                  CTF Enterprise
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Capacitação & Conscientização Contínua em Cibersegurança
            </p>
          </div>
        </div>

        {/* User Stats & Actions */}
        <div className="flex items-center gap-3 lg:gap-5">
          
          {/* Department Selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowDeptDropdown(!showDeptDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all"
              title="Trocar departamento para simulação"
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{user.department}</span>
            </button>

            {showDeptDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                  Simular Departamento
                </div>
                {availableDepartments.map(dept => (
                  <button
                    key={dept}
                    onClick={() => {
                      onSelectDepartment(dept);
                      setShowDeptDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                      user.department === dept ? 'text-emerald-400 font-semibold bg-emerald-950/20' : 'text-slate-300'
                    }`}
                  >
                    <span>{dept}</span>
                    {user.department === dept && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Points Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            <span>{user.totalScore} <span className="text-[10px] text-emerald-400/70 font-sans">PTS</span></span>
          </div>

          {/* Daily Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold" title="Dias seguidos de treinamento ativo">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-500 animate-bounce" />
            <span>{user.streakDays} <span className="text-[10px] text-amber-400/70 font-sans hidden sm:inline">dias</span></span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            title="Alertas de segurança e dicas diárias"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-lg animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Mini */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-emerald-500/50 object-cover"
            />
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
              <div className="text-[11px] text-slate-400 leading-tight">{user.role}</div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
