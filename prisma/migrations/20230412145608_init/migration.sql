-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "slateValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
    "authorId" UUID NOT NULL,

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "texttospeech" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enteredText" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "creatorId" UUID NOT NULL,
    "voiceId" TEXT,
    "workspaceId" UUID NOT NULL,

    CONSTRAINT "texttospeech_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "texttospeech" ADD CONSTRAINT "texttospeech_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "texttospeech" ADD CONSTRAINT "texttospeech_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
