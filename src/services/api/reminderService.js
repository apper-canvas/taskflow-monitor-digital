import { toast } from 'react-toastify';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

class ReminderService {
  constructor() {
    this.tableName = 'reminder';
    this.initClient();
  }

  initClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getAll() {
    await delay(150);
    try {
      if (!this.apperClient) this.initClient();
      
      const params = {
        Fields: ['Name', 'task_id', 'scheduled_for', 'type', 'sent', 'Tags', 'Owner'],
        orderBy: [
          {
            FieldName: 'scheduled_for',
            SortType: 'ASC'
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      // Map database fields to UI expected format
      return response.data?.map(reminder => ({
        id: reminder.Id,
        taskId: reminder.task_id,
        scheduledFor: reminder.scheduled_for,
        type: reminder.type,
        sent: reminder.sent
      })) || [];
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast.error('Failed to load reminders');
      return [];
    }
  }

  async getByTaskId(taskId) {
    await delay(100);
    try {
      if (!this.apperClient) this.initClient();
      
      const params = {
        Fields: ['Name', 'task_id', 'scheduled_for', 'type', 'sent', 'Tags', 'Owner'],
        where: [
          {
            FieldName: 'task_id',
            Operator: 'ExactMatch',
            Values: [parseInt(taskId)]
          }
        ],
        orderBy: [
          {
            FieldName: 'scheduled_for',
            SortType: 'ASC'
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data?.map(reminder => ({
        id: reminder.Id,
        taskId: reminder.task_id,
        scheduledFor: reminder.scheduled_for,
        type: reminder.type,
        sent: reminder.sent
      })) || [];
    } catch (error) {
      console.error('Error fetching reminders by task ID:', error);
      return [];
    }
  }

  async create(reminderData) {
    await delay(200);
    try {
      if (!this.apperClient) this.initClient();
      
      const params = {
        records: [
          {
            // Only include Updateable fields
            Name: `Reminder for Task ${reminderData.taskId}`,
            task_id: parseInt(reminderData.taskId),
            scheduled_for: reminderData.scheduledFor,
            type: reminderData.type,
            sent: false
          }
        ]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          const createdReminder = successfulRecords[0].data;
          return {
            id: createdReminder.Id,
            taskId: createdReminder.task_id,
            scheduledFor: createdReminder.scheduled_for,
            type: createdReminder.type,
            sent: createdReminder.sent
          };
        }
      }
      
      throw new Error('Failed to create reminder');
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }

  async createForTask(taskId, dueDate) {
    const dueDateTime = new Date(dueDate);
    const oneHourBefore = new Date(dueDateTime.getTime() - 60 * 60 * 1000);
    const thirtyMinsBefore = new Date(dueDateTime.getTime() - 30 * 60 * 1000);

    const reminders = [];

    // Create 1-hour reminder
    if (oneHourBefore > new Date()) {
      try {
        const hourReminder = await this.create({
          taskId,
          scheduledFor: oneHourBefore.toISOString(),
          type: '1hour'
        });
        reminders.push(hourReminder);
      } catch (error) {
        console.error('Error creating 1-hour reminder:', error);
      }
    }

    // Create 30-minute reminder
    if (thirtyMinsBefore > new Date()) {
      try {
        const thirtyReminder = await this.create({
          taskId,
          scheduledFor: thirtyMinsBefore.toISOString(),
          type: '30mins'
        });
        reminders.push(thirtyReminder);
      } catch (error) {
        console.error('Error creating 30-minute reminder:', error);
      }
    }

    return reminders;
  }

  async markAsSent(id) {
    await delay(100);
    try {
      if (!this.apperClient) this.initClient();
      
      const params = {
        records: [
          {
            Id: parseInt(id),
            sent: true
          }
        ]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          const updatedReminder = successfulUpdates[0].data;
          return {
            id: updatedReminder.Id,
            taskId: updatedReminder.task_id,
            scheduledFor: updatedReminder.scheduled_for,
            type: updatedReminder.type,
            sent: updatedReminder.sent
          };
        }
      }
      
      throw new Error('Reminder not found');
    } catch (error) {
      console.error('Error marking reminder as sent:', error);
      throw error;
    }
  }

  async delete(id) {
    await delay(100);
    try {
      if (!this.apperClient) this.initClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }

  async deleteByTaskId(taskId) {
    await delay(100);
    try {
      if (!this.apperClient) this.initClient();
      
      // First fetch all reminders for this task
      const reminders = await this.getByTaskId(taskId);
      
      if (reminders.length === 0) {
        return true;
      }
      
      // Delete all found reminders
      const reminderIds = reminders.map(r => parseInt(r.id));
      
      const params = {
        RecordIds: reminderIds
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length === reminderIds.length;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting reminders by task ID:', error);
      throw error;
    }
  }

  async getPendingReminders() {
    await delay(100);
    try {
      if (!this.apperClient) this.initClient();
      
      const now = new Date().toISOString();
      
      const params = {
        Fields: ['Name', 'task_id', 'scheduled_for', 'type', 'sent', 'Tags', 'Owner'],
        where: [
          {
            FieldName: 'sent',
            Operator: 'ExactMatch',
            Values: [false]
          },
          {
            FieldName: 'scheduled_for',
            Operator: 'LessThanOrEqualTo',
            Values: [now]
          }
        ],
        orderBy: [
          {
            FieldName: 'scheduled_for',
            SortType: 'ASC'
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data?.map(reminder => ({
        id: reminder.Id,
        taskId: reminder.task_id,
        scheduledFor: reminder.scheduled_for,
        type: reminder.type,
        sent: reminder.sent
      })) || [];
    } catch (error) {
      console.error('Error fetching pending reminders:', error);
      toast.error('Failed to load pending reminders');
      return [];
    }
  }
}

export default new ReminderService();