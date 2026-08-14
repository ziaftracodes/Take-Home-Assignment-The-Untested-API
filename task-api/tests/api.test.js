const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('API Routes', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('GET /tasks/stats', () => {
    it('should return stats', async () => {
      taskService.create({ title: 'Task 1', status: 'todo' });
      taskService.create({ title: 'Task 2', status: 'done' });
      
      const res = await request(app).get('/tasks/stats');
      expect(res.statusCode).toBe(200);
      expect(res.body.todo).toBe(1);
      expect(res.body.done).toBe(1);
    });
  });

  describe('GET /tasks', () => {
    it('should return all tasks', async () => {
      taskService.create({ title: 'Task 1' });
      const res = await request(app).get('/tasks');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it('should filter by status', async () => {
      taskService.create({ title: 'T1', status: 'todo' });
      taskService.create({ title: 'T2', status: 'done' });
      const res = await request(app).get('/tasks?status=todo');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('T1');
    });

    it('should paginate results', async () => {
      for (let i = 0; i < 5; i++) {
        taskService.create({ title: `T${i}` });
      }
      // Testing with fixed pagination logic
      const res = await request(app).get('/tasks?page=1&limit=2');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].title).toBe('T0');
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'New Task', priority: 'high' });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('New Task');
      expect(res.body.priority).toBe('high');
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: '' }); // empty title
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update a task', async () => {
      const task = taskService.create({ title: 'Task' });
      const res = await request(app)
        .put(`/tasks/${task.id}`)
        .send({ title: 'Updated Task' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Updated Task');
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .put('/tasks/none')
        .send({ title: 'Updated' });
      
      expect(res.statusCode).toBe(404);
    });

    it('should return 400 for invalid input', async () => {
      const task = taskService.create({ title: 'Task' });
      const res = await request(app)
        .put(`/tasks/${task.id}`)
        .send({ status: 'invalid_status' });
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete a task', async () => {
      const task = taskService.create({ title: 'Task' });
      const res = await request(app).delete(`/tasks/${task.id}`);
      
      expect(res.statusCode).toBe(204);
      expect(taskService.getAll().length).toBe(0);
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app).delete('/tasks/none');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    it('should complete a task', async () => {
      const task = taskService.create({ title: 'Task' });
      const res = await request(app).patch(`/tasks/${task.id}/complete`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('done');
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app).patch('/tasks/none/complete');
      expect(res.statusCode).toBe(404);
    });
  });
  
  describe('PATCH /tasks/:id/assign', () => {
    it('should assign a task', async () => {
      const task = taskService.create({ title: 'Task' });
      const res = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({ assignee: 'John Doe' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.assignee).toBe('John Doe');
    });

    it('should return 400 for invalid assignee', async () => {
      const task = taskService.create({ title: 'Task' });
      const res = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({ assignee: '' });
      
      expect(res.statusCode).toBe(400);
      
      const res2 = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({}); // missing assignee
      expect(res2.statusCode).toBe(400);
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .patch('/tasks/none/assign')
        .send({ assignee: 'John Doe' });
      
      expect(res.statusCode).toBe(404);
    });
  });
});
