import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const agency = await prisma.agency.findFirst();
        console.log("Found agency:", agency ? agency.id : "NO AGENCY");
        
        const c = await prisma.client.create({
            data: {
                name: 'Test Client',
                niche: 'Test',
                budget: 1000,
                currentSpend: 0,
                targetCpa: 0,
                currency: 'BRL',
                healthStatus: 'good',
                agencyId: agency.id,
                routines: {
                    create: [{ label: 'Test', platform: 'meta' }]
                }
            }
        });
        console.log('SUCCESS:', c.id);
    } catch(e) {
        console.error('ERROR OCURRED:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
