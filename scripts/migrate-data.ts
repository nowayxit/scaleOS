import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config()

const OLD_URL = "postgresql://postgres:KNhKUYYaTwXKdrvPizObBEwGTvgFdJyK@interchange.proxy.rlwy.net:27501/railway"
const NEW_URL = "postgresql://neondb_owner:npg_PtRi73zUnJLb@ep-lucky-band-ac6eiywo-pooler.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"

const oldDb = new PrismaClient({ datasources: { db: { url: OLD_URL } } })
const newDb = new PrismaClient({ datasources: { db: { url: NEW_URL } } })

async function main() {
  console.log(`Starting data migration from Railway to Neon...`)
  
  // 1. Column and Tag (Independent)
  const columns = await oldDb.column.findMany()
  if (columns.length) { await newDb.column.createMany({ data: columns }); console.log(`Copied ${columns.length} columns`) }
  
  const tags = await oldDb.tag.findMany()
  if (tags.length) { await newDb.tag.createMany({ data: tags }); console.log(`Copied ${tags.length} tags`) }

  // 2. Agency
  const agencies = await oldDb.agency.findMany()
  if (agencies.length) { await newDb.agency.createMany({ data: agencies }); console.log(`Copied ${agencies.length} agencies`) }

  // 3. User
  const users = await oldDb.user.findMany()
  if (users.length) { await newDb.user.createMany({ data: users }); console.log(`Copied ${users.length} users`) }

  // 4. NextAuth (Account, Session, VerificationToken)
  const accounts = await oldDb.account.findMany()
  if (accounts.length) { await newDb.account.createMany({ data: accounts }); console.log(`Copied ${accounts.length} accounts`) }

  const sessions = await oldDb.session.findMany()
  if (sessions.length) { await newDb.session.createMany({ data: sessions }); console.log(`Copied ${sessions.length} sessions`) }

  const vTokens = await oldDb.verificationToken.findMany()
  if (vTokens.length) { await newDb.verificationToken.createMany({ data: vTokens }); console.log(`Copied ${vTokens.length} vTokens`) }

  // 5. WorkspaceMember
  const members = await oldDb.workspaceMember.findMany()
  if (members.length) { await newDb.workspaceMember.createMany({ data: members }); console.log(`Copied ${members.length} members`) }

  // 6. Client
  const clients = await oldDb.client.findMany()
  if (clients.length) { await newDb.client.createMany({ data: clients }); console.log(`Copied ${clients.length} clients`) }

  // 7. Client relations
  const decisionLogs = await oldDb.decisionLog.findMany()
  if (decisionLogs.length) { await newDb.decisionLog.createMany({ data: decisionLogs }); console.log(`Copied ${decisionLogs.length} decisionLogs`) }

  const creatives = await oldDb.creative.findMany()
  if (creatives.length) { await newDb.creative.createMany({ data: creatives }); console.log(`Copied ${creatives.length} creatives`) }

  const cases = await oldDb.clientCase.findMany()
  if (cases.length) { await newDb.clientCase.createMany({ data: cases }); console.log(`Copied ${cases.length} cases`) }

  const notes = await oldDb.meetingNote.findMany()
  if (notes.length) { await newDb.meetingNote.createMany({ data: notes }); console.log(`Copied ${notes.length} notes`) }

  const routines = await oldDb.routine.findMany()
  if (routines.length) { await newDb.routine.createMany({ data: routines }); console.log(`Copied ${routines.length} routines`) }

  const opts = await oldDb.optimizationSession.findMany()
  if (opts.length) { await newDb.optimizationSession.createMany({ data: opts }); console.log(`Copied ${opts.length} optimizationSessions`) }

  // 8. Task
  const tasks = await oldDb.task.findMany()
  if (tasks.length) { await newDb.task.createMany({ data: tasks }); console.log(`Copied ${tasks.length} tasks`) }

  // 9. Conversations
  const convs = await oldDb.conversation.findMany()
  if (convs.length) { await newDb.conversation.createMany({ data: convs }); console.log(`Copied ${convs.length} conversations`) }

  const convMembers = await oldDb.conversationMember.findMany()
  if (convMembers.length) { await newDb.conversationMember.createMany({ data: convMembers }); console.log(`Copied ${convMembers.length} conversationMembers`) }

  const messages = await oldDb.message.findMany()
  if (messages.length) { await newDb.message.createMany({ data: messages }); console.log(`Copied ${messages.length} messages`) }

  console.log("Migration finished successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await oldDb.$disconnect()
    await newDb.$disconnect()
  })
