import { defineStore } from "pinia";
import api from "@/axios";
import { useAuthStore } from "../auth/authStore";

export interface Task {
  taskId: number;
  title: string;
  description: string;
  priority: "" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "" | "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string;
  createdDate: string;
  // userId: string;
}

export interface AddTaskPayload {
  title: string;
  description: string;
  priority: "" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "" | "pending" | "in_progress" | "completed";
  dueDate: string;
}

export interface UpdateTaskPayload {
  taskId: number;
  title: string;
  description?: string;
  priority: "" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "" | "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string;
}

export interface DeleteTaskPayload {
  taskId: number;
}

interface TaskStoreState {
  lastFetch: number | null;
  tasks: Task[];
  isLoading: boolean;
}

export const useTaskStore = defineStore("tasks", {
  state: (): TaskStoreState => ({
    lastFetch: null,
    tasks: [
      {
        taskId: 1,
        title: "TASK VUETIFY 1",
        priority: "LOW",
        status: "PENDING",
        description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
        dueDate: "12-03-2026",
        createdDate: "10-06-2025",
      },
      {
        taskId: 2,
        title: "TASK VUETIFY 2",
        priority: "MEDIUM",
        status: "PENDING",
        description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
        dueDate: "12-03-2026",
        createdDate: "10-06-2025",
      },
      {
        taskId: 3,
        title: "TASK VUETIFY 3",
        priority: "HIGH",
        status: "PENDING",
        description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
        dueDate: "12-03-2026",
        createdDate: "10-06-2025",
      },
      {
        taskId: 4,
        title: "TASK VUETIFY 4",
        priority: "URGENT",
        status: "PENDING",
        description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
        dueDate: "12-03-2026",
        createdDate: "10-06-2025",
      },
      {
        taskId: 5,
        title: "TASK VUETIFY 5",
        priority: "LOW",
        status: "PENDING",
        description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
        dueDate: "12-03-2026",
        createdDate: "10-06-2025",
      },
      {
        taskId: 6,
        title: "TASK VUETIFY 6",
        priority: "MEDIUM",
        status: "PENDING",
        description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
        dueDate: "12-03-2026",
        createdDate: "10-06-2025",
      },
      {
        taskId: 7,
        title: "TASK VUETIFY 1",
        priority: "LOW",
        status: "PENDING",
        description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
        dueDate: "12-03-2026",
        createdDate: "10-06-2025",
      },
      {
        taskId: 8,
        title: "TASK VUETIFY 2",
        priority: "MEDIUM",
        status: "PENDING",
        description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
        dueDate: "12-03-2026",
        createdDate: "10-06-2025",
      },
      {
        taskId: 9,
        title: "TASK VUETIFY 3",
        priority: "HIGH",
        status: "PENDING",
        description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
        dueDate: "12-03-2026",
        createdDate: "10-06-2025",
      },
      {
        taskId: 10,
        title: "TASK VUETIFY 4",
        priority: "URGENT",
        status: "PENDING",
        description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
        dueDate: "12-03-2026",
        createdDate: "10-06-2025",
      },
      {
        taskId: 11,
        title: "TASK VUETIFY 5",
        priority: "LOW",
        status: "PENDING",
        description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
        dueDate: "12-03-2026",
        createdDate: "10-06-2025",
      },
      {
        taskId: 12,
        title: "TASK VUETIFY 6",
        priority: "MEDIUM",
        status: "PENDING",
        description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
        dueDate: "12-03-2026",
        createdDate: "10-06-2025",
      },
    ],
    isLoading: false,
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
      (taskId: number): Task | undefined => {
        return state.tasks.find((task) => task.taskId === taskId);
      },
    shouldUpdate(state): boolean {
      if (!state.lastFetch) return true;
      const currentTimeStamp = new Date().getTime();
      return (currentTimeStamp - state.lastFetch) / 1000 > 30;
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
      const authStore = useAuthStore();

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
              // userId: taskData.userId,
            })
          ),
        });

        this.setFetchTimestamp();
      } catch (error: any) {
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
      const authStore = useAuthStore();
      const task = {
        ...payload,
        userId,
        status: payload.status.toUpperCase() as Task["status"],
        priority: payload.priority.toUpperCase() as Task["priority"],
      };
      try {
        console.log("Sending task:", task);
        const response = await api.post<Task>(ENDPOINT_URL, task, {
          headers: { "Content-Type": "application/json" },
        });
        await this.getTaskList({ forceRefresh: true });
        return response.data;
      } catch (error: any) {
        console.error("Error response:", error.response?.data);
        if (error.response?.status === 401) {
          authStore.logout();
        }
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
      const authStore = useAuthStore();

      try {
        await api.delete(ENDPOINT_URL);
        await this.getTaskList({ forceRefresh: true });
      } catch (error: any) {
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
      const authStore = useAuthStore();

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
        if (error.response?.status === 401) {
          authStore.logout();
        }
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
