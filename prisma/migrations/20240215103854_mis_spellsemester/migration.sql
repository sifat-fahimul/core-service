/*
  Warnings:

  - You are about to drop the column `academicSemeterId` on the `faculties` table. All the data in the column will be lost.
  - You are about to drop the column `academicSemeterId` on the `students` table. All the data in the column will be lost.
  - Added the required column `academicSemesterId` to the `faculties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `academicSemesterId` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "faculties" DROP CONSTRAINT "faculties_academicSemeterId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_academicSemeterId_fkey";

-- AlterTable
ALTER TABLE "faculties" DROP COLUMN "academicSemeterId",
ADD COLUMN     "academicSemesterId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "academicSemeterId",
ADD COLUMN     "academicSemesterId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_academicSemesterId_fkey" FOREIGN KEY ("academicSemesterId") REFERENCES "academic_semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_academicSemesterId_fkey" FOREIGN KEY ("academicSemesterId") REFERENCES "academic_semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
