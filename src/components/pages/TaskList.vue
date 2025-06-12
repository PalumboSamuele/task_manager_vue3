<template>
  <div :class="{ 'blurred-background': dialog }">
    <v-container fluid>
      <v-row justify="space-evenly">
        <v-col cols="12" class="text-center">
          <v-icon size="48" color="grey-lighten-1">mdi-inbox</v-icon>
          <h3 class="text-h6 mt-3">Nessuna task trovata.</h3>
          <p>Inizia aggiungendo una nuova task!</p>
          <v-btn
            class="mt-4"
            color="primary"
            prepend-icon="mdi-plus"
            @click="addTask"
          >
            Aggiungi Task
          </v-btn>
        </v-col>
        <Draggable
          v-model="localTasks"
          item-key="taskId"
          handle=".drag-handle"
          class="d-flex flex-wrap"
          :animation="200"
        >
          <template #item="{ element: task }">
            <v-col :cols="columns" :key="task.taskId">
              <base-task
                :taskId="task.id"
                :title="task.title"
                :priority="task.priority"
                :status="task.status"
                :description="task.description"
                :dueDate="task.dueDate"
                :createdDate="task.createdDate"
                @callDelete="deleteTask"
                @editTask="editTask"
                @viewTask="viewTask"
              ></base-task>
            </v-col>
          </template>
        </Draggable>
      </v-row>
    </v-container>

    <div class="pa-4 text-center">
      <v-dialog v-model="dialog" max-width="600">
        <v-card icon="fa:fas fa-edit" :title="dialogTitle">
          <v-card-text v-if="selectedTask">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  color="deep-purple-accent-4"
                  label="Titolo Task"
                  v-model="selectedTask.title"
                  :readonly="isViewMode"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  color="deep-purple-accent-4"
                  label="Descrizione"
                  v-model="selectedTask.description"
                  :readonly="isViewMode"
                ></v-textarea>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  color="deep-purple-accent-4"
                  :items="['LOW', 'MEDIUM', 'HIGH', 'URGENT']"
                  label="Priorità"
                  v-model="selectedTask.priority"
                  :readonly="isViewMode"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  color="deep-purple-accent-4"
                  :items="['PENDING', 'IN_PROGRESS', 'COMPLETED']"
                  label="Stato"
                  v-model="selectedTask.status"
                  :readonly="isViewMode"
                  required
                ></v-select>
              </v-col>

              <v-col cols="12" md="12">
                <v-menu
                  v-model="dateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                  :disabled="isViewMode"
                >
                  <template v-slot:activator="{ props: menuProps }">
                    <v-text-field
                      color="deep-purple-accent-4"
                      label="Data di Scadenza"
                      prepend-inner-icon="mdi-calendar"
                      :model-value="selectedTask.dueDate"
                      v-bind="menuProps"
                      required
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="datePickerValue"
                    @update:model-value="updateDueDate"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
            <small class="text-caption text-medium-emphasis"
              >* indica campo obbligatorio</small
            >
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
              text="Chiudi"
              color="red-accent-4"
              variant="flat"
              @click="closeDialog"
            ></v-btn>

            <v-btn
              v-if="isViewMode"
              color="light-blue-accent-4"
              text="Modifica"
              variant="tonal"
              @click="enableEditMode"
            ></v-btn>

            <v-btn
              v-if="!isViewMode"
              color="light-blue-accent-4"
              text="Salva"
              variant="tonal"
              @click="saveTask"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Draggable from "vuedraggable";
import { useDisplay } from "vuetify";
import { shallowRef, ref, computed, watch, onMounted } from "vue";
import {
  useTaskStore,
  type Task,
  type AddTaskPayload,
  type UpdateTaskPayload,
} from "../stores/tasks/tasksStore";
import BaseTask from "../ui/BaseTask.vue";

const taskStore = useTaskStore();

const dialog = shallowRef(false);
const selectedTask = ref<Partial<Task>>({
  taskId: undefined,
  title: "",
  description: "",
  priority: "LOW",
  status: "PENDING",
  dueDate: "",
});
const isViewMode = ref(false);
const modalMode = ref<"create" | "edit" | "view">("create");

const dateMenu = ref(false);
const datePickerValue = ref<Date | null>(null);

const display = useDisplay();
const columns = computed(() => {
  switch (true) {
    case display.smAndDown.value:
      return 12; 
    case display.md.value:
      return 6; 
    case display.lgAndUp.value:
      return 4;
    default:
      return 12;
  }
});

const localTasks = computed<Task[]>({
  get() {
    return taskStore.getAllTasks;
  },
  set(newValue: Task[]) {
    taskStore.updateTasks(newValue);
  },
});

const dialogTitle = computed(() => {
  if (modalMode.value === "view") {
    return "Dettagli Task";
  } else if (modalMode.value === "edit") {
    return "Modifica Task";
  } else {
    return "Crea Nuova Task";
  }
});

