/*
  Warnings:

  - The `status` column on the `student_enrolled_courses` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "student_enrolled_courses" DROP COLUMN "status",
ADD COLUMN     "status" "StudentEnrolledCourseStatus" DEFAULT 'ONGOING';
