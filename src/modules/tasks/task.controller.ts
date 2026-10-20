import { Request, Response, NextFunction } from 'express';
import { TaskRepository } from './task.repository.js';
import { AppError } from '../../utils/app-error.js';

export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { status, limit, offset } = req.query;

    const tasks = await TaskRepository.findMany({
      userId,
      status: typeof status === 'string' ? status : undefined,
      limit: limit ? parseInt(limit as string, 10) : 10,
      offset: offset ? parseInt(offset as string, 10) : 0,
    });

    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const task = await TaskRepository.findById(id, userId);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { title, description } = req.body;

    if (!title || typeof title !== 'string') {
      throw new AppError('Title is required and must be a string', 400);
    }

    const newTask = await TaskRepository.create({ title, description, userId });

    res.status(201).json({
      status: 'success',
      data: newTask,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, description, status } = req.body;

    const updatedTask = await TaskRepository.update(id, userId, { title, description, status });

    if (!updatedTask) {
      throw new AppError('Task not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const deleted = await TaskRepository.delete(id, userId);

    if (!deleted) {
      throw new AppError('Task not found', 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};