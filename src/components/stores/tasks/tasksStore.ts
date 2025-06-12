import { defineStore } from "pinia";
import api from "@/axios";
import { useAuthStore } from "../auth/authStore";


export interface Task {
  taskId: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate: string;
  createdDate: string;
  userId: string;
}

export interface AddTaskPayload {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'todo' | 'in_progress' | 'done';
  dueDate: string;
}


export interface UpdateTaskPayload {
  taskId: string;
  title?: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'; 
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE'; 
  dueDate?: string;
}


export interface DeleteTaskPayload {
  taskId: string;
}


interface TaskStoreState {
  lastFetch: number | null;
  tasks: Task[];
}


export const useTaskStore = defineStore("tasks", {
  state: (): TaskStoreState => ({
    lastFetch: null,
    tasks: [],
  }),
  getters: {
    getAllTasks(state): Task[] {
      return state.tasks;
    },
    hasTasks(state): boolean {
      return state.tasks && state.tasks.length > 0;
    },
    taskById: (state) => (taskId: string): Task | undefined => {
      return state.tasks.find((task) => task.taskId === taskId);
    },
    shouldUpdate(state): boolean {
      if (!state.lastFetch) return true;
      const currentTimeStamp = new Date().getTime();
      return (currentTimeStamp - state.lastFetch) / 1000 > 30;
    },
  },

  actions: {
    setFetchTimestamp(): void {
      this.lastFetch = new Date().getTime();
    },

    resetFetchTimestamp(): void {
      this.lastFetch = null;
    },
    updateTasks(payload: Task[]): void {
      this.$patch({
        tasks: payload,
      });
    },

    async getTaskList({ forceRefresh = false }: { forceRefresh?: boolean } = {}): Promise<void> {
      if (!forceRefresh && !this.shouldUpdate) {
        return;
      }

      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      const ENDPOINT_URL = `/users/${userId}/tasks`;
      const authStore = useAuthStore();

      try {
        const response = await api.get<Task[]>(ENDPOINT_URL); 
        const responseData = response.data;
        this.$patch({
          tasks: responseData.map((taskData): Task => ({
            taskId: taskData.taskId,
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            status: taskData.status,
            dueDate: taskData.dueDate,
            createdDate: taskData.createdDate,
            userId: taskData.userId,
          })),
        });

        this.setFetchTimestamp();
      } catch (error: any) { // Tipizzazione dell'errore
        if (error.response?.status === 401) {
          authStore.logout();
        }
        if (error.response?.status === 404) {
          this.$patch({
            tasks: [],
          });
          this.setFetchTimestamp();
          return;
        }
        throw new Error(
          error.response?.data?.message ||
            error.message ||
            "Unexpected error occurred"
        );
      }
    },

    async addTask(payload: AddTaskPayload): Promise<Task> {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      const ENDPOINT_URL = `/users/${userId}/tasks`;
      const authStore = useAuthStore();
      const task = {
        ...payload,
        userId,
        status: payload.status.toUpperCase() as Task['status'], 
        priority: payload.priority.toUpperCase() as Task['priority'], 
      };
      try {
        console.log("Sending task:", task);
        const response = await api.post<Task>(ENDPOINT_URL, task, { 
          headers: { "Content-Type": "application/json" },
        });
        await this.getTaskList({ forceRefresh: true });
        return response.data;
      } catch (error: any) { // Tipizzazione dell'errore
        console.error("Error response:", error.response?.data);
        if (error.response?.status === 401) {
          authStore.logout();
        }
        throw new Error(
          error.response?.data?.message ||
            error.message ||
            "Couldn't create the task"
        );
      }
    },
    async deleteTask(payload: DeleteTaskPayload): Promise<void> {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      const ENDPOINT_URL = `/users/${userId}/tasks/${payload.taskId}`;
      const authStore = useAuthStore();

      try {
        console.log("Deleting task with ID:", payload.taskId);
        await api.delete(ENDPOINT_URL);
        await this.getTaskList({ forceRefresh: true });
      } catch (error: any) { // Tipizzazione dell'errore
        console.error("Delete error:", error.response?.data);
        if (error.response?.status === 401) {
          authStore.logout();
        } else if (error.response?.status === 404) {
          this.$patch({
            tasks: this.tasks.filter((task) => task.taskId !== payload.taskId),
          });
        }
        throw new Error(
          error.response?.data?.message ||
            error.message ||
            "Couldn't delete the task"
        );
      }
    },

    async updateTask(payload: UpdateTaskPayload): Promise<Task> {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      const taskId = payload.taskId;
      const ENDPOINT_URL = `/users/${userId}/tasks/${taskId}`;
      const authStore = useAuthStore();

      const task: Partial<Omit<Task, 'taskId' | 'userId' | 'createdDate'>> = { ...payload };
      delete (task as any).taskId; // Rimuove taskId se l'API PUT non lo richiede nel body
      delete (task as any).userId; // Rimuove userId se l'API PUT non lo richiede nel body

      if (task.status) {
        task.status = task.status.toUpperCase() as Task['status'];
      }
      if (task.priority) {
        task.priority = task.priority.toUpperCase() as Task['priority'];
      }

      try {
        const response = await api.put<Task>(ENDPOINT_URL, task, { // Tipizzazione della risposta
          headers: { "Content-Type": "application/json" },
        });
        await this.getTaskList({ forceRefresh: true });
        return response.data;
      } catch (error: any) { // Tipizzazione dell'errore
        if (error.response?.status === 401) {
          authStore.logout();
        }
        throw new Error(
          error.response?.data?.message ||
            error.message ||
            "Couldn't update the task"
        );
      }
    },
  },
});
