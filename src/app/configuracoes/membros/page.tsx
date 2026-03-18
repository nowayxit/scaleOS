"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Users, UserPlus, Trash2, Crown, Shield, User, Loader2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Member {
  id: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

const roleIcons: Record<string, React.ReactNode> = {
  OWNER: <Crown size={12} className="text-yellow-400" />,
  ADMIN: <Shield size={12} className="text-blue-400" />,
  MEMBER: <User size={12} className="text-muted-foreground" />,
};

const roleLabels: Record<string, string> = {
  OWNER: "Dono",
  ADMIN: "Admin",
  MEMBER: "Membro",
};

export default function MembrosPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentUserId = (session?.user as any)?.id;
  const myMembership = members.find(m => m.user.id === currentUserId);
  const canManage = myMembership && ["OWNER", "ADMIN"].includes(myMembership.role);

  async function fetchMembers() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/workspace/members");
      if (res.ok) setMembers(await res.json());
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchMembers(); }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setIsInviting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/workspace/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao convidar membro.");
      } else {
        setSuccess(`${data.user.name || data.user.email} foi adicionado(a) ao espaço!`);
        setEmail("");
        fetchMembers();
      }
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRemove(userId: string, memberName: string) {
    if (!confirm(`Remover ${memberName} do espaço?`)) return;
    const res = await fetch(`/api/workspace/members?userId=${userId}`, { method: "DELETE" });
    if (res.ok) fetchMembers();
    else {
      const text = await res.text();
      alert(text || "Erro ao remover membro.");
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
              <Users size={20} className="text-brand-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Membros do Espaço</h1>
              <p className="text-sm text-muted-foreground">Gerencie quem tem acesso a este espaço de trabalho.</p>
            </div>
          </div>

          {/* Invite Form */}
          {canManage && (
            <div className="bg-card rounded-2xl border border-white/8 p-5 mb-6">
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <UserPlus size={16} /> Convidar novo membro
              </h2>
              <form onSubmit={handleInvite} className="flex gap-3 flex-wrap">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500/50 transition-colors"
                  disabled={isInviting}
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50"
                  disabled={isInviting}
                >
                  <option value="MEMBER">Membro</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button
                  type="submit"
                  disabled={isInviting || !email.trim()}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isInviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  {isInviting ? "Convidando..." : "Convidar"}
                </button>
              </form>
              {error && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-2.5">
                  <X size={14} />{error}
                </div>
              )}
              {success && (
                <div className="mt-3 text-sm text-green-400 bg-green-500/10 rounded-xl px-4 py-2.5">
                  ✓ {success}
                </div>
              )}
            </div>
          )}

          {/* Members List */}
          <div className="bg-card rounded-2xl border border-white/8 overflow-hidden">
            <div className="p-5 border-b border-white/8">
              <h2 className="text-sm font-semibold text-white">{members.length} {members.length === 1 ? "membro" : "membros"}</h2>
            </div>
            {isLoading ? (
              <div className="p-10 flex justify-center">
                <Loader2 size={20} className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {members.map((member) => (
                  <li key={member.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-600/20 flex items-center justify-center text-sm font-bold text-brand-300">
                        {member.user.name?.[0]?.toUpperCase() || member.user.email?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{member.user.name || "Sem nome"}</p>
                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 font-medium">
                        {roleIcons[member.role]}
                        {roleLabels[member.role]}
                      </span>
                      {canManage && member.role !== "OWNER" && member.user.id !== currentUserId && (
                        <button
                          onClick={() => handleRemove(member.user.id, member.user.name || member.user.email || "usuário")}
                          className="text-muted-foreground hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10"
                          title="Remover membro"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            Apenas usuários que já criaram conta no ScaleOS podem ser convidados.
          </p>
        </div>
      </main>
    </div>
  );
}
