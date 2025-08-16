-- CreateTable
CREATE TABLE "public"."Deck" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cardSetId" INTEGER NOT NULL,
    "gameCardDefinitionId" INTEGER NOT NULL,
    "cardDefinitionIds" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Deck_name_cardSetId_key" ON "public"."Deck"("name", "cardSetId");

-- AddForeignKey
ALTER TABLE "public"."Deck" ADD CONSTRAINT "Deck_cardSetId_fkey" FOREIGN KEY ("cardSetId") REFERENCES "public"."CardSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Deck" ADD CONSTRAINT "Deck_gameCardDefinitionId_fkey" FOREIGN KEY ("gameCardDefinitionId") REFERENCES "public"."GameCardDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
