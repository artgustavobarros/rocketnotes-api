/*
  Warnings:

  - You are about to drop the `links` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "links" DROP CONSTRAINT "links_note_id_fkey";

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_note_id_fkey";

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_user_id_fkey";

-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "link" TEXT[],
ADD COLUMN     "tag" TEXT[];

-- DropTable
DROP TABLE "links";

-- DropTable
DROP TABLE "tags";
