"use client";

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Play, Pause, Square, Coffee, BrainCircuit, Bell } from 'lucide-react';

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export function PomodoroTimer() {
    const { pomodoro, setPomodoroState } = useAppStore();
    const [hasPermission, setHasPermission] = useState<NotificationPermission>('default');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Request notification permissions
    useEffect(() => {
        if ("Notification" in window) {
            setHasPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if ("Notification" in window && Notification.permission !== "granted") {
            const permission = await Notification.requestPermission();
            setHasPermission(permission);
        }
    };

    const sendNotification = (mode: 'work' | 'break') => {
        if (hasPermission === 'granted') {
            const title = mode === 'work' ? 'Foco Concluído!' : 'Pausa Terminada!';
            const options = {
                body: mode === 'work' ? 'Descanse por 5 minutos.' : 'Hora de voltar ao foco.',
                icon: '/favicon.ico', // fallback icon
            };
            new Notification(title, options);
        }
    };

    // Timer Logic
    useEffect(() => {
        if (pomodoro.active && pomodoro.timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setPomodoroState({ timeLeft: pomodoro.timeLeft - 1 });
            }, 1000);
        } else if (pomodoro.active && pomodoro.timeLeft === 0) {
            // Timer Finished Phase
            clearInterval(intervalRef.current!);
            
            sendNotification(pomodoro.mode);
            
            const nextMode = pomodoro.mode === 'work' ? 'break' : 'work';
            const nextTime = nextMode === 'work' ? WORK_TIME : BREAK_TIME;
            
            setPomodoroState({
                mode: nextMode,
                timeLeft: nextTime,
                active: false // Wait for user to start next cycle
            });
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [pomodoro.active, pomodoro.timeLeft, pomodoro.mode, setPomodoroState]);

    const handleToggle = () => {
        if (hasPermission === 'default') requestPermission();
        setPomodoroState({ active: !pomodoro.active });
    };

    const handleReset = () => {
        setPomodoroState({
            active: false,
            timeLeft: pomodoro.mode === 'work' ? WORK_TIME : BREAK_TIME
        });
    };

    const handleSkip = () => {
        const nextMode = pomodoro.mode === 'work' ? 'break' : 'work';
        setPomodoroState({
            active: false,
            mode: nextMode,
            timeLeft: nextMode === 'work' ? WORK_TIME : BREAK_TIME
        });
    };

    // Formatting 00:00
    const minutes = Math.floor(pomodoro.timeLeft / 60);
    const seconds = pomodoro.timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const isWork = pomodoro.mode === 'work';

    return (
        <div className={`mt-auto mb-6 mx-4 p-4 rounded-xl border flex flex-col gap-3 transition-colors ${
            isWork ? 'bg-brand-600/10 border-brand-500/30' : 'bg-status-green/10 border-status-green/30'
        }`}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {isWork ? <BrainCircuit size={16} className="text-brand-400" /> : <Coffee size={16} className="text-status-green" />}
                    <span className={`text-xs font-bold uppercase tracking-wider ${isWork ? 'text-brand-400' : 'text-status-green'}`}>
                        {isWork ? 'Foco (25m)' : 'Pausa (5m)'}
                    </span>
                </div>
                {hasPermission !== 'granted' && (
                    <button onClick={requestPermission} className="text-muted-foreground hover:text-white" title="Ativar Notificações">
                        <Bell size={14} />
                    </button>
                )}
            </div>

            <div className={`text-3xl font-mono text-center font-bold tracking-widest ${isWork ? 'text-brand-100' : 'text-white'}`}>
                {timeString}
            </div>

            <div className="flex items-center justify-center gap-2 mt-1">
                <button 
                    onClick={handleToggle}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                        pomodoro.active 
                            ? 'bg-white/10 text-white hover:bg-white/20' 
                            : isWork ? 'bg-brand-600 text-white hover:bg-brand-500' : 'bg-status-green text-black hover:bg-status-green/80'
                    }`}
                >
                    {pomodoro.active ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-1" />}
                </button>
                
                <button 
                    onClick={handleReset}
                    className="flex justify-center items-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground transition-colors"
                    title="Reiniciar Tempo"
                >
                    <Square size={14} />
                </button>
                
                <button 
                    onClick={handleSkip}
                    className="flex justify-center items-center h-8 px-3 rounded-md bg-white/5 hover:bg-white/10 text-xs font-medium text-muted-foreground transition-colors"
                >
                    Pular
                </button>
            </div>
        </div>
    );
}
