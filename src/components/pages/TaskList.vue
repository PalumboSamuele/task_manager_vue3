<template>
  <v-row justify="space-evenly">
    <Draggable
      v-model="tasks"
      item-key="taskId"
      handle=".drag-handle"
      class="d-flex flex-wrap"
      :animation="200"
    >
      <template #item="{ element: task }">
        <v-col :cols="columns" :key="task.taskId" class="pa-2">
          <base-task
            :title="task.title"
            :priority="task.priority"
            :status="task.status"
            :description="task.description"
            :dueDate="task.dueDate"
            :createdDate="task.createdDate"
          ></base-task>
        </v-col>
      </template>
    </Draggable>
  </v-row>
</template>

<script lang="ts" setup>
import Draggable from "vuedraggable";
import { useDisplay } from "vuetify";

const display = useDisplay();

const columns = computed(() => {
  switch (true) {
    case display.smAndDown.value:
      return 7;
    case display.md.value:
      return 5;
    case display.lgAndUp.value:
      return 4;
    default:
      return 12;
  }
});

const tasks = ref([
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
]);
</script>
