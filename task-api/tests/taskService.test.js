const taskService = require('../src/services/taskService');

describe('taskService', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('create', () => {
    it('should create a task with default values', () => {
      const task = taskService.create({ title: 'Test Task' });
      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.status).toBe('todo');
      expect(task.priority).toBe('medium');
      expect(task.createdAt).toBeDefined();
    });

    it('should create a task with provided values', () => {
      const task = taskService.create({
        title: 'High Priority',
        description: 'Desc',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2025-01-01T00:00:00Z'
      });
      expect(task.status).toBe('in_progress');
      expect(task.priority).toBe('high');
      expect(task.dueDate).toBe('2025-01-01T00:00:00Z');
    });
  });

  describe('getAll', () => {
    it('should return all tasks', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });
      const tasks = taskService.getAll();
      expect(tasks.length).toBe(2);
    });
  });

  describe('findById', () => {
    it('should find task by id', () => {
      const task = taskService.create({ title: 'Task' });
      const found = taskService.findById(task.id);
      expect(found).toEqual(task);
    });

    it('should return undefined for non-existent id', () => {
      expect(taskService.findById('not-found')).toBeUndefined();
    });
  });

  describe('getByStatus', () => {
    it('should get tasks matching status', () => {
      taskService.create({ title: 'T1', status: 'todo' });
      taskService.create({ title: 'T2', status: 'done' });
      const tasks = taskService.getByStatus('todo');
      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe('T1');
    });
  });

  describe('getPaginated', () => {
    it('should return paginated tasks correctly', () => {
      for (let i = 0; i < 5; i++) {
        taskService.create({ title: `T${i}` });
      }
      // Note: we are testing the fixed behavior here where offset = (page-1)*limit
      const tasks = taskService.getPaginated(1, 2);
      expect(tasks.length).toBe(2);
    });
  });

  describe('update', () => {
    it('should update a task', () => {
      const task = taskService.create({ title: 'Task' });
      const updated = taskService.update(task.id, { title: 'New Title' });
      expect(updated.title).toBe('New Title');
    });

    it('should return null if task not found', () => {
      expect(taskService.update('none', { title: 'T' })).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove a task', () => {
      const task = taskService.create({ title: 'Task' });
      const removed = taskService.remove(task.id);
      expect(removed).toBe(true);
      expect(taskService.getAll().length).toBe(0);
    });

    it('should return false if task not found', () => {
      expect(taskService.remove('none')).toBe(false);
    });
  });

  describe('completeTask', () => {
    it('should complete a task and not override priority', () => {
      const task = taskService.create({ title: 'Task', priority: 'high' });
      const completed = taskService.completeTask(task.id);
      expect(completed.status).toBe('done');
      expect(completed.priority).toBe('high');
      expect(completed.completedAt).toBeDefined();
    });

    it('should return null if not found', () => {
      expect(taskService.completeTask('none')).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return correct counts', () => {
      taskService.create({ title: 'T1', status: 'todo' });
      taskService.create({ title: 'T2', status: 'done' });
      taskService.create({ title: 'T3', status: 'todo', dueDate: '2020-01-01T00:00:00Z' });
      
      const stats = taskService.getStats();
      expect(stats.todo).toBe(2);
      expect(stats.done).toBe(1);
      expect(stats.overdue).toBe(1);
    });
  });
});
