-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "published_at" TIMESTAMP(3),
ALTER COLUMN "created_at" SET DEFAULT now();
