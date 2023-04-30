/*
  Warnings:

  - A unique constraint covering the columns `[lemonSqueezy_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "lemonSqueezy_id" TEXT;

-- AlterTable
ALTER TABLE "workspace" ALTER COLUMN "created_at" SET DEFAULT now();

-- CreateIndex
CREATE UNIQUE INDEX "user_lemonSqueezy_id_key" ON "user"("lemonSqueezy_id");
