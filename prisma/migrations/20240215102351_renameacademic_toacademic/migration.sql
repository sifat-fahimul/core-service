/*
  Warnings:

  - You are about to drop the column `academecSemeterId` on the `students` table. All the data in the column will be lost.
  - Added the required column `academicSemeterId` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_academecSemeterId_fkey";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "academecSemeterId",
ADD COLUMN     "academicSemeterId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_academicSemeterId_fkey" FOREIGN KEY ("academicSemeterId") REFERENCES "academic_semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
