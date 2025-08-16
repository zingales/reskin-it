/*
  Warnings:

  - You are about to drop the column `cardDefinitionTable` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Game" DROP COLUMN "cardDefinitionTable";

-- CreateTable
CREATE TABLE "public"."GameCardDefinition" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameCardDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameCardDefinition_gameId_name_key" ON "public"."GameCardDefinition"("gameId", "name");

-- AddForeignKey
ALTER TABLE "public"."GameCardDefinition" ADD CONSTRAINT "GameCardDefinition_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
