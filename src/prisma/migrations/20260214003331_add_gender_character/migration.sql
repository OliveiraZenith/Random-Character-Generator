/*
  Warnings:

  - You are about to drop the column `is_appearance_random` on the `characters` table. All the data in the column will be lost.
  - You are about to drop the column `is_name_random` on the `characters` table. All the data in the column will be lost.
  - You are about to drop the column `is_race_random` on the `characters` table. All the data in the column will be lost.
  - You are about to drop the column `is_story_random` on the `characters` table. All the data in the column will be lost.
  - Added the required column `gender` to the `characters` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- AlterTable
ALTER TABLE "characters" DROP COLUMN "is_appearance_random",
DROP COLUMN "is_name_random",
DROP COLUMN "is_race_random",
DROP COLUMN "is_story_random",
ADD COLUMN     "gender" "Gender" NOT NULL;

-- AlterTable
ALTER TABLE "random_data" ADD COLUMN     "gender" "Gender";
