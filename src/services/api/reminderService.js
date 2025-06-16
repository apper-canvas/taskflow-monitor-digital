import reminderData from '../mockData/reminders.json';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

class ReminderService {
  constructor() {
    this.storageKey = 'taskflow_reminders';
    this.init();
  }

  init() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      localStorage.setItem(this.storageKey, JSON.stringify(reminderData));
    }
  }

  getReminders() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  saveReminders(reminders) {
    localStorage.setItem(this.storageKey, JSON.stringify(reminders));
  }

  async getAll() {
    await delay(150);
    return [...this.getReminders()];
  }

  async getByTaskId(taskId) {
    await delay(100);
    const reminders = this.getReminders();
    return reminders.filter(r => r.taskId === taskId);
  }

  async create(reminderData) {
    await delay(200);
    const reminders = this.getReminders();
    const newReminder = {
      id: Date.now().toString(),
      ...reminderData,
      sent: false
    };
    
    reminders.push(newReminder);
    this.saveReminders(reminders);
    return { ...newReminder };
  }

  async createForTask(taskId, dueDate) {
    const dueDateTime = new Date(dueDate);
    const oneHourBefore = new Date(dueDateTime.getTime() - 60 * 60 * 1000);
    const thirtyMinsBefore = new Date(dueDateTime.getTime() - 30 * 60 * 1000);

    const reminders = [];

    // Create 1-hour reminder
    if (oneHourBefore > new Date()) {
      const hourReminder = await this.create({
        taskId,
        scheduledFor: oneHourBefore.toISOString(),
        type: '1hour'
      });
      reminders.push(hourReminder);
    }

    // Create 30-minute reminder
    if (thirtyMinsBefore > new Date()) {
      const thirtyReminder = await this.create({
        taskId,
        scheduledFor: thirtyMinsBefore.toISOString(),
        type: '30mins'
      });
      reminders.push(thirtyReminder);
    }

    return reminders;
  }

  async markAsSent(id) {
    await delay(100);
    const reminders = this.getReminders();
    const reminderIndex = reminders.findIndex(r => r.id === id);
    
    if (reminderIndex !== -1) {
      reminders[reminderIndex].sent = true;
      this.saveReminders(reminders);
      return { ...reminders[reminderIndex] };
    }
    
    throw new Error('Reminder not found');
  }

  async delete(id) {
    await delay(100);
    const reminders = this.getReminders();
    const filteredReminders = reminders.filter(r => r.id !== id);
    this.saveReminders(filteredReminders);
    return true;
  }

  async deleteByTaskId(taskId) {
    await delay(100);
    const reminders = this.getReminders();
    const filteredReminders = reminders.filter(r => r.taskId !== taskId);
    this.saveReminders(filteredReminders);
    return true;
  }

  async getPendingReminders() {
    await delay(100);
    const reminders = this.getReminders();
    const now = new Date();
    
    return reminders.filter(r => 
      !r.sent && new Date(r.scheduledFor) <= now
    );
  }
}

export default new ReminderService();