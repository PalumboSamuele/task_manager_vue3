<template>
  <v-container fluid>
    <task-filter
      @change-filter="handleFilterChange"
      @change-sort="handleSortChange"
      @add-task="handleAddTask"
    >
      <template #taskList>
        <task-list ref="taskListRef"></task-list>
      </template>
    </task-filter>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";

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
  applyFilters: (filters: FilterOptions) => void;
  applySort: (options: SortOptions) => void;
}>();

// Gestione dell'evento add-task
const handleAddTask = () => {
  taskListRef.value?.addTask();
};

// Gestione dei filtri
const handleFilterChange = (filters: FilterOptions) => {
  console.log("Filtri applicati:", filters);
  taskListRef.value?.applyFilters(filters);
};

// Gestione dell'ordinamento
const handleSortChange = (sortOptions: SortOptions) => {
  console.log("Ordinamento:", sortOptions);
  taskListRef.value?.applySort(sortOptions);
};
</script>
