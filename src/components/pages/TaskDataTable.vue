<template>
  <v-data-table
    :headers="headers"
    :items="tasks"
    :sort-by="sortBy"
    item-key="taskId"
    multi-sort
    show-expand
    hide-default-footer
  >
    <template
      v-slot:item.data-table-expand="{ internalItem, isExpanded, toggleExpand }"
    >
      <v-btn
        :icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        class="text-none"
        color="medium-emphasis"
        size="small"
        variant="text"
        border
        slim
        @click="toggleExpand(internalItem)"
      ></v-btn>
    </template>

    <template #item.description="{ item }">
      <div
        style="
          min-width: 150px;
          max-width: 400px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        "
      >
        {{ item.description }}
      </div>
    </template>

    <template #item.actions="{ item }">
      <v-btn
        icon="mdi-pencil"
        color="primary"
        size="small"
        class="mr-1"
        @click="emitEditTask(item.taskId)"
      >
      </v-btn>
      <v-btn
        icon="mdi-delete"
        color="red"
        size="small"
        @click="emitDeleteTask(item)"
      >
      </v-btn>
    </template>
  </v-data-table>
</template>

<script lang="ts" setup>
import type { DataTableHeader } from "vuetify";
import { useTaskStore, type Task } from "../stores/tasks/tasksStore";

const sortBy = ref([]);
const taskStore = useTaskStore();

const headers: DataTableHeader[] = [
  { title: "Title", key: "title", align: "start", sortable: true },
  {
    title: "Description",
    key: "description",
    align: "start",
    sortable: true,
    width: "15%",
  },
  { title: "Priority", key: "priority", align: "start", sortable: true },
  { title: "Status", key: "status", align: "start", sortable: true },
  { title: "Due date", key: "dueDate", align: "start", sortable: true },
  {
    title: "Created on",
    key: "createdDate",
    align: "start",
    sortable: false,
  },
  {
    title: "Actions",
    key: "actions",
    align: "center",
    sortable: false,
  },
];

const tasks = ref<Task[]>([]); // Task visualizzate (filtrate/ordinate)

const emit = defineEmits(["add-task", "edit-task", "change-view"]);

watch(
  () => taskStore.tasks,
  (newTasks) => {
    tasks.value = Array.isArray(newTasks) ? [...newTasks] : [];
  },
  { deep: true }
);

onBeforeMount(async () => {
  await taskStore.getTaskList({ forceRefresh: true });
  tasks.value = [...taskStore.tasks];
});

function emitEditTask(taskId: string) {
  emit("edit-task", taskId);
}

function addTaskEmit() {
  emit("add-task");
}
</script>
