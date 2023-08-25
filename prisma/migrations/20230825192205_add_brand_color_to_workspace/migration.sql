-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "accent_color" TEXT,
ADD COLUMN     "brand_color" TEXT,
ALTER COLUMN "created_at" SET DEFAULT now();