const statusOptions = [
  { value: "TODO", text: "DA FARE" },
  { value: "IN_PROGRESS", text: "IN CORSO" },
  { value: "DONE", text: "COMPLETATA" },
];

const priorityOptions = [
  { value: "LOW", text: "BASSA" },
  { value: "MEDIUM", text: "MEDIA" },
  { value: "HIGH", text: "ALTA" },
  { value: "URGENT", text: "URGENTE" },
];

const formatDate = (date: Date | null): string => {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;

  const parts = dateString.split("-");
  if (
    parts.length === 3 &&
    !isNaN(parseInt(parts[0])) &&
    !isNaN(parseInt(parts[1])) &&
    !isNaN(parseInt(parts[2]))
  ) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {
      return date;
    }
  }

  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch (e) {}
  return null;
};

watch(
  () => selectedTask.value?.dueDate,
  (newVal) => {
    if (newVal) {
      const parsedDate = parseDate(newVal);
      if (parsedDate) {
        datePickerValue.value = parsedDate;
      } else {
        datePickerValue.value = null;
      }
    } else {
      datePickerValue.value = null;
    }
  },
  { immediate: true }
);

const updateDueDate = (newDate: Date | null) => {
  if (selectedTask.value) {
    selectedTask.value.dueDate = formatDate(newDate);
  }
  dateMenu.value = false;
};

const viewTask = (taskId: string) => {
  modalMode.value = "view";
  const task = taskStore.taskById(taskId);
  if (task) {
    selectedTask.value = { ...task };
    selectedTask.value.dueDate = formatDate(parseDate(task.dueDate));
    isViewMode.value = true;
    dialog.value = true;
  }
};

const editTask = (taskId: string) => {
  modalMode.value = "edit";
  const task = taskStore.taskById(taskId);
  if (task) {
    selectedTask.value = { ...task };
    selectedTask.value.dueDate = formatDate(parseDate(task.dueDate));
    dialog.value = true;
  }
};

const enableEditMode = () => {
  modalMode.value = "edit";
  isViewMode.value = false;
};

const deleteTask = async (taskId: string) => {
  if (confirm("Sei sicuro di voler eliminare questa task?")) {
    try {
      await taskStore.deleteTask({ taskId });
    } catch (error: any) {
      console.error("Errore durante l'eliminazione della task:", error);
    }
  }
};

const addTask = () => {
  modalMode.value = "create";
  isViewMode.value = false;
  selectedTask.value = {
    taskId: undefined,
    title: "",
    description: "",
    priority: "LOW",
    status: "PENDING",
    dueDate: "",
  };
  datePickerValue.value = null;
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  selectedTask.value = {
    taskId: undefined,
    title: "",
    description: "",
    priority: "LOW",
    status: "PENDING",
    dueDate: "",
  };
  datePickerValue.value = null;
  isViewMode.value = false;
  modalMode.value = "create";
};

const saveTask = async () => {
  if (
    !selectedTask.value.title ||
    !selectedTask.value.description ||
    !selectedTask.value.priority ||
    !selectedTask.value.status ||
    !selectedTask.value.dueDate
  ) {
    return;
  }

  let formattedDateForApi: string | null = null;
  if (selectedTask.value.dueDate) {
    const parsed = parseDate(selectedTask.value.dueDate);
    if (parsed) {
      formattedDateForApi = parsed.toISOString();
    } else {
      return;
    }
  }

  try {
    if (modalMode.value === "create") {
      const payload: AddTaskPayload = {
        title: selectedTask.value.title,
        description: selectedTask.value.description,
        priority: selectedTask.value.priority as AddTaskPayload["priority"],
        status:
          selectedTask.value.status.toLowerCase() as AddTaskPayload["status"],
        dueDate: formattedDateForApi || "",
      };
      await taskStore.addTask(payload);
    } else if (modalMode.value === "edit") {
      const payload: UpdateTaskPayload = {
        taskId: selectedTask.value.taskId!,
        title: selectedTask.value.title,
        description: selectedTask.value.description,
        priority: selectedTask.value.priority as UpdateTaskPayload["priority"],
        status: selectedTask.value.status as UpdateTaskPayload["status"],
        dueDate: formattedDateForApi || "",
      };
      await taskStore.updateTask(payload);
    }
    closeDialog();
  } catch (error: any) {
    console.error("Errore durante il salvataggio della task:", error);
  }
};

onMounted(async () => {
  try {
    await taskStore.getTaskList();
  } catch (err: any) {
    console.error("Failed to fetch tasks:", err.message);
  }
});
</script>

<style scoped>
.blurred-background {
  filter: blur(2px);
  transition: filter 0.3s ease-in-out;
}
</style>
