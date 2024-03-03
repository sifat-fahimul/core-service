import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SemesterRegisterController } from './semesterRegistration.controller';
import { SemesterRegistrationValidation } from './semesterRegistration.validation';

const router = express.Router();
router.get('/', SemesterRegisterController.getAllFromDB);
router.get('/:id', SemesterRegisterController.getSingleFromDB);

router.post(
  '/start-registration',
  auth(ENUM_USER_ROLE.STUDENT),
  SemesterRegisterController.startMyRegistration
);

router.post(
  '/',
  validateRequest(SemesterRegistrationValidation.create),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  SemesterRegisterController.insertIntoDB
);

router.patch(
  '/:id',
  validateRequest(SemesterRegistrationValidation.update),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  SemesterRegisterController.updateIntoDB
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  SemesterRegisterController.deleteFromDB
);

router.post(
  '/enroll-into-course',
  auth(ENUM_USER_ROLE.STUDENT),
  SemesterRegisterController.enrollIntoCourse
);
router.post(
  '/withdraw-from-course',
  auth(ENUM_USER_ROLE.STUDENT),
  SemesterRegisterController.withdrewFromCourse
);

export const SemesterRegistrationRoute = router;
