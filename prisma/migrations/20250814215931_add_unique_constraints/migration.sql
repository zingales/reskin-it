/*
  Warnings:

  - A unique constraint covering the columns `[title,userId]` on the table `CardSet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token,tier,points]` on the table `TokenEngineCardDefinition` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CardSet_title_userId_key" ON "public"."CardSet"("title", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TokenEngineCardDefinition_token_tier_points_key" ON "public"."TokenEngineCardDefinition"("token", "tier", "points");
