import express from 'express';
import { AcademicDepartmentRouter } from '../modules/academicDepartment/academicDepartment.route';
import { AcademicFacultyRoute } from '../modules/academicFaculty/academicFaculty.route';
import { AcademicSemesterRoute } from '../modules/academicSemester/academicSemester.route';
import { BuildingRoute } from '../modules/building/building.route';
import { CourseRoute } from '../modules/course/course.route';
import { FacultyRoute } from '../modules/faculty/faculty.route';
import { RoomRoute } from '../modules/room/room.route';
import { StudentRoute } from '../modules/student/student.route';

const router = express.Router();

const moduleRoutes = [
  // ... routes
  {
    path: '/academic-semester',
    route: AcademicSemesterRoute,
  },
  {
    path: '/academic-faculty',
    route: AcademicFacultyRoute,
  },
  {
    path: '/academic-department',
    route: AcademicDepartmentRouter,
  },
  {
    path: '/student',
    route: StudentRoute,
  },
  {
    path: '/faculty',
    route: FacultyRoute,
  },
  {
    path: '/building',
    route: BuildingRoute,
  },
  {
    path: '/room',
    route: RoomRoute,
  },
  {
    path: '/course',
    route: CourseRoute,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
