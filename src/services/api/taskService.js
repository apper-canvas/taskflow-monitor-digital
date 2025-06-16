import taskData from '../mockData/tasks.json';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

class TaskService {
  constructor() {
    this.storageKey = 'taskflow_tasks';
    this.init();
  }

  init() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      localStorage.setItem(this.storageKey, JSON.stringify(taskData));
    }
  }

  getTasks() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  saveTasks(tasks) {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }

  async getAll() {
    await delay(200);
    return [...this.getTasks()];
  }

  async getById(id) {
    await delay(150);
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === id);
    return task ? { ...task } : null;
  }

  async create(taskData) {
    await delay(300);
    const tasks = this.getTasks();
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
      checklist: taskData.checklist || []
    };
    
    tasks.push(newTask);
    this.saveTasks(tasks);
    return { ...newTask };
  }

  async update(id, updates) {
    await delay(250);
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    // Handle checklist completion logic
    if (updates.checklist) {
      const allCompleted = updates.checklist.every(item => item.completed);
      if (allCompleted && updates.checklist.length > 0 && tasks[taskIndex].status !== 'completed') {
        updates.status = 'completed';
        updates.completedAt = new Date().toISOString();
      }
    }

    // Handle manual completion
    if (updates.status === 'completed' && !updates.completedAt) {
      updates.completedAt = new Date().toISOString();
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    this.saveTasks(tasks);
    return { ...tasks[taskIndex] };
  }

  async delete(id) {
    await delay(200);
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter(t => t.id !== id);
    this.saveTasks(filteredTasks);
    return true;
  }

  async getUpcoming() {
    await delay(200);
    const tasks = this.getTasks();
    const now = new Date();
    
    return tasks
      .filter(task => task.status === 'pending' && new Date(task.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  async getOverdue() {
    await delay(200);
    const tasks = this.getTasks();
    const now = new Date();
    
    return tasks
      .filter(task => task.status === 'pending' && new Date(task.dueDate) < now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  async getCompleted() {
    await delay(200);
    const tasks = this.getTasks();
    
    return tasks
      .filter(task => task.status === 'completed')
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  }

  async updateTaskStatuses() {
    const tasks = this.getTasks();
    const now = new Date();
    let updated = false;

    const updatedTasks = tasks.map(task => {
      if (task.status === 'pending' && new Date(task.dueDate) < now) {
        updated = true;
        return { ...task, status: 'overdue' };
      }
      return task;
    });

    if (updated) {
      this.saveTasks(updatedTasks);
    }

    return updated;
  }
}

export default new TaskService();