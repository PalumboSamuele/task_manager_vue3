<template>
  <div :class="{ 'blurred-background': dialog || confirmDialog }">
    <v-row class="my-3">
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        density="compact"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        hide-details
        single-line
        class="mr-3"
      ></v-text-field>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="filteredAndSortedTasks"
      v-model:search="search"
      :filter-keys="['title']"
      item-value="taskId"
      show-expand
      hide-default-footer
      disable-sort
    >
      <!-- Resto dei tuoi slot personalizzati -->
      <template
        #item.data-table-expand="{ internalItem, isExpanded, toggleExpand }"
      >
        <v-btn
          v-if="isDescriptionTruncated(internalItem)"
          :icon="
            isExpanded(internalItem) ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
          "
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
        <div
          :class="`font-weight-bold text-${getPriorityColor(item.priority)}`"
        >
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

    <!-- Dialog per creazione/modifica task -->
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

    <!-- Dialog di conferma -->
    <v-dialog v-model="confirmDialog" max-width="400">
      <v-card class="pa-4 rounded-xl">
        <v-card-title class="d-flex align-center text-h6">
          <v-icon class="me-2" color="primary" end
            >mdi-help-circle-outline</v-icon
          >
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

    <!-- Snackbar per notifiche -->
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
import { computed, ref, watch, onBeforeMount, shallowRef } from "vue";
import {
  useTaskStore,
  type Task,
  type AddTaskPayload,
  type UpdateTaskPayload,
} from "../stores/tasks/tasksStore";
import { parse, format, isValid, startOfToday } from "date-fns";
import { useDisplay, type DataTableHeader } from "vuetify";

const today = startOfToday();
const display = useDisplay();
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
    order: "asc" | "desc" | "";
  };
}>();

const emit = defineEmits(["change-view", "add-task", "edit-task"]);

// Stato locale
const allTasks = ref<Task[]>([]);
const search = ref("");

// Headers per la tabella
const headers: DataTableHeader[] = [
  { title: "Title", key: "title", align: "start" },
  { title: "Description", key: "description", align: "start", width: "15%" },
  { title: "Priority", key: "priority", align: "start" },
  { title: "Status", key: "status", align: "start" },
  { title: "Due date", key: "dueDate", align: "start" },
  { title: "Created on", key: "createdDate", align: "start" },
  { title: "Actions", key: "actions", align: "center" },
];

// Stato per dialog
const dialog = shallowRef(false);
const selectedTask = ref<Partial<Task>>({});
const isViewMode = ref(false);
const modalMode = ref<"create" | "edit" | "view">("create");
const dateMenu = ref(false);
const datePickerValue = ref<Date | null>(null);

// Stato per snackbar
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");

// Stato per dialog di conferma
const confirmDialog = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
const confirmCallback = ref<(() => Promise<void>) | null>(null);
const loadingConfirm = ref(false);

// Computed per task filtrate e ordinate
const filteredAndSortedTasks = computed(() => {
  let tasks = [...allTasks.value];

  // Filtri
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

  // Ordinamento
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

// Computed per il titolo del dialog
const dialogTitle = computed(() =>
  modalMode.value === "view"
    ? "Dettagli Task"
    : modalMode.value === "edit"
    ? "Modifica Task"
    : "Crea Nuova Task"
);

const expandedCharLimit = computed(() => {
  if (display.smAndDown.value) return 30; // mobile
  if (display.mdAndDown.value) return 50; // tablet
  return 70; // desktop
});

// Watch per aggiornare allTasks quando lo store cambia
watch(
  () => taskStore.tasks,
  (newTasks) => {
    allTasks.value = Array.isArray(newTasks) ? [...newTasks] : [];
  },
  { deep: true, immediate: true }
);

// Lifecycle
onBeforeMount(async () => {
  await taskStore.getTaskList({ forceRefresh: true });
});

// Utility functions
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

const isDescriptionTruncated = (item: any) => {
  return item.description?.length > expandedCharLimit.value;
};

function getPriorityColor(priority: string): string {
  switch (priority.toUpperCase()) {
    case "LOW":
    case "BASSA":
      return "light-green-darken-1";
    case "MEDIUM":
    case "MEDIA":
      return "orange-darken-1";
    case "HIGH":
    case "ALTA":
      return "red-lighten-1";
    case "URGENT":
    case "URGENTE":
      return "purple-lighten-1";
    default:
      return "white";
  }
}

// Task management functions
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

// Funzioni esposte al componente padre (vuote per compatibilità)
const applyFilters = () => {};
const applySort = () => {};

// Espone le funzioni al componente padre
defineExpose({
  addTask,
  editTask,
  applyFilters,
  applySort,
});
</script>

<style scoped>
.blurred-background {
  filter: blur(2px);
  transition: filter 0.3s ease-in-out;
}
</style>
