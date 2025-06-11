<template>
  <div>
    {{ useDisplay().name }}
  </div>

  <v-container fluid>
    <v-row justify="space-evenly">
      <Draggable
        v-model="tasks"
        item-key="title"
        handle=".drag-handle"
        class="d-flex flex-wrap"
      >
        <template #item="{ element: task }">
          <v-col :cols="columns">
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
  </v-container>
</template>

<script lang="ts" setup>
import BaseTask from "@/components/BaseTask.vue";
import Draggable from "vuedraggable";
import { useDisplay } from "vuetify";
import { computed, ref } from "vue"; // Importa computed e ref

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
    title: "TASK VUETIFY 1",
    priority: "LOW",
    status: "PENDING",
    description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
    dueDate: "12-03-2026",
    createdDate: "10-06-2025",
  },
  {
    title: "TASK VUETIFY 2",
    priority: "MEDIUM",
    status: "PENDING",
    description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
    dueDate: "12-03-2026",
    createdDate: "10-06-2025",
  },
  {
    title: "TASK VUETIFY 3",
    priority: "HIGH",
    status: "PENDING",
    description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
    dueDate: "12-03-2026",
    createdDate: "10-06-2025",
  },
  {
    title: "TASK VUETIFY 4",
    priority: "URGENT",
    status: "PENDING",
    description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
    dueDate: "12-03-2026",
    createdDate: "10-06-2025",
  },
  {
    title: "TASK VUETIFY 5",
    priority: "LOW",
    status: "PENDING",
    description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
    dueDate: "12-03-2026",
    createdDate: "10-06-2025",
  },
  {
    title: "TASK VUETIFY 6",
    priority: "MEDIUM",
    status: "PENDING",
    description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
    dueDate: "12-03-2026",
    createdDate: "10-06-2025",
  },
]);
</script>
