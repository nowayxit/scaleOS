"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, Users, Briefcase } from "lucide-react";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setIsCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (res.ok) {
        const agency = await res.json();
        await update({ currentAgencyId: agency.id });
        router.push("/");
      } else {
        const text = await res.text();
        setError(text || "Erro ao criar espaço.");
        setIsCreating(false);
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setIsCreating(false);
    }
  }

  const displayName = (session?.user as any)?.name || "Usuário";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-7 h-7 rounded bg-brand-500 shadow-[0_0_20px_rgba(89,115,255,0.6)]" />
          <span className="text-2xl font-bold tracking-tighter">Scale<span className="text-white">OS</span></span>
        </div>

        <div className="bg-card rounded-3xl border border-white/10 p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-1">Bem-vindo, {displayName}! 👋</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Antes de começar, crie o seu primeiro <strong className="text-white">Espaço de Trabalho</strong>. 
            Pense nele como o ambiente da sua agência ou operação.
          </p>

          {/* Examples */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { icon: Building2, label: "Agência Insight", sub: "Para agências de marketing" },
              { icon: Users, label: "Apenas Eu", sub: "Uso solo / freelancer" },
              { icon: Briefcase, label: "Minha Operação", sub: "Nome da operação" },
              { icon: Building2, label: "ScaleAgency", sub: "Qualquer nome funciona!" },
            ].map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => setName(ex.label)}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/8 hover:bg-white/7 hover:border-brand-500/30 transition-all text-left"
              >
                <ex.icon size={16} className="text-brand-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white">{ex.label}</p>
                  <p className="text-[10px] text-muted-foreground">{ex.sub}</p>
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Nome do Espaço
              </label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Agência Insight..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500/50 transition-colors"
                disabled={isCreating}
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={!name.trim() || isCreating}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <><Loader2 size={16} className="animate-spin" /> Criando espaço...</>
              ) : (
                "Criar Espaço e Entrar →"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
