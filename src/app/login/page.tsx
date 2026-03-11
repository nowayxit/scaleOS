"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (isLogin) {
      // Handle Login
      try {
        const res = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (res?.error) {
          setError(res.error);
        } else {
          router.push("/");
          router.refresh(); // Force reload to apply session
        }
      } catch (err) {
        setError("Erro ao fazer login. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Handle Register
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          // Auto login after register
          await signIn("credentials", {
            redirect: false,
            email: formData.email,
            password: formData.password,
          });
          router.push("/");
          router.refresh();
        } else {
          const data = await res.json();
          setError(data.message || "Erro ao registrar conta.");
        }
      } catch (err) {
        setError("Erro de rede. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full flex-1 min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-400/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-0.5 rounded-2xl bg-gradient-to-b from-brand-500/50 to-transparent mb-6 shadow-[0_0_40px_rgba(89,115,255,0.2)] group">
            <div className="w-14 h-14 rounded-[15px] bg-background flex items-center justify-center border border-white/5 transition-transform group-hover:scale-105">
              <Zap className="text-brand-400 fill-brand-400/20" size={28} />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Scale</span>
            <span className="text-white">OS</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-[280px] mx-auto mt-3">
            O sistema operacional definitivo para gestores de alta performance.
          </p>
        </div>

        <div className="backdrop-blur-xl bg-card/40 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle inner highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none"></div>

          <h2 className="text-xl font-bold text-white mb-6 text-center relative z-10">
            {isLogin ? "Acesse sua conta" : "Crie sua conta ScaleOS"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Nome ou Agência</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome"
                  className="w-full bg-background border border-card-border rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">E-mail</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                className="w-full bg-background border border-card-border rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Senha</label>
                {isLogin && <a href="#" className="text-[10px] text-brand-400 hover:text-brand-300">Esqueceu a senha?</a>}
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-background border border-card-border rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-status-red/10 border border-status-red/20 rounded-lg">
                <p className="text-xs text-status-red text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(89,115,255,0.3)] hover:shadow-[0_0_30px_rgba(89,115,255,0.5)] disabled:opacity-50 mt-8 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : (isLogin ? "Entrar na plataforma" : "Criar Agência")}
              {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              {isLogin ? "Ainda não tem uma conta?" : "Já possui uma agência cadastrada?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
              >
                {isLogin ? "Criar agência" : "Fazer login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
