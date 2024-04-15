/*
  Warnings:

  - You are about to drop the column `link` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `tag` on the `notes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notes" DROP COLUMN "link",
DROP COLUMN "tag",
ADD COLUMN     "links" TEXT[],
ADD COLUMN     "tags" TEXT[];
