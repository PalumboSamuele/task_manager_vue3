import { defineStore } from "pinia";
import api from "@/axios";

export interface Task {
  taskId: string;
  title: string;
  description: string;
  priority: "" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "" | "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string;
  createdDate: string;
  userId: string;
}

export interface AddTaskPayload {
  title: string;
  description: string;
  priority: "" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "" | "pending" | "in_progress" | "completed";
  dueDate: string;
}

export interface UpdateTaskPayload {
  taskId: string;
  title: string;
  description?: string;
  priority: "" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "" | "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string;
}

export interface DeleteTaskPayload {
  taskId: string;
}

interface TaskStoreState {
  lastFetch: number | null;
  tasks: Task[];
  isLoading: boolean;
  visualizationMode: "grid" | "data-table";
}

export const useTaskStore = defineStore("tasks", {
  state: (): TaskStoreState => ({
    lastFetch: null,
    tasks: [],
    isLoading: false,
    visualizationMode: "grid",
  }),
  getters: {
    getAllTasks(state): Task[] {
      return state.tasks;
    },
    hasTasks(state): boolean {
      return state.tasks && state.tasks.length > 0;
    },
    taskById:
      (state) =>
      (taskId: string): Task | undefined => {
        return state.tasks.find((task) => task.taskId === taskId);
      },
    shouldUpdate(state): boolean {
      if (!state.lastFetch) return true;
      const currentTimeStamp = new Date().getTime();
      return (currentTimeStamp - state.lastFetch) / 1000 > 30;
    },
    getVisualizationMode(state): string {
      return state.visualizationMode;
    },
  },
  actions: {
    setLoading(status: boolean) {
      this.isLoading = status;
    },
    setFetchTimestamp(): void {
      this.lastFetch = new Date().getTime();
    },
    resetFetchTimestamp(): void {
      this.lastFetch = null;
    },
    setVisualizationMode(mode: "grid" | "data-table") {
      this.visualizationMode = mode;
    },
    updateTasks(payload: Task[]): void {
      this.$patch({
        tasks: payload,
      });
    },
    async getTaskList({
      forceRefresh = false,
    }: { forceRefresh?: boolean } = {}): Promise<void> {
      if (!forceRefresh && !this.shouldUpdate) {
        return;
      }

      this.setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) {
        this.setLoading(false);
        throw new Error("User ID not found");
      }

      const ENDPOINT_URL = `/users/${userId}/tasks`;

      try {
        const response = await api.get<Task[]>(ENDPOINT_URL);
        const responseData = response.data;
        this.$patch({
          tasks: responseData.map(
            (taskData): Task => ({
              taskId: taskData.taskId,
              title: taskData.title,
              description: taskData.description,
              priority: taskData.priority,
              status: taskData.status,
              dueDate: taskData.dueDate,
              createdDate: taskData.createdDate,
              userId: taskData.userId,
            })
          ),
        });

        this.setFetchTimestamp();
      } catch (error: any) {
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
      } finally {
        this.setLoading(false);
      }
    },
    async addTask(payload: AddTaskPayload): Promise<Task> {
      this.setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) {
        this.setLoading(false);
        throw new Error("User ID not found");
      }

      const ENDPOINT_URL = `/users/${userId}/tasks`;

      const task = {
        ...payload,
        userId,
        status: payload.status.toUpperCase() as Task["status"],
        priority: payload.priority.toUpperCase() as Task["priority"],
      };
      try {
        const response = await api.post<Task>(ENDPOINT_URL, task, {
          headers: { "Content-Type": "application/json" },
        });
        await this.getTaskList({ forceRefresh: true });
        return response.data;
      } catch (error: any) {
        console.error("Error response:", error.response?.data);
        throw new Error(
          error.response?.data?.message ||
            error.message ||
            "Couldn't create the task"
        );
      } finally {
        this.setLoading(false); // Always reset loading
      }
    },
    async deleteTask(payload: DeleteTaskPayload): Promise<void> {
      this.setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) {
        this.setLoading(false);
        throw new Error("User ID not found");
      }

      const ENDPOINT_URL = `/users/${userId}/tasks/${payload.taskId}`;

      try {
        await api.delete(ENDPOINT_URL);
        await this.getTaskList({ forceRefresh: true });
      } catch (error: any) {
        if (error.response?.status === 404) {
          this.$patch({
            tasks: this.tasks.filter((task) => task.taskId !== payload.taskId),
          });
        }
        throw new Error(
          error.response?.data?.message ||
            error.message ||
            "Couldn't delete the task"
        );
      } finally {
        this.setLoading(false);
      }
    },
    async updateTask(payload: UpdateTaskPayload): Promise<Task> {
      this.setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) {
        this.setLoading(false);
        throw new Error("User ID not found");
      }

      const taskId = payload.taskId;
      const ENDPOINT_URL = `/users/${userId}/tasks/${taskId}`;

      const apiPayload: Partial<
        Omit<Task, "taskId" | "userId" | "createdDate">
      > = {};

      if (payload.title !== undefined) apiPayload.title = payload.title;
      if (payload.description !== undefined)
        apiPayload.description = payload.description;
      if (payload.dueDate !== undefined) apiPayload.dueDate = payload.dueDate;

      if (payload.status) {
        apiPayload.status = payload.status;
      }
      if (payload.priority) {
        apiPayload.priority = payload.priority;
      }

      try {
        const response = await api.put<Task>(ENDPOINT_URL, apiPayload, {
          headers: { "Content-Type": "application/json" },
        });
        await this.getTaskList({ forceRefresh: true });
        return response.data;
      } catch (error: any) {
        throw new Error(
          error.response?.data?.message ||
            error.message ||
            "Couldn't update the task"
        );
      } finally {
        this.setLoading(false); // Always reset loading
      }
    },
  },
});
