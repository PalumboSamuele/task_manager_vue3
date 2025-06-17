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
            @add-task="handleAddTask"
            @edit-task="handleEditTask"
          ></task-list>
          <task-data-table
            v-else
            ref="taskDataTableRef"
            :filters="currentFilters"
            @add-task="handleAddTask"
            @edit-task="handleEditTask"
            @change-view="changeViewMode"
          ></task-data-table>
        </v-fade-transition>
      </template>
    </task-filter>
  </v-container>
</template>

<script setup lang="ts">
// MAINPAGE

import { useTaskStore } from "@/components/stores/tasks/tasksStore";

const taskStore = useTaskStore();
const modeGrid = computed(() => taskStore.getVisualizationMode === "grid");
const sortOptions = ref({
  field: "",
  order: "",
});

// Definizione dei tipi
export type FilterOptions = {
  statuses: string[]; // non optional
  priorities: ("LOW" | "MEDIUM" | "HIGH" | "URGENT")[]; // non optional
  dueDateStart: string | null; // non optional
  dueDateEnd: string | null; // non optional
};

type SortOptions = {
  field: string;
  order: "asc" | "desc" | "";
};

// Ref per i componenti
const taskListRef = ref<{
  addTask: () => void;
  editTask: (taskId: string) => void;
  applyFilters: (filters: FilterOptions) => void;
  applySort: (options: SortOptions) => void;
}>();

const taskDataTableRef = ref<{
  addTask: () => void;
  editTask: (taskId: string) => void;
  applyFilters: (filters: FilterOptions) => void;
  applySort: (options: SortOptions) => void;
}>();

// Stato dei filtri centralizzato
const currentFilters = ref<FilterOptions>({
  statuses: [],
  priorities: [],
  dueDateStart: null,
  dueDateEnd: null,
});

// Gestione dell'evento add-task
const handleAddTask = () => {
  const activeComponent = modeGrid.value
    ? taskListRef.value
    : taskDataTableRef.value;
  activeComponent?.addTask();
};

// Gestione dei filtri
const handleFilterChange = (filters: FilterOptions) => {
  console.log("MainPage - Ricevuti filtri:", filters);
  currentFilters.value = { ...filters };
};

// Gestione dell'ordinamento
const handleSortChange = (sortOptions: SortOptions) => {
  console.log("MainPage - Ricevuto nuovo ordinamento:", sortOptions);

  // Applica l'ordinamento al componente attivo
  const activeComponent = modeGrid.value
    ? taskListRef.value
    : taskDataTableRef.value;
  if (activeComponent?.applySort) {
    activeComponent.applySort(sortOptions);
  }
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

  // Dopo il cambio di modalità, riapplica i filtri al nuovo componente
  nextTick(() => {
    const activeComponent =
      mode === "grid" ? taskListRef.value : taskDataTableRef.value;
    if (activeComponent?.applyFilters) {
      activeComponent.applyFilters(currentFilters.value);
    }
  });
};
</script>
