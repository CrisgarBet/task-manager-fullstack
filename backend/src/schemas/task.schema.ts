import { z } from 'zod';
import { TASK_STATUSES } from '../models/task.model.js';

const descriptionSchema = z
  .union([z.string().trim().max(500, 'La descripción no puede superar 500 caracteres'), z.null()])
  .transform((value) => (value === '' ? null : value));

const titleSchema = z
  .string({ error: 'El título es obligatorio' })
  .trim()
  .min(1, 'El título es obligatorio')
  .max(100, 'El título no puede superar 100 caracteres');
const statusSchema = z.enum(TASK_STATUSES, { error: 'Selecciona un estado válido' });

export const createTaskSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema.optional().default(null),
    status: statusSchema,
  })
  .strict();
export const updateTaskSchema = z
  .object({ title: titleSchema, description: descriptionSchema, status: statusSchema })
  .strict();

export const taskFiltersSchema = z.object({
  status: z.enum(TASK_STATUSES, { error: 'El estado del filtro no es válido' }).optional(),
  search: z.string().trim().max(100, 'La búsqueda no puede superar 100 caracteres').optional(),
});
