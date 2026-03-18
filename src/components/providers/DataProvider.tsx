"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useTaskStore } from "@/store/useTaskStore";

export function DataProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const setClients = useAppStore(s => s.setClients);
    const setRoutines = useAppStore(s => (s as any).setRoutines);
    const setDecisionLogs = useAppStore(s => (s as any).setDecisionLogs);
    const setCases = useAppStore(s => (s as any).setCases);
    const updateAgency = useAppStore(s => s.updateAgency);
    const setTasks = useTaskStore(s => (s as any).setTasks);

    const currentAgencyId = (session?.user as any)?.currentAgencyId;
    const [loadedForAgency, setLoadedForAgency] = useState<string | null>(null);

    // If authenticated but no workspace, redirect to onboarding (unless already there)
    useEffect(() => {
        if (status === "authenticated" && !currentAgencyId && pathname !== "/onboarding") {
            router.push("/onboarding");
        }
    }, [status, currentAgencyId, pathname, router]);

    useEffect(() => {
        if (status === "authenticated" && currentAgencyId && currentAgencyId !== loadedForAgency) {
            async function fetchInitialData() {
                try {
                    const res = await fetch("/api/clients");
                    if (res.ok) {
                        const dbClients = await res.json();
                        
                        // Flatten data for Zustand
                        const allRoutines: any[] = [];
                        const allDecisionLogs: any[] = [];
                        const allCases: any[] = [];
                        const allTasks: any[] = [];
                        const allMeetingNotes: any[] = [];

                        const cleanedClients = dbClients.map((client: any) => {
                            if (client.routines) allRoutines.push(...client.routines);
                            if (client.decisionLogs) allDecisionLogs.push(...client.decisionLogs);
                            if (client.cases) allCases.push(...client.cases);
                            if (client.meetingNotes) allMeetingNotes.push(...client.meetingNotes);
                            if (client.tasks) {
                                client.tasks.forEach((task: any) => {
                                    allTasks.push({
                                        ...task,
                                        clientName: client.name,
                                        tags: task.tags?.map((t: any) => t.id) || []
                                    });
                                });
                            }
                            // Return client without heavy nested relations to avoid massive redundant store
                            const { routines, decisionLogs, cases, tasks, meetingNotes, ...rest } = client;
                            return rest;
                        });

                        setClients(cleanedClients);
                        if (setRoutines) setRoutines(allRoutines);
                        if (setDecisionLogs) setDecisionLogs(allDecisionLogs);
                        if (setCases) setCases(allCases);
                        if (setTasks) setTasks(allTasks);
                        
                        // Load meeting notes into the store
                        useAppStore.setState({ meetingNotes: allMeetingNotes });

                        setLoadedForAgency(currentAgencyId);
                    }

                    const apiAgencyRes = await fetch("/api/agency");
                    if (apiAgencyRes.ok) {
                        const agencyData = await apiAgencyRes.json();
                        updateAgency({ 
                            id: agencyData.id, 
                            name: agencyData.name, 
                            plan: agencyData.plan, 
                            maxSeats: agencyData.maxSeats, 
                            logoUrl: agencyData.logoUrl || '' 
                        });
                    }

                } catch (error) {
                    console.error("Failed to load initial data", error);
                }
            }
            fetchInitialData();
        }
    }, [status, currentAgencyId, loadedForAgency, setClients, setRoutines, setDecisionLogs, setCases, setTasks, updateAgency]);

    return <>{children}</>;
}
