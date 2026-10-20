import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from './task.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  getTasksQuerySchema,
} from './task.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(getTasksQuerySchema), getTasks);
router.post('/', validate(createTaskSchema), createTask);
router.get('/:id', validate(taskIdSchema), getTaskById);
router.patch('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', validate(taskIdSchema), deleteTask);

export default router;