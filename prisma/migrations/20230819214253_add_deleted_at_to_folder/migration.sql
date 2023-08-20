-- AlterTable
ALTER TABLE "folder" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "workspace" ALTER COLUMN "created_at" SET DEFAULT now();
