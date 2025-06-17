<template>
  <div :class="{ 'blurred-background': dialog || confirmDialog }">
    <v-row class="my-3">
      <v-btn class="mr-2 ml-3" color="secondary" @click="emitChangeDataViewMode('grid')">
        To grid
        <v-icon icon="mdi-dots-grid" end size="x-large"></v-icon>
      </v-btn>
      <v-btn color="primary" append-icon="mdi-plus" @click="addTask">
        Aggiungi Task
      </v-btn>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="tasks"
      :sort-by="sortBy"
      item-value="taskId"
      multi-sort
      show-expand
      hide-default-footer
    >
      <!-- Resto dei tuoi slot personalizzati -->
      <template #item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
        <v-btn
          v-if="isDescriptionTruncated(internalItem)"
          :icon="isExpanded(internalItem) ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          class="text-none"
          color="medium-emphasis"
          size="small"
          variant="text"
          border
          slim
          @click="toggleExpand(internalItem)"
        ></v-btn>
      </template>

      <template #expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length" class="py-2">
            <v-sheet rounded="lg" border>
              <v-table density="compact">
                <tbody class="bg-surface-light">
                  <tr>
                    <th>Description</th>
                  </tr>
                </tbody>
                <tbody>
                  <tr>
                    <td>
                      {{ item.description }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-sheet>
          </td>
        </tr>
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

      <template #item.priority="{ item }">
        <div :class="`font-weight-bold text-${getPriorityColor(item.priority)}`">
          {{ item.priority }}
        </div>
      </template>

      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-pencil"
          color="primary"
          size="small"
          class="mr-1"
          @click="editTask(item.taskId)"
        >
        </v-btn>
        <v-btn
          icon="mdi-delete"
          color="red"
          size="small"
          @click="requestDeleteTask(item.taskId)"
        >
        </v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>{{ dialogTitle }}</v-card-title>

        <v-card-text v-if="selectedTask">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                label="Titolo Task"
                color="deep-purple-accent-3"
                v-model="selectedTask.title"
                :readonly="isViewMode"
                required
                variant="outlined"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                label="Descrizione"
                color="deep-purple-accent-3"
                v-model="selectedTask.description"
                :readonly="isViewMode"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                :items="['LOW', 'MEDIUM', 'HIGH', 'URGENT']"
                color="deep-purple-accent-3"
                label="Priorità"
                v-model="selectedTask.priority"
                :readonly="isViewMode"
                required
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                :items="['PENDING', 'IN_PROGRESS', 'COMPLETED']"
                color="deep-purple-accent-3"
                label="Stato"
                v-model="selectedTask.status"
                :readonly="isViewMode"
                required
                variant="outlined"
              />
            </v-col>
            <v-col cols="12">
              <v-menu
                v-model="dateMenu"
                :close-on-content-click="false"
                transition="scroll-y-transition"
                offset-y
                :readonly="isViewMode"
              >
                <template v-slot:activator="{ props: menuProps }">
                  <v-text-field
                    label="Data di Scadenza"
                    color="deep-purple-accent-3"
                    innericon="mdi-calendar"
                    v-model="selectedTask.dueDate"
                    v-bind="menuProps"
                    :readonly="isViewMode"
                    required
                    variant="outlined"
                  />
                </template>
                <v-date-picker
                  v-if="!isViewMode"
                  :min="today"
                  v-model="datePickerValue"
                  color="deep-purple-accent-3"
                  @update:model-value="updateDueDate"
                />
              </v-menu>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            text="Chiudi"
            color="red-accent-4"
            variant="flat"
            @click="closeDialog"
            :disabled="confirmDialog"
          />
          <v-btn
            v-if="isViewMode"
            color="light-blue-accent-4"
            text="Modifica"
            variant="tonal"
            @click="enableEditMode"
            :disabled="confirmDialog"
          />
          <v-btn
            v-else
            color="light-blue-accent-4"
            text="Salva"
            variant="tonal"
            @click="onSaveClick"
            :disabled="confirmDialog"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDialog" max-width="400">
      <v-card class="pa-4 rounded-xl">
        <v-card-title class="d-flex align-center text-h6">
          <v-icon class="me-2" color="primary" end>mdi-help-circle-outline</v-icon>
          {{ confirmTitle }}
        </v-card-title>
        <v-card-text class="text-body-1 text-high-emphasis">
          {{ confirmMessage }}
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-card-actions class="justify-end pt-4">
            <v-btn
              variant="elevated"
              color="error"
              @click="cancelConfirm"
              :disabled="loadingConfirm"
            >
              Annulla
            </v-btn>
            <v-btn
              variant="elevated"
              color="light-blue-accent-3"
              @click="confirmAction"
              :loading="loadingConfirm"
              class="ms-2"
            >
              Conferma
            </v-btn>
          </v-card-actions>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      location="top right"
      rounded="pill"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
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
