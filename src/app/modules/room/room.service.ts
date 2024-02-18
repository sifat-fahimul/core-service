import { Prisma, Room } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { roomSearchableFields } from './room.constant';
import { IRoomFilterRequest } from './room.interface';

const insertIntoDB = async (data: Room): Promise<Room> => {
  const result = await prisma.room.create({
    data,
    include: { building: true },
  });
  return result;
};

const getAllFromDB = async (
  filters: IRoomFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Room[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm } = filters;
  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: roomSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  const whereConditions: Prisma.RoomWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const total = await prisma.room.count();
  const result = await prisma.room.findMany({
    skip,
    take: limit,
    where: whereConditions,
    include: { building: true },
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
  });
  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getSingleFromDB = async (id: string): Promise<Room | null> => {
  const result = await prisma.room.findUnique({ where: { id } });
  return result;
};

const updateIntoDB = async (
  id: string,
  payload: Partial<Room>
): Promise<Room> => {
  const result = await prisma.room.update({
    where: { id },
    data: payload,
    include: { building: true },
  });
  return result;
};

const deleteFromDB = async (id: string): Promise<Room> => {
  const result = await prisma.room.delete({
    where: { id },
    include: { building: true },
  });
  return result;
};

export const RoomService = {
  insertIntoDB,
  getAllFromDB,
  getSingleFromDB,
  updateIntoDB,
  deleteFromDB,
};
