import { Router } from 'express';
import type { TaskController } from '../controllers/task.controller.js';

export const createTaskRouter = (controller: TaskController): Router => {
  const router = Router();
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);
  return router;
};
