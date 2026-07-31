import { createDatabase } from './config/database.js';
import { TaskRepository } from './repositories/task.repository.js';
import { TaskService } from './services/task.service.js';

const database = createDatabase();
const service = new TaskService(new TaskRepository(database));
const samples = [
  {
    title: 'Definir alcance',
    description: 'Revisar requisitos de la prueba',
    status: 'done' as const,
  },
  {
    title: 'Implementar interfaz',
    description: 'Crear una experiencia responsive',
    status: 'in_progress' as const,
  },
  { title: 'Preparar presentación', description: null, status: 'pending' as const },
];

for (const sample of samples) service.createTask(sample);
database.close();
console.info(`${samples.length} tareas de ejemplo creadas.`);
