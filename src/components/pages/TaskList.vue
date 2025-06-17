<template>
  <div :class="{ 'blurred-background': dialog || confirmDialog }">
    <v-row justify="space-evenly">
      <v-col
        cols="12"
        v-if="originalTasks.length === 0 || localTasks.length === 0"
        class="text-center mt-15"
      >
        <v-icon size="48" color="grey-lighten-1">mdi-inbox</v-icon>
        <h3 class="text-h6 mt-3">
          {{
            localTasks.length === 0 && originalTasks.length !== 0
              ? "Nessuna task con queste caratteristiche è stata trovata"
              : "Task non trovate"
          }}
        </h3>
        <p>Inizia ad aggiungere una nuova task!</p>
        <v-btn
          class="mt-4"
          color="primary"
          append-icon="mdi-plus"
          @click="addTask"
        >
          Aggiungi Task
        </v-btn>
      </v-col>
      <Draggable
        v-model="localTasks"
        item-key="taskId"
        handle=".drag-handle"
        class="d-flex flex-wrap w-100"
        :animation="200"
      >
        <template #item="{ element: task }">
          <v-col cols="12" lg="4" md="6" :key="task.taskId">
            <base-task
              :taskId="task.taskId"
              :title="task.title"
              :description="task.description"
              :status="task.status"
              :priority="task.priority"
              :dueDate="task.dueDate"
              :createdDate="task.createdDate"
              @callDelete="requestDeleteTask"
              @editTask="editTask"
              @viewTask="viewTask"
            />
          </v-col>
        </template>
      </Draggable>
    </v-row>

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
          <v-icon class="me-2" color="primary">mdi-help-circle-outline</v-icon>
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
// TASKLIST

import Draggable from "vuedraggable";
import {
  useTaskStore,
  type Task,
  type AddTaskPayload,
  type UpdateTaskPayload,
} from "../stores/tasks/tasksStore";
import { parse, format, isValid, startOfToday } from "date-fns";

const today = startOfToday();
const taskStore = useTaskStore();

const props = defineProps<{
  filters: {
    statuses: string[];
    priorities: string[];
    dueDateStart: string | null;
    dueDateEnd: string | null;
  };
  sortOptions: {
    field: string;
    order: string;
  };
}>();

//-----------------REACTIVE VARIABLES--------------------

// Aggiunta: Stato per i filtri attivi
const activeFilters = ref({
  statuses: [] as string[],
  priorities: [] as string[],
  dateRange: { start: "", end: "" },
});

// Stato per l'ordinamento corrente
const currentSort = ref({
  field: "",
  order: "",
});

const originalTasks = ref<Task[]>([]); // Mantiene una copia delle task originali
const localTasks = ref<Task[]>([]); // Task visualizzate (filtrate/ordinate)

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

//----------------------COMPUTED------------------------

const dialogTitle = computed(() =>
  modalMode.value === "view"
    ? "Dettagli Task"
    : modalMode.value === "edit"
    ? "Modifica Task"
    : "Crea Nuova Task"
);

//----------------------WATCHES------------------------

watch(
  () => selectedTask.value?.dueDate,
  (newVal) => {
    datePickerValue.value = newVal ? parseDate(newVal) : null;
  },
  { immediate: true }
);

// Aggiorna le task locali quando cambiano quelle nello store
watch(
  [() => taskStore.tasks, () => props.filters, () => props.sortOptions],
  ([newTasks, newFilters, newSort]) => {
    originalTasks.value = Array.isArray(newTasks) ? [...newTasks] : [];
    const filtered = applyFilters(newFilters);
    const sorted = newSort.field ? applySort(newSort, filtered) : filtered;
    localTasks.value = sorted;
  },
  { deep: true }
);

//----------------------METHODS------------------------

// Inizializzazione
onBeforeMount(async () => {
  await taskStore.getTaskList({ forceRefresh: true });
  originalTasks.value = [...taskStore.tasks];
  localTasks.value = [...taskStore.tasks];
});

// Funzione per applicare i filtri
const applyFilters = (filters: {
  statuses?: string[];
  priorities?: string[];
  dueDateStart?: string | null;
  dueDateEnd?: string | null;
}) => {
  let filteredTasks = [...originalTasks.value];

  if (filters.statuses && filters.statuses.length > 0) {
    filteredTasks = filteredTasks.filter((task) =>
      filters.statuses?.some(
        (status) => task.status.toUpperCase() === status.toUpperCase()
      )
    );
  }

  if (filters.priorities && filters.priorities.length > 0) {
    filteredTasks = filteredTasks.filter((task) =>
      filters.priorities?.some(
        (priority) => task.priority.toUpperCase() === priority.toUpperCase()
      )
    );
  }

  if (filters.dueDateStart || filters.dueDateEnd) {
    filteredTasks = filteredTasks.filter((task) => {
      const taskDueDate = parseDate(task.dueDate);
      if (!taskDueDate) return false;
      const startDate = filters.dueDateStart
        ? parseDate(filters.dueDateStart)
        : null;
      const endDate = filters.dueDateEnd ? parseDate(filters.dueDateEnd) : null;
      return (
        (!startDate || taskDueDate >= startDate) &&
        (!endDate || taskDueDate <= endDate)
      );
    });
  }

  activeFilters.value = {
    statuses: filters.statuses || [],
    priorities: filters.priorities || [],
    dateRange: {
      start: filters.dueDateStart || "",
      end: filters.dueDateEnd || "",
    },
  };

  return filteredTasks;
};

// Funzione per applicare l'ordinamento
const applySort = (
  sortOptions: { field: string; order: string },
  tasks: Task[]
): Task[] => {
  const { field, order } = sortOptions;
  currentSort.value = { field, order };

  if (!field || !order) return tasks;

  const sortedTasks = [...tasks].sort((a, b) => {
    if (field === "priority") {
      const priorityOrder: Record<string, number> = {
        LOW: 1,
        MEDIUM: 2,
        HIGH: 3,
        URGENT: 4,
      };
      const aPriority = priorityOrder[a.priority.toUpperCase()] || 0;
      const bPriority = priorityOrder[b.priority.toUpperCase()] || 0;
      return order === "asc" ? aPriority - bPriority : bPriority - aPriority;
    }

    if (field === "dueDate") {
      const aDate = parseDate(a.dueDate) || new Date(0);
      const bDate = parseDate(b.dueDate) || new Date(0);
      return order === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }

    return 0;
  });

  return sortedTasks;
};

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

const viewTask = (taskId: string) => {
  const task = taskStore.taskById(taskId);
  if (!task) return;

  selectedTask.value = { ...task };
  datePickerValue.value = parseDate(task.dueDate);
  modalMode.value = "view";
  isViewMode.value = true;
  dialog.value = true;
};

const editTask = (taskId: string) => {
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

const requestDeleteTask = (taskId: string) => {
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
        showSnackbar("Compila tutti i campi ", "error");
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
    showSnackbar("Compila tutti i campi", "error");
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

// Espone le funzioni per l'uso esterno
defineExpose({
  addTask,
  applyFilters,
  applySort,
  editTask,
});
</script>

<style scoped>
.blurred-background {
  filter: blur(2px);
  transition: filter 0.3s ease-in-out;
}
</style>
