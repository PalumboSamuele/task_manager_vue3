<template>
  <div :class="{ 'blurred-background': dialog || confirmDialog }">
    <v-row justify="space-evenly">
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
              :title="task.title"
              :priority="task.priority"
              :status="task.status"
              :description="task.description"
              :dueDate="task.dueDate"
              :createdDate="task.createdDate"
              @callDelete="requestDeleteTask"
              @editTask="editTask"
              @viewTask="viewTask"
            ></base-task>
          </v-col>
        </template>
      </Draggable>
    </v-row>
  </div>

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
              transition="scale-transition"
              offset-y
              :readonly="isViewMode"
            >
              <template v-slot:activator="{ props: menuProps }">
                <v-text-field
                  label="Data di Scadenza"
                  color="deep-purple-accent-3"
                  prepend-inner-icon="mdi-calendar"
                  v-model="selectedTask.dueDate"
                  v-bind="menuProps"
                  :readonly="isViewMode"
                  required
                  variant="outlined"
                />
              </template>
              <v-date-picker
                v-if="!isViewMode"
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
          v-if="!isViewMode"
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
    <v-card class="rounded-xl elevation-2 pa-4">
      <v-card-title class="text-h6">{{ confirmTitle }}</v-card-title>
      <v-card-text>{{ confirmMessage }}</v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          color="grey"
          @click="cancelConfirm"
          :disabled="loadingConfirm"
        >
          Annulla
        </v-btn>
        <v-btn
          text
          color="primary"
          @click="confirmAction"
          :loading="loadingConfirm"
        >
          Conferma
        </v-btn>
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
</template>

<script lang="ts" setup>
import Draggable from "vuedraggable";
import { useDisplay } from "vuetify";
import {
  useTaskStore,
  type Task,
  type AddTaskPayload,
  type UpdateTaskPayload,
} from "../stores/tasks/tasksStore";
import { parse, format, isValid } from "date-fns";

const display = useDisplay();
const taskStore = useTaskStore();

const dialog = shallowRef(false);
const selectedTask = ref<Partial<Task>>({});
const isViewMode = ref(false);
const modalMode = ref<"create" | "edit" | "view">("create");

const dateMenu = ref(false);
const datePickerValue = ref<Date | null>(null);

const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");

const confirmDialog = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
const confirmCallback = ref<(() => Promise<void>) | null>(null);
const loadingConfirm = ref(false);

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

const localTasks = ref<Task[]>([]);

const dialogTitle = computed(() =>
  modalMode.value === "view"
    ? "Dettagli Task"
    : modalMode.value === "edit"
    ? "Modifica Task"
    : "Crea Nuova Task"
);

const showSnackbar = (message: string, color = "success") => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
};

const formatDate = (date: Date | null): string => {
  return date && isValid(date) ? format(date, "dd-MM-yyyy") : "";
};

const parseDate = (dateString: string): Date | null => {
  const parsed = parse(dateString, "dd-MM-yyyy", new Date());
  return isValid(parsed) ? parsed : null;
};

const updateDueDate = (newDate: Date | null) => {
  selectedTask.value.dueDate = formatDate(newDate);
  dateMenu.value = false;
};

const viewTask = (taskId: number) => {
  const task = taskStore.taskById(taskId);
  if (!task) return;

  selectedTask.value = { ...task };
  datePickerValue.value = parseDate(task.dueDate);
  modalMode.value = "view";
  isViewMode.value = true;
  dialog.value = true;
};

const editTask = (taskId: number) => {
  const task = taskStore.taskById(taskId);
  if (!task) return;

  selectedTask.value = { ...task };
  datePickerValue.value = parseDate(task.dueDate);
  modalMode.value = "edit";
  isViewMode.value = false;
  dialog.value = true;
};

const addTask = () => {
  selectedTask.value = {
    taskId: undefined,
    title: "",
    description: "",
    priority: "",
    status: "",
    dueDate: "",
  };
  datePickerValue.value = null;
  modalMode.value = "create";
  isViewMode.value = false;
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  selectedTask.value = {};
  datePickerValue.value = null;
  modalMode.value = "create";
  isViewMode.value = false;
};

