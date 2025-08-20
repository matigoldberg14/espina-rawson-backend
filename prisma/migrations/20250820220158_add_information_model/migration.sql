-- CreateEnum
CREATE TYPE "public"."InformationType" AS ENUM ('ARTICLE', 'VIDEO', 'IMAGE');

-- AlterTable
ALTER TABLE "public"."Auction" ADD COLUMN     "secondaryImage1" TEXT,
ADD COLUMN     "secondaryImage2" TEXT,
ADD COLUMN     "secondaryImage3" TEXT,
ADD COLUMN     "secondaryImage4" TEXT,
ADD COLUMN     "secondaryImage5" TEXT;

-- CreateTable
CREATE TABLE "public"."Information" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "public"."InformationType" NOT NULL,
    "url" TEXT,
    "thumbnail" TEXT,
    "author" TEXT NOT NULL,
    "publishDate" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[],
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Information_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Information_type_idx" ON "public"."Information"("type");

-- CreateIndex
CREATE INDEX "Information_category_idx" ON "public"."Information"("category");

-- CreateIndex
CREATE INDEX "Information_isActive_idx" ON "public"."Information"("isActive");
