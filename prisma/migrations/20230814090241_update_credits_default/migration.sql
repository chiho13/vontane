-- AlterTable
ALTER TABLE "user" ALTER COLUMN "credits" SET DEFAULT 3000;

-- AlterTable
ALTER TABLE "workspace" ALTER COLUMN "created_at" SET DEFAULT now();
