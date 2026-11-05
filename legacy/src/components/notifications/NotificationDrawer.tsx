import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  ShieldAlert, 
  Lightbulb, 
  CheckCheck, 
  Send, 
  AlertOctagon, 
  Sparkles, 
  Info,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { SecurityAlert, DailyTip } from '../../types';
import { DAILY_TIPS } from '../../data/alertsAndTips';
import { notificationService } from '../../services/notificationService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SecurityAlert[];
  onMarkAsRead: (alertId: string) => void;
  onMarkAllAsRead: () => void;
  onTriggerSimulatedAlert: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onMarkAsRead,
  onMarkAllAsRead,
  onTriggerSimulatedAlert
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'alerts' | 'tips'>('alerts');
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [pushStatusMessage, setPushStatusMessage] = useState<string>('');
  const [selectedTipIndex, setSelectedTipIndex] = useState(0);

  useEffect(() => {
    if (notificationService.isSupported()) {
      setPermissionState(notificationService.getPermission());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPushPermission = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      setPermissionState('granted');
      setPushStatusMessage('Notificações Push nativas ativadas com sucesso!');
      notificationService.sendPush('🛡️ CyberShield Ativado', {
        body: 'Você agora receberá alertas urgentes de segurança e dicas diárias no seu dispositivo corporativo!'
      });
    } else {
      setPermissionState('denied');
      setPushStatusMessage('Permissão negada no navegador. Habilite nas configurações do site se desejar receber alertas.');
    }
    setTimeout(() => setPushStatusMessage(''), 4000);
  };

  const handleSendDailyTipPush = (tip: DailyTip) => {
    notificationService.sendDailyTip(tip);
    setPushStatusMessage(`Dica #${tip.dayIndex} enviada para o seu sistema!`);
    setTimeout(() => setPushStatusMessage(''), 3500);
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const currentTip = DAILY_TIPS[selectedTipIndex];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Central de Notificações</h3>
              <p className="text-[11px] text-slate-400">Alertas Urgentes & Dicas Diárias</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Push Notification Native Enabler Bar */}
        <div className="p-3 bg-slate-950/90 border-b border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-cyan-400" />
              <span>Notificações Push no Navegador:</span>
            </span>

            {permissionState === 'granted' ? (
              <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                ATIVADAS
              </span>
            ) : (
              <button
                onClick={handleRequestPushPermission}
                className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-colors"
              >
                Ativar Push
              </button>
            )}
          </div>

          {pushStatusMessage && (
            <div className="text-[11px] text-cyan-300 bg-cyan-950/40 p-2 rounded border border-cyan-500/30">
              {pushStatusMessage}
            </div>
          )}

          {/* Action Simulation Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onTriggerSimulatedAlert}
              className="flex-1 py-1.5 px-2 rounded bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <AlertOctagon className="w-3 h-3" />
              <span>Disparar Alerta Urgente (Push)</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs: Alerts vs Tips */}
        <div className="flex border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveSubTab('alerts')}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'alerts'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Alertas ({unreadCount})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tips')}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'tips'
                ? 'border-amber-500 text-amber-400 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Dicas do Dia ({DAILY_TIPS.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB 1: ALERTS */}
          {activeSubTab === 'alerts' && (
            <div className="space-y-3">
              {unreadCount > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Marcar todos como lidos</span>
                  </button>
                </div>
              )}

              {alerts.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <Bell className="w-10 h-10 mx-auto opacity-40" />
                  <p className="text-xs">Nenhum alerta pendente no momento.</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                      !alert.isRead
                        ? 'bg-slate-950 border-rose-500/40 shadow-md shadow-rose-950/20'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        alert.urgency === 'Crítico'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : alert.urgency === 'Alto'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {alert.urgency}
                      </span>
                      <span className="text-[11px] text-slate-500">{alert.timestamp}</span>
                    </div>

                    <h4 className="font-bold text-white leading-snug">
                      {alert.title}
                    </h4>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {alert.message}
                    </p>

                    {alert.actionRequired && (
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-[11px] text-cyan-300">
                        <strong>Ação recomendada:</strong> {alert.actionRequired}
                      </div>
                    )}

                    {!alert.isRead && (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => onMarkAsRead(alert.id)}
                          className="text-[11px] text-emerald-400 hover:underline"
                        >
                          Marcar como lido
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: DAILY TIPS */}
          {activeSubTab === 'tips' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Pílulas diárias de conscientização para proteger sua estação de trabalho e os dados da empresa:
              </div>

              {DAILY_TIPS.map((tip, idx) => (
                <div
                  key={tip.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 shadow-md"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded font-mono text-[10px] font-bold">
                      Dia {tip.dayIndex} &bull; {tip.category}
                    </span>
                    <button
                      onClick={() => handleSendDailyTipPush(tip)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      title="Enviar esta dica como notificação push para seu navegador"
                    >
                      <Send className="w-3 h-3" />
                      <span>Notificar-me</span>
                    </button>
                  </div>

                  <h4 className="font-bold text-white text-xs leading-snug">
                    {tip.title}
                  </h4>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-amber-200 text-xs font-medium">
                    {tip.shortTip}
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {tip.detailedAction}
                  </p>

                  <div className="text-[10px] text-slate-500 font-mono pt-1">
                    Autor: {tip.author}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-center text-[11px] text-slate-500">
          SOC CyberShield &bull; Monitoramento Ativo 24/7
        </div>

      </div>
    </div>
  );
};
