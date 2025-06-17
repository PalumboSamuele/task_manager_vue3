<template>
  <v-container fluid>
    <v-fade-transition mode="out-in">
      <task-filter
        v-if="modeList"
        @change-filter="handleFilterChange"
        @change-sort="handleSortChange"
        @add-task="handleAddTask"
        @change-view="changeViewMode"
      >
        <template #taskList>
          <task-list ref="taskListRef"></task-list>
        </template>
      </task-filter>
      <task-data-table
        v-else
        @add-task="handleAddTask"
        @change-view="changeViewMode"
        @edit-task="handleEditTask"
      ></task-data-table>
    </v-fade-transition>
  </v-container>
</template>

<script setup lang="ts">
import { useTaskStore } from "@/components/stores/tasks/tasksStore";

const taskStore = useTaskStore();
const modeList = computed(() => taskStore.getVisualizationMode === "list");

// Definizione dei tipi
type FilterOptions = {
  statuses?: string[];
  priorities?: ("LOW" | "MEDIUM" | "HIGH" | "URGENT")[]; // Specifica i valori esatti
  dueDateStart?: string | null;
  dueDateEnd?: string | null;
};

type SortOptions = {
  field: string;
  order: "asc" | "desc" | "";
};

const taskListRef = ref<{
  addTask: () => void;
  editTask: (taskId: string) => void;
  applyFilters: (filters: FilterOptions) => void;
  applySort: (options: SortOptions) => void;
}>();

// Gestione dell'evento add-task
const handleAddTask = () => {
  taskListRef.value?.addTask();
};

// Gestione dei filtri
const handleFilterChange = (filters: FilterOptions) => {
  taskListRef.value?.applyFilters(filters);
};

// Gestione dell'ordinamento
const handleSortChange = (sortOptions: SortOptions) => {
  taskListRef.value?.applySort(sortOptions);
};

const handleEditTask = (taskId: string) => {
  taskListRef.value?.editTask(taskId);
};

const changeViewMode = (mode: "list" | "data-table") => {
  taskStore.setVisualizationMode(mode);
};
</script>
