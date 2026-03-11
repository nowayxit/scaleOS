"use client";

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Play, Pause, RotateCcw, SkipForward, BrainCircuit, Coffee, Settings, ChevronUp, ChevronDown, Bell } from 'lucide-react';

export function PomodoroTimer() {
    const { pomodoro, setPomodoroState } = useAppStore();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // ── Expanded state
    const [expanded, setExpanded] = useState(false);

    // ── Settings state (in minutes)
    const [showSettings, setShowSettings] = useState(false);
    const [workMinutes, setWorkMinutes] = useState(25);
    const [breakMinutes, setBreakMinutes] = useState(5);

    // ── Notification permission
    const [hasPermission, setHasPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if ("Notification" in window) setHasPermission(Notification.permission);
    }, []);

    const requestPermission = async () => {
        if ("Notification" in window && Notification.permission !== "granted") {
            const perm = await Notification.requestPermission();
            setHasPermission(perm);
        }
    };

    const sendNotification = (mode: 'work' | 'break') => {
        if (hasPermission === 'granted') {
            new Notification(mode === 'work' ? '🎉 Foco Concluído!' : '⏰ Pausa Terminada!', {
                body: mode === 'work'
                    ? `Descanse por ${breakMinutes} minutos. Você merece!`
                    : `Hora de voltar ao foco! ${workMinutes} minutos de trabalho.`,
                icon: '/favicon.ico',
            });
        }
    };

    // ── Timer tick
    useEffect(() => {
        if (pomodoro.active && pomodoro.timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setPomodoroState({ timeLeft: pomodoro.timeLeft - 1 });
            }, 1000);
        } else if (pomodoro.active && pomodoro.timeLeft === 0) {
            clearInterval(intervalRef.current!);
            sendNotification(pomodoro.mode);
            const nextMode = pomodoro.mode === 'work' ? 'break' : 'work';
            const nextTime = (nextMode === 'work' ? workMinutes : breakMinutes) * 60;
            setPomodoroState({ mode: nextMode, timeLeft: nextTime, active: false });
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [pomodoro.active, pomodoro.timeLeft, pomodoro.mode, setPomodoroState, workMinutes, breakMinutes]);

    const handleToggle = () => {
        if (hasPermission === 'default') requestPermission();
        setPomodoroState({ active: !pomodoro.active });
    };

    const handleReset = () => {
        const t = (pomodoro.mode === 'work' ? workMinutes : breakMinutes) * 60;
        setPomodoroState({ active: false, timeLeft: t });
    };

    const handleSkip = () => {
        const nextMode = pomodoro.mode === 'work' ? 'break' : 'work';
        const nextTime = (nextMode === 'work' ? workMinutes : breakMinutes) * 60;
        setPomodoroState({ active: false, mode: nextMode, timeLeft: nextTime });
    };

    const applySettings = () => {
        const wm = Math.max(1, Math.min(90, workMinutes));
        const bm = Math.max(1, Math.min(30, breakMinutes));
        setWorkMinutes(wm);
        setBreakMinutes(bm);
        const t = (pomodoro.mode === 'work' ? wm : bm) * 60;
        setPomodoroState({ active: false, timeLeft: t });
        setShowSettings(false);
    };

    // ── Display
    const minutes = Math.floor(pomodoro.timeLeft / 60);
    const seconds = pomodoro.timeLeft % 60;
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const isWork = pomodoro.mode === 'work';
    const progress = pomodoro.timeLeft / ((isWork ? workMinutes : breakMinutes) * 60);
    const dash = 2 * Math.PI * 20; // r=20
    const strokeDash = dash * (1 - progress);

    // ── Collapsed pill
    if (!expanded) {
        return (
            <div
                onClick={() => setExpanded(true)}
                className={`mt-auto mb-6 mx-4 flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer border transition-all hover:scale-[1.02] active:scale-95 ${
                    isWork
                        ? 'bg-brand-600/10 border-brand-500/30 hover:border-brand-500/50'
                        : 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                }`}
            >
                {/* Arc progress mini */}
                <div className="relative w-8 h-8 flex-shrink-0">
                    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 44 44">
                        <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                        <circle
                            cx="22" cy="22" r="20" fill="none"
                            stroke={isWork ? '#5973ff' : '#34d399'}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={dash}
                            strokeDashoffset={strokeDash}
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        {isWork
                            ? <BrainCircuit size={12} className="text-brand-400" />
                            : <Coffee size={12} className="text-emerald-400" />
                        }
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold font-mono tracking-widest ${isWork ? 'text-brand-200' : 'text-emerald-200'}`}>
                        {timeStr}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                        {isWork ? 'Foco' : 'Pausa'} {pomodoro.active ? '· Ativo' : '· Pausado'}
                    </p>
                </div>

                <ChevronUp size={14} className="text-muted-foreground flex-shrink-0" />
            </div>
        );
    }

    // ── Expanded view
    return (
        <div className={`mt-auto mb-4 mx-4 rounded-2xl border flex flex-col overflow-hidden transition-all ${ 
            isWork ? 'bg-brand-600/10 border-brand-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
        }`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <div className="flex items-center gap-1.5">
                    {isWork ? <BrainCircuit size={14} className="text-brand-400" /> : <Coffee size={14} className="text-emerald-400" />}
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isWork ? 'text-brand-400' : 'text-emerald-400'}`}>
                        {isWork ? 'Foco' : 'Pausa'}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {hasPermission !== 'granted' && (
                        <button onClick={requestPermission} title="Ativar notificações" className="text-muted-foreground hover:text-white p-1 rounded">
                            <Bell size={13} />
                        </button>
                    )}
                    <button onClick={() => setShowSettings(s => !s)} title="Configurar tempos" className={`p-1 rounded transition-colors ${showSettings ? 'text-white' : 'text-muted-foreground hover:text-white'}`}>
                        <Settings size={13} />
                    </button>
                    <button onClick={() => setExpanded(false)} className="text-muted-foreground hover:text-white p-1 rounded">
                        <ChevronDown size={14} />
                    </button>
                </div>
            </div>

            {/* Settings panel */}
            {showSettings && (
                <div className="mx-4 mb-2 p-3 bg-white/5 rounded-xl border border-white/10 space-y-3">
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Personalizar Tempos</p>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-[10px] text-muted-foreground block mb-1">Foco (min)</label>
                            <input
                                type="number" min={1} max={90}
                                value={workMinutes}
                                onChange={e => setWorkMinutes(Number(e.target.value))}
                                className="w-full bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center outline-none focus:border-brand-500/50 [appearance:textfield]"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] text-muted-foreground block mb-1">Pausa (min)</label>
                            <input
                                type="number" min={1} max={30}
                                value={breakMinutes}
                                onChange={e => setBreakMinutes(Number(e.target.value))}
                                className="w-full bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center outline-none focus:border-brand-500/50 [appearance:textfield]"
                            />
                        </div>
                    </div>
                    <button onClick={applySettings} className={`w-full py-1.5 rounded-lg text-xs font-semibold text-white transition-colors ${ isWork ? 'bg-brand-600 hover:bg-brand-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                        Aplicar
                    </button>
                </div>
            )}

            {/* Arc + time */}
            <div className="flex flex-col items-center py-4 gap-2">
                <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 44 44">
                        <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
                        <circle
                            cx="22" cy="22" r="20" fill="none"
                            stroke={isWork ? '#5973ff' : '#34d399'}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray={dash}
                            strokeDashoffset={strokeDash}
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                        <span className={`text-2xl font-mono font-bold tracking-widest ${isWork ? 'text-brand-100' : 'text-white'}`}>
                            {timeStr}
                        </span>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest">
                            {isWork ? `${workMinutes}m foco` : `${breakMinutes}m pausa`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2 pb-4">
                <button onClick={handleReset} title="Reiniciar" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white flex items-center justify-center transition-colors">
                    <RotateCcw size={13} />
                </button>

                <button
                    onClick={handleToggle}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 ${
                        pomodoro.active ? 'bg-white/15 text-white hover:bg-white/20' : isWork ? 'bg-brand-600 text-white hover:bg-brand-500' : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                >
                    {pomodoro.active ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-0.5" />}
                </button>

                <button onClick={handleSkip} title="Pular" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white flex items-center justify-center transition-colors">
                    <SkipForward size={13} />
                </button>
            </div>
        </div>
    );
}
