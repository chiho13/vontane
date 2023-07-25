-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ALTER COLUMN "created_at" SET DEFAULT now();
