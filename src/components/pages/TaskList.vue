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
              ? $t("taskList.taskFilt")
              : $t("taskList.noTask")
          }}
        </h3>
        <p>{{ $t("taskList.addMess") }}</p>
        <v-btn
          class="mt-4"
          color="primary"
          append-icon="mdi-plus"
          @click="addTask"
        >
          {{ $t("taskList.addTask") }}
        </v-btn>
      </v-col>
      <Draggable
        v-model="filteredAndSortedTasks"
        item-key="taskId"
        handle=".drag-handle"
        class="d-flex flex-wrap w-100 px-4"
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
      <v-card>
        <v-card-title>{{ dialogTitle }}</v-card-title>

        <v-card-text v-if="selectedTask">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                :label="t('taskList.modal.title')"
                color="deep-purple-accent-3"
                v-model="selectedTask.title"
                :readonly="isViewMode"
                :rules="titleRules"
                :error-messages="titleError"
                required
                variant="outlined"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                :label="t('taskList.modal.description')"
                color="deep-purple-accent-3"
                v-model="selectedTask.description"
                :readonly="isViewMode"
                :rules="descriptionRules"
                :error-messages="descriptionError"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                :label="t('taskList.modal.selectPriority')"
                :items="priorityOptions"
                item-title="text"
                item-value="value"
                color="deep-purple-accent-3"
                v-model="selectedTask.priority"
                :readonly="isViewMode"
                required
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                :label="t('taskList.modal.selectStatus')"
                :items="statusOptions"
                item-title="text"
                item-value="value"
                color="deep-purple-accent-3"
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
                    :label="t('taskFilter.dueDate')"
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
            :text="t('taskList.modal.closeModal')"
            color="red-accent-4"
            variant="flat"
            @click="closeDialog"
            :disabled="confirmDialog"
          />
          <v-btn
            v-if="isViewMode"
            color="light-blue-accent-4"
            :text="t('taskList.modal.edit')"
            variant="tonal"
            @click="enableEditMode"
            :disabled="confirmDialog"
          />
          <v-btn
            v-else
            color="light-blue-accent-4"
            :text="t('taskList.modal.okTitleSave')"
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
              {{ $t("taskList.modal.cancel") }}
            </v-btn>
            <v-btn
              variant="elevated"
              color="light-blue-accent-3"
              @click="confirmAction"
              :loading="loadingConfirm"
              class="ms-2"
            >
              {{ $t("taskList.modal.confirm") }}
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
import Draggable from "vuedraggable";
import { useDisplay } from "vuetify";
import {
  useTaskStore,
  type Task,
  type AddTaskPayload,
  type UpdateTaskPayload,
} from "../stores/tasks/tasksStore";
import { parse, format, isValid, startOfToday } from "date-fns";
import { useI18n } from "vue-i18n";

const today = startOfToday();
const display = useDisplay();
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

const statusOptions = computed(() => [
  { value: "PENDING", text: t("taskFilter.statusFilter.pending") },
  { value: "IN_PROGRESS", text: t("taskFilter.statusFilter.inProgress") },
  { value: "COMPLETED", text: t("taskFilter.statusFilter.completed") },
]);

const priorityOptions = computed(() => [
  { value: "LOW", text: t("taskFilter.priorityFilter.low") },
  { value: "MEDIUM", text: t("taskFilter.priorityFilter.medium") },
  { value: "HIGH", text: t("taskFilter.priorityFilter.high") },
  { value: "URGENT", text: t("taskFilter.priorityFilter.urgent") },
]);

// Aggiornate le regole di validazione
const titleRules = [
  (v: string) => v.length <= 50 || t("taskList.modal.titleValidate"),
];
const descriptionRules = [
  (v: string) => v.length <= 200 || t("taskList.modal.descriptionValidate"),
];

//-----------------REACTIVE VARIABLES--------------------

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

// Nuove variabili per i messaggi di errore
const titleError = ref("");
const descriptionError = ref("");

//----------------------COMPUTED------------------------
const dialogTitle = computed(() =>
  modalMode.value === "view"
    ? t("taskList.modal.titleView")
    : modalMode.value === "edit"
    ? t("taskList.modal.titleEdit")
    : t("taskList.modal.titleCreate")
);

