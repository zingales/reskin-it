/*
  Warnings:

  - You are about to drop the column `category` on the `CardSet` table. All the data in the column will be lost.
*/

-- CreateTable
CREATE TABLE "public"."Game" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "rules" TEXT NOT NULL,
    "cardDefinitionTable" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_name_key" ON "public"."Game"("name");

-- Insert default game for existing card sets
INSERT INTO "public"."Game" ("name", "summary", "rules", "cardDefinitionTable", "createdAt", "updatedAt") 
VALUES (
    'TokenEngine', 
    'A Engine Game where you use tokens to get resources which generate more tokens. Game with similar rules: Splendor',
    '# TokenEngine Rules\n\n## Overview\nTokenEngine is an engine-building game where players use tokens to acquire resources that generate more tokens.\n\n## Setup\n- Each player starts with 3 tokens of each color\n- Shuffle the card deck and deal 4 cards to each player\n\n## Gameplay\n1. On your turn, you may either:\n   - Take 3 tokens of different colors\n   - Take 2 tokens of the same color (if available)\n   - Purchase a card using your tokens\n\n2. When you purchase a card, place it in front of you\n3. Cards provide ongoing benefits and victory points\n\n## Victory\n- The game ends when a player reaches 15 victory points\n- The player with the most points wins!',
    'TokenEngineCardDefinition',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Add gameId column with default value
ALTER TABLE "public"."CardSet" ADD COLUMN "gameId" INTEGER NOT NULL DEFAULT 1;

-- Update the default value constraint
ALTER TABLE "public"."CardSet" ALTER COLUMN "gameId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "public"."CardSet" ADD CONSTRAINT "CardSet_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop the category column
ALTER TABLE "public"."CardSet" DROP COLUMN "category";
