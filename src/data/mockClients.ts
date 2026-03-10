export type HealthStatus = 'good' | 'warning' | 'critical';

export interface Client {
    id: string;
    name: string;
    niche: string;
    onboardingDate: string;

    // Financeiro
    budget: number;
    currentSpend: number;
    currency: string;

    // Técnico e Metas
    targetCpa: number;
    minRoas: number;

    // Links de Acesso Rápido (opcionais)
    adsManagerUrl?: string;
    ga4Url?: string;
    lookerUrl?: string;

    // Saúde
    healthStatus: HealthStatus;

    // The Routine Engine
    lastOptimization: string;
    nextReviewDate: string;
    pendingInsight: string;
}

export const mockClients: Client[] = [
    {
        id: 'c1',
        name: 'Clinica Amme',
        niche: 'Saúde / Estética',
        onboardingDate: '2025-01-10',
        budget: 15000,
        currentSpend: 4500,
        currency: 'BRL',
        targetCpa: 45,
        minRoas: 4.5,
        healthStatus: 'good',
        adsManagerUrl: 'https://www.facebook.com/adsmanager',
        ga4Url: '',
        lookerUrl: '',
        lastOptimization: '2 horas atrás',
        nextReviewDate: '2026-03-07',
        pendingInsight: 'Campanha de Bichectomia convertendo a R$38. Escalar na sexta.',
    },
    {
        id: 'c2',
        name: 'Flavia Sell',
        niche: 'Infoproduto / Moda',
        onboardingDate: '2025-06-15',
        budget: 80000,
        currentSpend: 75000,
        currency: 'BRL',
        targetCpa: 80,
        minRoas: 3.0,
        healthStatus: 'critical',
        adsManagerUrl: '',
        ga4Url: '',
        lookerUrl: '',
        lastOptimization: 'Ontem',
        nextReviewDate: '2026-03-06',
        pendingInsight: 'Verba estourando no remarketing. ROAS caiu para 1.8.',
    },
    {
        id: 'c3',
        name: 'Vanessa Menegaz',
        niche: 'Serviços B2B',
        onboardingDate: '2024-11-05',
        budget: 5000,
        currentSpend: 3100,
        currency: 'BRL',
        targetCpa: 120,
        minRoas: 0,
        healthStatus: 'warning',
        adsManagerUrl: '',
        ga4Url: '',
        lookerUrl: '',
        lastOptimization: '3 dias atrás',
        nextReviewDate: '2026-03-05',
        pendingInsight: 'CPL subiu +30%. Checar termo de busca no Google Ads.',
    },
    {
        id: 'c4',
        name: 'Tedd Catch',
        niche: 'E-commerce / Pets',
        onboardingDate: '2025-08-20',
        budget: 25000,
        currentSpend: 12000,
        currency: 'BRL',
        targetCpa: 30,
        minRoas: 5.0,
        healthStatus: 'good',
        adsManagerUrl: '',
        ga4Url: '',
        lookerUrl: '',
        lastOptimization: 'Hoje, 09:00',
        nextReviewDate: '2026-03-08',
        pendingInsight: 'Novo criativo TIKTOK com HOOK de 33%. Mantendo.',
    },
    {
        id: 'c5',
        name: 'Bicho-papão',
        niche: 'E-commerce / Infantil',
        onboardingDate: '2023-01-10',
        budget: 40000,
        currentSpend: 38000,
        currency: 'BRL',
        targetCpa: 55,
        minRoas: 3.5,
        healthStatus: 'critical',
        adsManagerUrl: '',
        ga4Url: '',
        lookerUrl: '',
        lastOptimization: '5 dias atrás',
        nextReviewDate: '2026-03-05',
        pendingInsight: 'Fadiga Criativa (Freq > 5). Necessita aprovação de urgência.',
    },
    {
        id: 'c6',
        name: 'Splash Pelotas',
        niche: 'Negócio Local / Bebidas',
        onboardingDate: '2025-10-01',
        budget: 2000,
        currentSpend: 800,
        currency: 'BRL',
        targetCpa: 15,
        minRoas: 0,
        healthStatus: 'good',
        adsManagerUrl: '',
        ga4Url: '',
        lookerUrl: '',
        lastOptimization: 'Hoje, 14:00',
        nextReviewDate: '2026-03-10',
        pendingInsight: 'Campanha de Ifood com CTR de 4.5%. Rodando liso.',
    },
    {
        id: 'c7',
        name: 'Kosloski Serralheria',
        niche: 'Negócio Local / Serviços',
        onboardingDate: '2026-01-20',
        budget: 1500,
        currentSpend: 100,
        currency: 'BRL',
        targetCpa: 40,
        minRoas: 0,
        healthStatus: 'warning',
        adsManagerUrl: '',
        ga4Url: '',
        lookerUrl: '',
        lastOptimization: 'Há 1 semana',
        nextReviewDate: '2026-03-05',
        pendingInsight: 'Campanha recém lançada, aguardando aprendizado Google Local.',
    },
];
