import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ScaleOS | Operating System",
  description: "Painel de Controle de Saúde de Contas e Histórico Estratégico para Gestores de Tráfego de Alta Performance.",
};

import { AuthProvider } from "@/components/providers/AuthProvider";
import { DataProvider } from "@/components/providers/DataProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground flex`}>
        <AuthProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

