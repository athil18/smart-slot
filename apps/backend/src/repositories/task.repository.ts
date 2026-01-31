import type { Task, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export interface ListTasksOptions {
  userId: string;
  page: number;
  limit: number;
  status?: string;
  search?: string;
  sortBy: 'createdAt' | 'title' | 'status';
  order: 'asc' | 'desc';
}

export interface PaginatedTasks {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class TaskRepository {
  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    return prisma.task.create({ data });
  }

  async findById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<Task[]> {
    return prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findManyWithPagination(options: ListTasksOptions): Promise<PaginatedTasks> {
    const { userId, page, limit, status, search, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {
      userId,
      ...(status !== undefined && { status }),
      ...(search !== undefined && {
        title: { contains: search },
      }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    return prisma.task.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Task> {
    return prisma.task.delete({ where: { id } });
  }

  async softDelete(id: string): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findByIdActive(id: string): Promise<Task | null> {
    return prisma.task.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async isOwner(taskId: string, userId: string): Promise<boolean> {
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId, deletedAt: null },
    });
    return task !== null;
  }
}

export const taskRepository = new TaskRepository();
