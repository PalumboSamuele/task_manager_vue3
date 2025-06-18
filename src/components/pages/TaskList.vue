<template>
  <div :class="{ 'blurred-background': dialog || confirmDialog }">
    <v-row justify="space-evenly">
      <v-col
        cols="12"
        v-if="originalTasks.length === 0 || filteredAndSortedTasks.length === 0"
        class="text-center mt-15"
      >
        <v-icon size="48" color="grey-lighten-1">mdi-inbox</v-icon>
        <h3 class="text-h6 mt-3">
          {{
            filteredAndSortedTasks.length === 0 && originalTasks.length !== 0
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
        v-model="filteredAndSortedTasks"
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

    <!-- Dialog e altri elementi rimangono invariati -->
    <v-dialog v-model="dialog" max-width="600">
      <!-- ... Contenuto del dialog invariato ... -->
    </v-dialog>

    <v-dialog v-model="confirmDialog" max-width="400">
      <!-- ... Contenuto del confirmDialog invariato ... -->
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
import Draggable from "vuedraggable";
import {
  useTaskStore,
  type Task,
  type AddTaskPayload,
  type UpdateTaskPayload,
} from "../stores/tasks/tasksStore";
import { parse, format, isValid, startOfToday } from "date-fns";
import { useI18n } from "vue-i18n";
import { computed } from "vue";

const today = startOfToday();
const taskStore = useTaskStore();
const { t } = useI18n();

// Props con tipizzazione esplicita
const props = defineProps<{
  filters: {
    statuses: string[];
    priorities: string[];
    dueDateStart: string | null;
    dueDateEnd: string | null;
  };
  sortOptions: {
    field: string;
    order: "asc" | "desc" | "";
  };
}>();

const emit = defineEmits(["add-task", "edit-task"]);

// Stato reattivo
const originalTasks = ref<Task[]>([]);
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

// Computed per task filtrate e ordinate
const filteredAndSortedTasks = computed(() => {
  let tasks = [...taskStore.tasks];

  // Applicazione dei filtri
  if (props.filters.statuses.length > 0) {
    tasks = tasks.filter((task) =>
      props.filters.statuses.some(
        (status) => task.status.toUpperCase() === status.toUpperCase()
      )
    );
  }

  if (props.filters.priorities.length > 0) {
    tasks = tasks.filter((task) =>
      props.filters.priorities.some(
        (priority) => task.priority.toUpperCase() === priority.toUpperCase()
      )
    );
  }

  if (props.filters.dueDateStart || props.filters.dueDateEnd) {
    tasks = tasks.filter((task) => {
      const taskDueDate = parseDate(task.dueDate);
      if (!taskDueDate) return false;
      const startDate = props.filters.dueDateStart
        ? parseDate(props.filters.dueDateStart)
        : null;
      const endDate = props.filters.dueDateEnd
        ? parseDate(props.filters.dueDateEnd)
        : null;
      return (
        (!startDate || taskDueDate >= startDate) &&
        (!endDate || taskDueDate <= endDate)
      );
    });
  }

  // Definizione dei pesi delle priorità
  const priorityOrder: Record<string, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    URGENT: 4,
  };

  // Ordinamento di default per priorità se il filtro è attivo
  if (props.filters.priorities.length > 0) {
    tasks.sort((a, b) => {
      const aPriority = priorityOrder[a.priority.toUpperCase()] || 0;
      const bPriority = priorityOrder[b.priority.toUpperCase()] || 0;
      return aPriority - bPriority; // Ordine crescente: LOW -> URGENT
    });
  }

  // Applicazione dell'ordinamento
  if (props.sortOptions.field && props.sortOptions.order) {
    tasks.sort((a, b) => {
      if (props.sortOptions.field === "priority") {
        const priorityOrder: Record<string, number> = {
          LOW: 1,
          MEDIUM: 2,
          HIGH: 3,
          URGENT: 4,
        };
        const aPriority = priorityOrder[a.priority.toUpperCase()] || 0;
        const bPriority = priorityOrder[b.priority.toUpperCase()] || 0;
        return props.sortOptions.order === "asc"
          ? aPriority - bPriority
          : bPriority - aPriority;
      }

      if (props.sortOptions.field === "dueDate") {
        const aDate = parseDate(a.dueDate) || new Date(0);
        const bDate = parseDate(b.dueDate) || new Date(0);
        return props.sortOptions.order === "asc"
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      }

      return 0;
    });
  }

  return tasks;
});

// Inizializzazione
onBeforeMount(async () => {
  await taskStore.getTaskList({ forceRefresh: true });
  originalTasks.value = [...taskStore.tasks];
});

// Metodi (rimangono invariati rispetto al codice originale)
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
  emit("edit-task", taskId);
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
  emit("add-task");
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

// Esposizione delle funzioni per il componente padre
defineExpose({
  addTask,
  editTask,
  applyFilters: (filters: typeof props.filters) => {
    // Non necessario con computed, mantenuto per compatibilità
  },
  applySort: (sortOptions: typeof props.sortOptions) => {
    // Non necessario con computed, mantenuto per compatibilità
  },
});
</script>

<style scoped>
.blurred-background {
  filter: blur(2px);
  transition: filter 0.3s ease-in-out;
}
</style>
