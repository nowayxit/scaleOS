import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciais inválidas");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() }
        });

        if (!user || !user.password) {
          throw new Error("Usuário não encontrado");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Senha incorreta");
        }

        return user;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.agencyId = (user as any).agencyId;
        token.name = user.name;
        token.email = user.email;
      }
      
      // Quando usarmos `update({ name: 'Novo' })` via useSession, ele vai cair aqui
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).agencyId = token.agencyId;
        session.user.name = token.name as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "scaleos-saas-secret-key-123456",
};
