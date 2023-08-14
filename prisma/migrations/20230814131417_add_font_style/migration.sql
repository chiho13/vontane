-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "font_style" TEXT NOT NULL DEFAULT 'font-sans',
ALTER COLUMN "created_at" SET DEFAULT now();
