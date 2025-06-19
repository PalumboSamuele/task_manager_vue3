<template>
  <v-container fluid>
    <task-filter
      @change-filter="handleFilterChange"
      @change-sort="handleSortChange"
      @add-task="handleAddTask"
      @change-view="changeViewMode"
    >
      <template #taskList>
        <v-fade-transition mode="out-in">
          <task-list
            ref="taskListRef"
            v-if="modeGrid"
            :filters="currentFilters"
            :sort-options="sortOptions"
          ></task-list>
          <task-data-table
            v-else
            ref="taskDataTableRef"
            :filters="currentFilters"
            :sort-options="sortOptions"
            @change-view="changeViewMode"
          ></task-data-table>
        </v-fade-transition>
      </template>
    </task-filter>
  </v-container>
</template>

<script setup lang="ts">
import { useTaskStore } from "@/components/stores/tasks/tasksStore";
import { ref, nextTick } from "vue";

const taskStore = useTaskStore();
const modeGrid = computed(() => taskStore.getVisualizationMode === "grid");

// Tipi
type FilterOptions = {
  statuses: string[];
  priorities: ("LOW" | "MEDIUM" | "HIGH" | "URGENT")[];
  dueDateStart: string | null;
  dueDateEnd: string | null;
};

type SortOptions = {
  field: string;
  order: "asc" | "desc" | "";
};

// Stato
const currentFilters = ref<FilterOptions>({
  statuses: [],
  priorities: [],
  dueDateStart: null,
  dueDateEnd: null,
});
const sortOptions = ref<SortOptions>({ field: "", order: "" });

// Ref per i componenti
const taskListRef = ref<any>(null);
const taskDataTableRef = ref<any>(null);

// Gestione eventi
const handleAddTask = () => {
  const activeComponent = modeGrid.value
    ? taskListRef.value
    : taskDataTableRef.value;
  activeComponent?.addTask();
};

const handleFilterChange = (filters: FilterOptions) => {
  console.log("MainPage - Ricevuti filtri:", filters);
  currentFilters.value = { ...filters };
};

const handleSortChange = (newSort: SortOptions) => {
  console.log("MainPage - Ricevuto nuovo ordinamento:", newSort);
  sortOptions.value = { ...newSort };
};

const handleEditTask = (taskId: string) => {
  const activeComponent = modeGrid.value
    ? taskListRef.value
    : taskDataTableRef.value;
  activeComponent?.editTask(taskId);
};

const changeViewMode = (mode: "grid" | "data-table") => {
  console.log("MainPage - Cambio modalità:", mode);
  taskStore.setVisualizationMode(mode);
};
</script>
