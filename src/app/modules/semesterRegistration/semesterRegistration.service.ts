import {
  Prisma,
  SemesterRegistration,
  SemesterRegistrationStatus,
  studentSemesterRegistration,
} from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import {
  semesterRegistrationFilterableFields,
  semesterRegistrationRelationalFieldsMapper,
} from './semesterRegistration.constant';
import {
  IEnrollCoursePayload,
  ISemesterRegistrationFilterRequest,
} from './semesterRegistration.interface';

const insertIntoDB = async (
  data: SemesterRegistration
): Promise<SemesterRegistration> => {
  const isAnySemesterRegistrationUpcomingOrOngoing =
    await prisma.semesterRegistration.findFirst({
      where: {
        OR: [
          { status: SemesterRegistrationStatus.UPCOMING },
          { status: SemesterRegistrationStatus.ONGOING },
        ],
      },
      include: {
        academicSemesters: true,
      },
    });
  if (isAnySemesterRegistrationUpcomingOrOngoing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `There is already an ${isAnySemesterRegistrationUpcomingOrOngoing.status} registration`
    );
  }
  const result = await prisma.semesterRegistration.create({ data });
  return result;
};

const getAllFromDB = async (
  filters: ISemesterRegistrationFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<SemesterRegistration[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: semesterRegistrationFilterableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => {
        if (semesterRegistrationFilterableFields.includes(key)) {
          return {
            [semesterRegistrationRelationalFieldsMapper[key]]: {
              id: (filterData as any)[key],
            },
          };
        } else {
          return {
            [key]: {
              equals: (filterData as any)[key],
            },
          };
        }
      }),
    });
  }

  const whereConditions: Prisma.SemesterRegistrationWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.semesterRegistration.findMany({
    include: {
      academicSemesters: true,
    },
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: 'desc' },
  });
  const total = await prisma.semesterRegistration.count({
    where: whereConditions,
  });
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getSingleFromDB = async (
  id: string
): Promise<SemesterRegistration | null> => {
  const result = await prisma.semesterRegistration.findUnique({
    where: {
      id,
    },
    include: {
      academicSemesters: true,
    },
  });
  return result;
};

const updateIntoDB = async (
  id: string,
  payload: Partial<SemesterRegistration>
): Promise<SemesterRegistration> => {
  const isExist = await prisma.semesterRegistration.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Data not found!');
  }

  if (
    payload.status &&
    isExist.status === SemesterRegistrationStatus.UPCOMING &&
    payload.status !== SemesterRegistrationStatus.ONGOING
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Can only move from UPCOMING to ONGOING'
    );
  }

  if (
    payload.status &&
    isExist.status === SemesterRegistrationStatus.ONGOING &&
    payload.status !== SemesterRegistrationStatus.ENDED
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Can only move from ONGOING to ENDED'
    );
  }

  const result = await prisma.semesterRegistration.update({
    where: {
      id,
    },
    data: payload,
    include: {
      academicSemesters: true,
    },
  });

  return result;
};

const deleteFromDB = async (id: string): Promise<SemesterRegistration> => {
  const result = await prisma.semesterRegistration.delete({
    where: {
      id,
    },
    include: {
      academicSemesters: true,
    },
  });
  return result;
};

const startMyRegistration = async (
  authUserId: string
): Promise<{
  semesterRegistration: SemesterRegistration | null;
  studentSemesterRegistration: studentSemesterRegistration | null;
}> => {
  const studentInfo = await prisma.student.findFirst({
    where: { studentId: authUserId },
  });
  if (!studentInfo) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Student Info not found!');
  }

  const semesterRegistrationInfo = await prisma.semesterRegistration.findFirst({
    where: {
      status: {
        in: [
          SemesterRegistrationStatus.ONGOING,
          SemesterRegistrationStatus.UPCOMING,
        ],
      },
    },
  });
  if (
    semesterRegistrationInfo?.status === SemesterRegistrationStatus.UPCOMING
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Registration is not started yet!'
    );
  }
  let studentRegistration = await prisma.studentSemesterRegistration.findFirst({
    where: {
      student: { id: studentInfo?.id },
      semesterRegistration: { id: semesterRegistrationInfo?.id },
    },
  });

  if (!studentRegistration) {
    studentRegistration = await prisma.studentSemesterRegistration.create({
      data: {
        student: {
          connect: {
            id: studentInfo?.id,
          },
        },
        semesterRegistration: {
          connect: {
            id: semesterRegistrationInfo?.id,
          },
        },
      },
    });
  }

  return {
    semesterRegistration: semesterRegistrationInfo,
    studentSemesterRegistration: studentRegistration,
  };
};

