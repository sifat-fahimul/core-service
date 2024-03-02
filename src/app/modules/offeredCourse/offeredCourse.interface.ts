export type ICreateOfferedCourse = {
  semesterRegistrationId: string;
  academicDepartmentId: string;
  courseIds: string[];
};

export type IOfferedCourseFilterRequest = {
  searchTerm?: string | undefined;
  semesterRegistrationId?: string | undefined;
  courseId?: string | undefined;
  academicDepartmentId?: string | undefined;
};
