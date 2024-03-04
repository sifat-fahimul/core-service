import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { StudentEnrolledCourseMarkController } from './studentEnrolledCourseMarks.controller';

const router = express.Router();
router.get(
  '/my-marks',
  auth(ENUM_USER_ROLE.STUDENT),
  StudentEnrolledCourseMarkController.getMyCourseMarks
);

router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.FACULTY),
  StudentEnrolledCourseMarkController.getAllFromDB
);

router.patch(
  '/update-marks',
  StudentEnrolledCourseMarkController.updateStudentMarks
);
router.patch(
  '/update-final-marks',
  StudentEnrolledCourseMarkController.updateFinalMarks
);

export const studentEnrolledCourseMarkRoutes = router;