const enrollIntoCourse = async (
  authUserId: string,
  payload: IEnrollCoursePayload
) => {
  const student = await prisma.student.findFirst({
    where: { studentId: authUserId },
  });
  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: { status: SemesterRegistrationStatus.ONGOING },
  });

  const offeredCourse = await prisma.offeredCourse.findFirst({
    where: { id: payload.offeredCourseId },
    include: { course: true },
  });

  const offeredCourseSection = await prisma.offeredCourseSection.findFirst({
    where: { id: payload.offeredCourseSectionId },
  });

  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found!');
  }
  if (!semesterRegistration) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'semester registration not found!'
    );
  }
  if (!offeredCourse) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Offered Course not found!');
  }
  if (!offeredCourseSection) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Offered Course Section not found!'
    );
  }

  if (
    offeredCourseSection.maxCapacity &&
    offeredCourseSection.currentlyEnrolledStudent &&
    offeredCourseSection.currentlyEnrolledStudent >=
      offeredCourseSection.maxCapacity
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Student Capacity is full!');
  }

  await prisma.$transaction(async transactionClient => {
    await transactionClient.studentSemesterRegistrationCourse.create({
      data: {
        studentId: student?.id,
        semesterRegistrationId: semesterRegistration?.id,
        offeredCourseId: payload.offeredCourseId,
        offeredCourseSectionId: payload.offeredCourseSectionId,
      },
    });
    await transactionClient.offeredCourseSection.update({
      where: {
        id: payload.offeredCourseSectionId,
      },
      data: { currentlyEnrolledStudent: { increment: 1 } },
    });
    await transactionClient.studentSemesterRegistration.updateMany({
      where: {
        student: { id: student.id },
        semesterRegistration: { id: semesterRegistration.id },
      },
      data: { totalCreditsTaken: { increment: offeredCourse.course.credits } },
    });
  });

  return { message: 'Successfully enrolled into course' };
};

const withdrewFromCourse = async (
  authUserId: string,
  payload: IEnrollCoursePayload
) => {
  const student = await prisma.student.findFirst({
    where: { studentId: authUserId },
  });
  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: { status: SemesterRegistrationStatus.ONGOING },
  });

  const offeredCourse = await prisma.offeredCourse.findFirst({
    where: { id: payload.offeredCourseId },
    include: { course: true },
  });

  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found!');
  }
  if (!semesterRegistration) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'semester registration not found!'
    );
  }
  if (!offeredCourse) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Offered Course not found!');
  }

  await prisma.$transaction(async transactionClient => {
    await transactionClient.studentSemesterRegistrationCourse.delete({
      where: {
        semesterRegistrationId_studentId_offeredCourseId: {
          semesterRegistrationId: semesterRegistration?.id,
          studentId: student?.id,
          offeredCourseId: payload.offeredCourseId,
        },
      },
    });
    await transactionClient.offeredCourseSection.update({
      where: {
        id: payload.offeredCourseSectionId,
      },
      data: { currentlyEnrolledStudent: { decrement: 1 } },
    });
    await transactionClient.studentSemesterRegistration.updateMany({
      where: {
        student: { id: student.id },
        semesterRegistration: { id: semesterRegistration.id },
      },
      data: { totalCreditsTaken: { decrement: offeredCourse.course.credits } },
    });
  });

  return { message: 'Successfully withdraw from course' };
};
export const SemesterRegistrationService = {
  insertIntoDB,
  getAllFromDB,
  getSingleFromDB,
  updateIntoDB,
  deleteFromDB,
  startMyRegistration,
  enrollIntoCourse,
  withdrewFromCourse,
};