const enableEditMode = () => {
  modalMode.value = "edit";
  isViewMode.value = false;
};

const requestDeleteTask = (taskId: number) => {
  confirmTitle.value = "Conferma Eliminazione";
  confirmMessage.value = "Sei sicuro di voler eliminare questa task?";
  confirmCallback.value = async () => {
    loadingConfirm.value = true;
    try {
      await taskStore.deleteTask({ taskId });
      showSnackbar("Task eliminata", "error");
    } catch (error) {
      showSnackbar("Errore durante l'eliminazione della task", "error");
    } finally {
      loadingConfirm.value = false;
      confirmDialog.value = false;
    }
  };
  confirmDialog.value = true;
};

const requestSaveEditConfirm = () => {
  confirmTitle.value = "Conferma Modifica";
  confirmMessage.value = "Sei sicuro di voler salvare le modifiche apportate?";
  confirmCallback.value = async () => {
    loadingConfirm.value = true;

    try {
      const task = selectedTask.value;
      if (
        !task.title ||
        !task.description ||
        !task.priority ||
        !task.status ||
        !task.dueDate
      ) {
        showSnackbar("Compila tutti i campi obbligatori", "error");
        loadingConfirm.value = false;
        return;
      }

      const parsedDate = parseDate(task.dueDate);
      if (!parsedDate) {
        showSnackbar("Data non valida", "error");
        loadingConfirm.value = false;
        return;
      }

      const formattedDate = formatDate(parsedDate);

      const payload: UpdateTaskPayload = {
        taskId: task.taskId!,
        title: task.title,
        description: task.description,
        priority: task.priority as UpdateTaskPayload["priority"],
        status: task.status as UpdateTaskPayload["status"],
        dueDate: formattedDate,
      };

      await taskStore.updateTask(payload);
      showSnackbar("Task modificata", "info");
      closeDialog();
    } catch (error) {
      showSnackbar("Errore durante il salvataggio", "error");
    } finally {
      loadingConfirm.value = false;
      confirmDialog.value = false;
    }
  };
  confirmDialog.value = true;
};

const saveTaskDirectly = async () => {
  const task = selectedTask.value;
  if (
    !task.title ||
    !task.description ||
    !task.priority ||
    !task.status ||
    !task.dueDate
  ) {
    showSnackbar("Compila tutti i campi obbligatori", "error");
    return;
  }

  const parsedDate = parseDate(task.dueDate);
  if (!parsedDate) {
    showSnackbar("Data non valida", "error");
    return;
  }

  const formattedDate = formatDate(parsedDate);

  try {
    const payload: AddTaskPayload = {
      title: task.title,
      description: task.description,
      priority: task.priority as AddTaskPayload["priority"],
      status: task.status.toLowerCase() as AddTaskPayload["status"],
      dueDate: formattedDate,
    };

    await taskStore.addTask(payload);
    showSnackbar("Task creata", "success");
    closeDialog();
  } catch {
    showSnackbar("Errore durante la creazione della task", "error");
  }
};

const onSaveClick = () => {
  if (modalMode.value === "create") {
    saveTaskDirectly();
  } else if (modalMode.value === "edit") {
    requestSaveEditConfirm();
  }
};

const cancelConfirm = () => {
  confirmDialog.value = false;
  confirmCallback.value = null;
};

const confirmAction = async () => {
  if (confirmCallback.value) {
    await confirmCallback.value();
  }
};

watch(
  () => selectedTask.value?.dueDate,
  (newVal) => {
    datePickerValue.value = newVal ? parseDate(newVal) : null;
  },
  { immediate: true }
);

onMounted(() => (localTasks.value = taskStore.getAllTasks));
</script>

<style scoped>
.blurred-background {
  filter: blur(2px);
  transition: filter 0.3s ease-in-out;
}
</style>
