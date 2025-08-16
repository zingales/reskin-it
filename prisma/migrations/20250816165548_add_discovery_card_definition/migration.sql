-- CreateTable
CREATE TABLE "public"."TokenEngineDiscoveryCardDefinition" (
    "id" SERIAL NOT NULL,
    "points" INTEGER NOT NULL,
    "cost" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenEngineDiscoveryCardDefinition_pkey" PRIMARY KEY ("id")
);
