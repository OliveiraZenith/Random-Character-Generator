-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('fantasia', 'medieval', 'atual');

-- CreateEnum
CREATE TYPE "RandomType" AS ENUM ('name', 'race', 'appearance', 'story');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worlds" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "theme" "Theme" NOT NULL,
    "country" VARCHAR(191),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worlds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" SERIAL NOT NULL,
    "world_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "appearance" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "age" INTEGER,
    "is_name_random" BOOLEAN NOT NULL DEFAULT false,
    "is_race_random" BOOLEAN NOT NULL DEFAULT false,
    "is_appearance_random" BOOLEAN NOT NULL DEFAULT false,
    "is_story_random" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "random_data" (
    "id" SERIAL NOT NULL,
    "theme" "Theme" NOT NULL,
    "country" VARCHAR(191),
    "type" "RandomType" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "random_data_pkey" PRIMARY KEY ("id")
);

INSERT INTO random_data (theme, country, type, value) VALUES
  ('medieval', NULL, 'name', 'Sir Athelred'),
  ('medieval', NULL, 'race', 'Humano'),
  ('medieval', NULL, 'appearance', 'Armadura de placas e manto azul'),
  ('medieval', NULL, 'story', 'Cavaleiro que jurou proteger o reino');

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "worlds" ADD CONSTRAINT "worlds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_world_id_fkey" FOREIGN KEY ("world_id") REFERENCES "worlds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
