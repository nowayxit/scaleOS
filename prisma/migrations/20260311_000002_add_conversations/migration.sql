-- Migration: Add Conversation model and update Message schema
-- This migration transitions from the old Message-per-Agency model
-- to the new Conversation/ConversationMember/Message architecture.
-- Safe to run: Conversation data is new, old Message rows will be cleared
-- (no production data existed in the old chat feature before this migration).

-- Step 1: Create Conversation table
CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'direct',
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agencyId" TEXT NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create ConversationMember table
CREATE TABLE IF NOT EXISTS "ConversationMember" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationMember_pkey" PRIMARY KEY ("id")
);

-- Step 3: Unique index on ConversationMember
CREATE UNIQUE INDEX IF NOT EXISTS "ConversationMember_conversationId_userId_key"
    ON "ConversationMember"("conversationId", "userId");

-- Step 4: Foreign keys for Conversation
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Conversation_agencyId_fkey'
  ) THEN
    ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_agencyId_fkey"
      FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Step 5: Foreign keys for ConversationMember
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ConversationMember_conversationId_fkey'
  ) THEN
    ALTER TABLE "ConversationMember" ADD CONSTRAINT "ConversationMember_conversationId_fkey"
      FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ConversationMember_userId_fkey'
  ) THEN
    ALTER TABLE "ConversationMember" ADD CONSTRAINT "ConversationMember_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Step 6: Update Message table
-- Drop old Message rows and columns (agencyId), add conversationId
-- First: truncate old messages (no production data in this feature)
TRUNCATE TABLE "Message" CASCADE;

-- Drop old foreign key if exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Message_agencyId_fkey'
  ) THEN
    ALTER TABLE "Message" DROP CONSTRAINT "Message_agencyId_fkey";
  END IF;
END $$;

-- Drop old agencyId column if exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='Message' AND column_name='agencyId'
  ) THEN
    ALTER TABLE "Message" DROP COLUMN "agencyId";
  END IF;
END $$;

-- Add conversationId column if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='Message' AND column_name='conversationId'
  ) THEN
    ALTER TABLE "Message" ADD COLUMN "conversationId" TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

-- Remove the default after adding
ALTER TABLE "Message" ALTER COLUMN "conversationId" DROP DEFAULT;

-- Add foreign key for Message → Conversation
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Message_conversationId_fkey'
  ) THEN
    ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey"
      FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Step 7: Update User to add conversationMembers relation column (handled by ConversationMember FK above)
-- Step 8: Remove Message relation from Agency (it no longer has messages directly)
-- Nothing to ALTER here - the relation is now via Conversation
