import { Metadata } from "next";
import { ChatInterface } from "@/components/ChatInterface";
import { MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
    title: "Chat da Equipe | ScaleOS",
    description: "Comunicação interna da equipe dentro do seu espaço de trabalho.",
};

export default function ChatPage() {
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="flex-shrink-0 h-16 border-b border-white/5 bg-background/80 backdrop-blur-sm flex items-center px-6 gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
                    <MessageSquare size={16} className="text-brand-400" />
                </div>
                <div>
                    <h1 className="text-base font-semibold text-white">Chat da Equipe</h1>
                    <p className="text-xs text-muted-foreground">Comunicação interna do seu espaço</p>
                </div>
            </header>

            {/* Chat fills remaining height */}
            <div className="flex-1 overflow-hidden">
                <ChatInterface />
            </div>
        </div>
    );
}
