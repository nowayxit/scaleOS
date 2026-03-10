import { Sidebar } from "@/components/layout/Sidebar";
import { TaskBoard } from "@/components/TaskBoard";
import { Zap } from "lucide-react";

export default function TarefasPage() {
  return (
    <>
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen max-h-screen overflow-hidden flex flex-col bg-background relative">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-100px] left-[100px] w-[600px] h-[600px] bg-brand-900/10 rounded-full blur-[150px] pointer-events-none"></div>

        <header className="px-8 py-7 border-b border-card-border bg-card/60 backdrop-blur-xl flex justify-between items-center z-10 shrink-0 shadow-lg">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                  <div className="w-3 h-8 bg-brand-500 rounded-sm shadow-[0_0_15px_rgba(89,115,255,0.5)]"></div>
                  Gestão de Tarefas
              </h1>
              <p className="text-sm text-brand-200/60 mt-2 font-medium">Organize fluxos, acompanhe demandas e gerencie as prioridades dos seus clientes.</p>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="bg-brand-500/10 border border-brand-500/20 px-5 py-2.5 rounded-lg flex items-center gap-2.5 shadow-inner">
                   <Zap size={16} className="text-brand-400" />
                   <span className="text-sm font-bold text-brand-200">7 Demandas Ativas</span>
               </div>
            </div>
        </header>

        <section className="flex-1 p-6 z-10 overflow-hidden h-full">
            <TaskBoard />
        </section>
      </main>
    </>
  );
}
