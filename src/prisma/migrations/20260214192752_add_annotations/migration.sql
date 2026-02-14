-- CreateTable
CREATE TABLE "anotacoes" (
    "id" SERIAL NOT NULL,
    "world_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anotacoes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "anotacoes" ADD CONSTRAINT "anotacoes_world_id_fkey" FOREIGN KEY ("world_id") REFERENCES "worlds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
