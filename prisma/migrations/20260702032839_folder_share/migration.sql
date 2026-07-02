/*
  Warnings:

  - You are about to drop the column `fileId` on the `Share` table. All the data in the column will be lost.
  - Added the required column `folderId` to the `Share` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Share" DROP CONSTRAINT "Share_fileId_fkey";

-- AlterTable
ALTER TABLE "Share" DROP COLUMN "fileId",
ADD COLUMN     "folderId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
