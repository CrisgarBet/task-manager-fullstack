import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp, type AppContext } from '../src/app.js';
import { createDatabase } from '../src/config/database.js';

describe('API de tareas', () => {
  let context: AppContext;

  beforeEach(() => {
    context = createApp(createDatabase(':memory:'));
  });

  afterEach(() => context.database.close());

  it('crea una tarea correctamente', async () => {
    const response = await request(context.app)
      .post('/api/tasks')
      .send({ title: '  Probar API  ', description: ' Lista ', status: 'pending' });
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: 'Probar API',
      description: 'Lista',
      status: 'pending',
    });
    expect(response.headers.location).toBe(`/api/tasks/${response.body.id}`);
  });

  it('convierte una descripción omitida en null', async () => {
    const response = await request(context.app)
      .post('/api/tasks')
      .send({ title: 'Sin descripción', status: 'pending' });
    expect(response.status).toBe(201);
    expect(response.body.description).toBeNull();
  });

  it('rechaza un título vacío', async () => {
    const response = await request(context.app)
      .post('/api/tasks')
      .send({ title: '   ', description: null, status: 'pending' });
    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toBe('title');
  });

  it('rechaza un estado inválido', async () => {
    const response = await request(context.app)
      .post('/api/tasks')
      .send({ title: 'Tarea', description: null, status: 'blocked' });
    expect(response.status).toBe(400);
  });

  it('rechaza títulos y descripciones que superan sus límites', async () => {
    const longTitle = await request(context.app)
      .post('/api/tasks')
      .send({ title: 'a'.repeat(101), description: null, status: 'pending' });
    const longDescription = await request(context.app)
      .post('/api/tasks')
      .send({ title: 'Tarea', description: 'a'.repeat(501), status: 'pending' });

    expect(longTitle.status).toBe(400);
    expect(longTitle.body.errors[0].message).toContain('100 caracteres');
    expect(longDescription.status).toBe(400);
    expect(longDescription.body.errors[0].message).toContain('500 caracteres');
  });

  it('rechaza campos administrados por el servidor con un mensaje en español', async () => {
    const response = await request(context.app)
      .post('/api/tasks')
      .send({ id: 'manual', title: 'Tarea', description: null, status: 'pending' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContainEqual({
      field: 'body',
      message: 'No se permiten campos adicionales',
    });
  });

  it('retorna 400 para JSON malformado sin exponer detalles internos', async () => {
    const response = await request(context.app)
      .post('/api/tasks')
      .set('Content-Type', 'application/json')
      .send('{"title":');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      statusCode: 400,
      message: 'El cuerpo de la solicitud contiene JSON inválido',
      path: '/api/tasks',
    });
    expect(response.body).not.toHaveProperty('stack');
  });

  it('retorna 404 para una tarea inexistente', async () => {
    expect((await request(context.app).get('/api/tasks/no-existe')).status).toBe(404);
  });

  it('actualiza una tarea', async () => {
    const created = await request(context.app)
      .post('/api/tasks')
      .send({ title: 'Inicial', description: null, status: 'pending' });
    const response = await request(context.app)
      .put(`/api/tasks/${created.body.id}`)
      .send({ title: 'Actualizada', description: 'Lista', status: 'done' });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ title: 'Actualizada', status: 'done' });
    expect(response.body.createdAt).toBe(created.body.createdAt);
  });

  it('elimina una tarea', async () => {
    const created = await request(context.app)
      .post('/api/tasks')
      .send({ title: 'Eliminar', description: null, status: 'pending' });
    expect((await request(context.app).delete(`/api/tasks/${created.body.id}`)).status).toBe(204);
    expect((await request(context.app).get(`/api/tasks/${created.body.id}`)).status).toBe(404);
  });

  it('busca por texto y filtra por estado', async () => {
    await request(context.app)
      .post('/api/tasks')
      .send({ title: 'ÓRGANO TÉCNICO', description: 'REVISIÓN ÁGIL', status: 'pending' });
    const response = await request(context.app)
      .get('/api/tasks')
      .query({ search: 'órgano', status: 'pending' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });
});
