/*
  Warnings:

  - You are about to drop the column `academicSemesterId` on the `faculties` table. All the data in the column will be lost.
  - Added the required column `academicFacultyId` to the `faculties` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "faculties" DROP CONSTRAINT "faculties_academicSemesterId_fkey";

-- AlterTable
ALTER TABLE "faculties" DROP COLUMN "academicSemesterId",
ADD COLUMN     "academicFacultyId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_academicFacultyId_fkey" FOREIGN KEY ("academicFacultyId") REFERENCES "academic_faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
