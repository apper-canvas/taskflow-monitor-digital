import { toast } from 'react-toastify';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

class TaskService {
  constructor() {
    this.tableName = 'task';
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
    await delay(200);
    try {
      if (!this.apperClient) this.initClient();
      
      const params = {
        Fields: ['Name', 'title', 'description', 'due_date', 'priority', 'status', 'created_at', 'completed_at', 'checklist', 'Tags', 'Owner'],
        orderBy: [
          {
            FieldName: 'created_at',
            SortType: 'DESC'
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
      return response.data?.map(task => ({
        id: task.Id,
        title: task.title,
        description: task.description,
        dueDate: task.due_date,
        priority: task.priority,
        status: task.status,
        createdAt: task.created_at,
        completedAt: task.completed_at,
        checklist: task.checklist ? JSON.parse(task.checklist) : [],
        tags: task.Tags ? task.Tags.split(',') : []
      })) || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
      return [];
    }
  }

  async getById(id) {
    await delay(150);
    try {
      if (!this.apperClient) this.initClient();
      
      const params = {
        fields: ['Name', 'title', 'description', 'due_date', 'priority', 'status', 'created_at', 'completed_at', 'checklist', 'Tags', 'Owner']
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      if (!response.data) {
        return null;
      }
      
      // Map database fields to UI expected format
      const task = response.data;
      return {
        id: task.Id,
        title: task.title,
        description: task.description,
        dueDate: task.due_date,
        priority: task.priority,
        status: task.status,
        createdAt: task.created_at,
        completedAt: task.completed_at,
        checklist: task.checklist ? JSON.parse(task.checklist) : [],
        tags: task.Tags ? task.Tags.split(',') : []
      };
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error);
      return null;
    }
  }

  async create(taskData) {
    await delay(300);
    try {
      if (!this.apperClient) this.initClient();
      
      // Handle checklist completion logic
      let status = 'pending';
      let completed_at = null;
      if (taskData.checklist && taskData.checklist.length > 0) {
        const allCompleted = taskData.checklist.every(item => item.completed);
        if (allCompleted) {
          status = 'completed';
          completed_at = new Date().toISOString();
        }
      }
      
      const params = {
        records: [
          {
            // Only include Updateable fields
            Name: taskData.title || '',
            title: taskData.title || '',
            description: taskData.description || '',
            due_date: taskData.dueDate,
            priority: taskData.priority || 'medium',
            status: status,
            created_at: new Date().toISOString(),
            completed_at: completed_at,
            checklist: taskData.checklist ? JSON.stringify(taskData.checklist) : '[]',
            Tags: taskData.tags ? taskData.tags.join(',') : ''
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
          const createdTask = successfulRecords[0].data;
          return {
            id: createdTask.Id,
            title: createdTask.title,
            description: createdTask.description,
            dueDate: createdTask.due_date,
            priority: createdTask.priority,
            status: createdTask.status,
            createdAt: createdTask.created_at,
            completedAt: createdTask.completed_at,
            checklist: createdTask.checklist ? JSON.parse(createdTask.checklist) : [],
            tags: createdTask.Tags ? createdTask.Tags.split(',') : []
          };
        }
      }
      
      throw new Error('Failed to create task');
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async update(id, updates) {
    await delay(250);
    try {
      if (!this.apperClient) this.initClient();
      
      // Handle checklist completion logic
      if (updates.checklist) {
        const allCompleted = updates.checklist.every(item => item.completed);
        if (allCompleted && updates.checklist.length > 0 && updates.status !== 'completed') {
          updates.status = 'completed';
          updates.completed_at = new Date().toISOString();
        }
      }

      // Handle manual completion
      if (updates.status === 'completed' && !updates.completed_at) {
        updates.completed_at = new Date().toISOString();
      }
      
      // Prepare update data with only Updateable fields
      const updateData = {
        Id: parseInt(id)
      };
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.completed_at !== undefined) updateData.completed_at = updates.completed_at;
      if (updates.checklist !== undefined) updateData.checklist = JSON.stringify(updates.checklist);
      if (updates.tags !== undefined) updateData.Tags = updates.tags.join(',');
      
      const params = {
        records: [updateData]
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
          const updatedTask = successfulUpdates[0].data;
          return {
            id: updatedTask.Id,
            title: updatedTask.title,
            description: updatedTask.description,
            dueDate: updatedTask.due_date,
            priority: updatedTask.priority,
            status: updatedTask.status,
            createdAt: updatedTask.created_at,
            completedAt: updatedTask.completed_at,
            checklist: updatedTask.checklist ? JSON.parse(updatedTask.checklist) : [],
            tags: updatedTask.Tags ? updatedTask.Tags.split(',') : []
          };
        }
      }
      
      throw new Error('Task not found');
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async delete(id) {
    await delay(200);
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
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async getUpcoming() {
    await delay(200);
    try {
      if (!this.apperClient) this.initClient();
      
      const now = new Date().toISOString();
      
      const params = {
        Fields: ['Name', 'title', 'description', 'due_date', 'priority', 'status', 'created_at', 'completed_at', 'checklist', 'Tags', 'Owner'],
        where: [
          {
            FieldName: 'status',
            Operator: 'ExactMatch',
            Values: ['pending']
          },
          {
            FieldName: 'due_date',
            Operator: 'GreaterThanOrEqualTo',
            Values: [now]
          }
        ],
        orderBy: [
          {
            FieldName: 'due_date',
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
      
      return response.data?.map(task => ({
        id: task.Id,
        title: task.title,
        description: task.description,
        dueDate: task.due_date,
        priority: task.priority,
        status: task.status,
        createdAt: task.created_at,
        completedAt: task.completed_at,
        checklist: task.checklist ? JSON.parse(task.checklist) : [],
        tags: task.Tags ? task.Tags.split(',') : []
      })) || [];
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error);
      toast.error('Failed to load upcoming tasks');
      return [];
    }
  }

  async getOverdue() {
    await delay(200);
    try {
      if (!this.apperClient) this.initClient();
      
      const now = new Date().toISOString();
      
      const params = {
        Fields: ['Name', 'title', 'description', 'due_date', 'priority', 'status', 'created_at', 'completed_at', 'checklist', 'Tags', 'Owner'],
        where: [
          {
            FieldName: 'status',
            Operator: 'ExactMatch',
            Values: ['pending']
          },
          {
            FieldName: 'due_date',
            Operator: 'LessThan',
            Values: [now]
          }
        ],
        orderBy: [
          {
            FieldName: 'due_date',
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
      
      return response.data?.map(task => ({
        id: task.Id,
        title: task.title,
        description: task.description,
        dueDate: task.due_date,
        priority: task.priority,
        status: task.status,
        createdAt: task.created_at,
        completedAt: task.completed_at,
        checklist: task.checklist ? JSON.parse(task.checklist) : [],
        tags: task.Tags ? task.Tags.split(',') : []
      })) || [];
    } catch (error) {
      console.error('Error fetching overdue tasks:', error);
      toast.error('Failed to load overdue tasks');
      return [];
    }
  }

  async getCompleted() {
    await delay(200);
    try {
      if (!this.apperClient) this.initClient();
      
      const params = {
        Fields: ['Name', 'title', 'description', 'due_date', 'priority', 'status', 'created_at', 'completed_at', 'checklist', 'Tags', 'Owner'],
        where: [
          {
            FieldName: 'status',
            Operator: 'ExactMatch',
            Values: ['completed']
          }
        ],
        orderBy: [
          {
            FieldName: 'completed_at',
            SortType: 'DESC'
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data?.map(task => ({
        id: task.Id,
        title: task.title,
        description: task.description,
        dueDate: task.due_date,
        priority: task.priority,
        status: task.status,
        createdAt: task.created_at,
        completedAt: task.completed_at,
        checklist: task.checklist ? JSON.parse(task.checklist) : [],
        tags: task.Tags ? task.Tags.split(',') : []
      })) || [];
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
      toast.error('Failed to load completed tasks');
      return [];
    }
  }

  async updateTaskStatuses() {
    // For database version, we rely on the backend to handle status updates
    // or implement this as a separate background job
    return false;
  }
}

export default new TaskService();