/*
  Warnings:

  - You are about to drop the column `academicSemeterId` on the `students` table. All the data in the column will be lost.
  - Added the required column `academecSemeterId` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_academicSemeterId_fkey";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "academicSemeterId",
ADD COLUMN     "academecSemeterId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_academecSemeterId_fkey" FOREIGN KEY ("academecSemeterId") REFERENCES "academic_semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
