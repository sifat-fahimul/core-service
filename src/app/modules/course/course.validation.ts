import { z } from 'zod';

const create = z.object({
  body: z.object({
    title: z.string({ required_error: 'title is required' }),
    code: z.string({ required_error: 'code is required' }),
    credits: z.number({ required_error: 'credits is required' }),
    preRequisiteCourses: z
      .array(
        z.object({
          courseId: z.string({ required_error: 'courseId is required' }),
        })
      )
      .optional(),
  }),
});

const update = z.object({
  body: z.object({
    title: z.string().optional(),
    code: z.string().optional(),
    credits: z.number().optional(),
    preRequisiteCourses: z
      .array(
        z.object({
          courseId: z.string({}),
          isDeleted: z.boolean({}).optional(),
        })
      )
      .optional(),
  }),
});

const assignOrRemoveFaculties = z.object({
  body: z.object({
    faculties: z.array(z.string(), {
      required_error: 'faculties are required',
    }),
  }),
});

export const CourseValidation = { create, update, assignOrRemoveFaculties };