const filteredAndSortedTasks = computed(() => {
  let tasks = toRaw([...taskStore.tasks]);

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

  const priorityOrder: Record<string, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    URGENT: 4,
  };

  if (props.filters.priorities.length > 0) {
    tasks.sort((a, b) => {
      const aPriority = priorityOrder[a.priority.toUpperCase()] || 0;
      const bPriority = priorityOrder[b.priority.toUpperCase()] || 0;
      return aPriority - bPriority; // Ordine crescente: LOW -> URGENT
    });
  }

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

//----------------------METHODS------------------------

// Inizializzazione
onBeforeMount(async () => {
  await taskStore.getTaskList({ forceRefresh: true });
  originalTasks.value = [...taskStore.tasks];
});

// Nuova funzione per validare i campi
const validateFields = (): boolean => {
  let isValid = true;

  // Reset errori
  titleError.value = "";
  descriptionError.value = "";

  const task = selectedTask.value;

  // Validazione titolo
  if (!task.title || task.title.trim() === "") {
    isValid = false;
  } else if (task.title.length > 50) {
    isValid = false;
  }

  // Validazione descrizione
  if (!task.description || task.description.trim() === "") {
    isValid = false;
  } else if (task.description.length > 200) {
    isValid = false;
  }

  // Se non è valido, mostra il messaggio generale
  if (!isValid) {
    showSnackbar(
      "Tutti i campi sono obbligatori e devono rispettare i limiti di caratteri",
      "error"
    );
  }

  return isValid;
};

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
  const task = toRaw(taskStore.taskById(taskId));
  if (!task) return;
  selectedTask.value = { ...task };
  datePickerValue.value = parseDate(task.dueDate);
  modalMode.value = "view";
  isViewMode.value = true;
  dialog.value = true;
  // Reset errori quando si apre in modalità view
  resetValidationErrors();
};

const editTask = (taskId: string) => {
  const task = toRaw(taskStore.taskById(taskId));
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
  // Reset errori quando si crea un nuovo task
  resetValidationErrors();
};

// Nuova funzione per resettare gli errori di validazione
const resetValidationErrors = () => {
  titleError.value = "";
  descriptionError.value = "";
};

const closeDialog = () => {
  dialog.value = false;
  selectedTask.value = {};
  datePickerValue.value = null;
  modalMode.value = "create";
  isViewMode.value = false;
  resetValidationErrors();
};

const enableEditMode = () => {
  modalMode.value = "edit";
  isViewMode.value = false;
  resetValidationErrors();
};

const requestDeleteTask = (taskId: string) => {
  confirmTitle.value = t("taskList.modal.deleteTaskTitle");
  confirmMessage.value = t("taskList.modal.deleteTaskMessage");
  confirmCallback.value = async () => {
    loadingConfirm.value = true;
    try {
      await taskStore.deleteTask({ taskId });
      showSnackbar(t("taskList.toast.toastDeleteMessage"), "error");
    } catch (error) {
      showSnackbar(t("taskList.toast.toastErrorDelete"), "error");
    } finally {
      loadingConfirm.value = false;
      confirmDialog.value = false;
    }
  };
  confirmDialog.value = true;
};

const requestSaveEditConfirm = () => {
  // Prima valida i campi
  if (!validateFields()) {
    return;
  }

  confirmTitle.value = t("taskList.modal.editTaskTitle");
  confirmMessage.value = t("taskList.modal.editTaskMessage");
  confirmCallback.value = async () => {
    loadingConfirm.value = true;
    try {
      const task = selectedTask.value;
      const parsedDate = parseDate(task.dueDate!);
      const formattedDate = formatDate(parsedDate);
      const payload: UpdateTaskPayload = {
        taskId: task.taskId!,
        title: task.title!,
        description: task.description!,
        priority: task.priority as UpdateTaskPayload["priority"],
        status: task.status as UpdateTaskPayload["status"],
        dueDate: formattedDate,
      };
      await taskStore.updateTask(payload);
      showSnackbar(t("taskList.toast.toastEditMessage"), "info");
      closeDialog();
    } catch (error) {
      showSnackbar(t("taskList.toast.toastErrorModify"), "error");
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
    showSnackbar(t("taskList.toast.toastCreate"), "error");
    return;
  }
  const parsedDate = parseDate(task.dueDate);
  if (!parsedDate) {
    showSnackbar(t("taskList.toast.toastDate"), "error");
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
    showSnackbar(t("taskList.toast.toastAddMessage"), "success");
    closeDialog();
  } catch {
    showSnackbar(t("taskLost.toast.toastErrorAdd"), "error");
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
});
</script>

<style scoped>
.blurred-background {
  filter: blur(2px);
  transition: filter 0.3s ease-in-out;
}
</style>
