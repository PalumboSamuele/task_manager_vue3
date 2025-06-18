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
      :items="filteredTasks"
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
          {{ getTranslatedPriority(item.priority) }}
        </div>
      </template>
      
      <template #item.status="{ item }">
        <div>
          {{ getTranslatedStatus(item.status) }}
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
                :label="t('taskList.modal.title')"
                color="deep-purple-accent-3"
                v-model="selectedTask.title"
                :readonly="isViewMode"
                :rules="titleRules"
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
// TASK DATA TABLE

import type { DataTableHeader } from "vuetify";
import {
  useTaskStore,
  type AddTaskPayload,
  type Task,
  type UpdateTaskPayload,
} from "../stores/tasks/tasksStore";
import { parse, format, isValid, startOfToday } from "date-fns";
import { useDisplay } from "vuetify";
import type { FilterOptions } from "@/components/pages/MainPage.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const today = startOfToday();
const display = useDisplay();
const taskStore = useTaskStore();

const headers: DataTableHeader[] = [
  { title: t("baseTask.title"), key: "title", align: "start" },
  {
    title: t("baseTask.description"),
    key: "description",
    align: "start",
    width: "15%",
  },
  {
    title: t("baseTask.priority"),
    key: "priority",
    align: "start",
  },
  { title: t("baseTask.status"), key: "status", align: "start" },
  { title: t("baseTask.completition"), key: "dueDate", align: "start" },
  { title: t("baseTask.createdOn"), key: "createdDate", align: "start" },
  { title: t("baseTask.actions"), key: "actions", align: "center" },
];

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

const getTranslatedStatus = (status: string): string => {
  const statusOption = statusOptions.value.find(
    (option) => option.value.toUpperCase() === status.toUpperCase()
  );
  return statusOption ? statusOption.text : status;
};

const getTranslatedPriority = (priority: string): string => {
  const priorityOption = priorityOptions.value.find(
    (option) => option.value.toUpperCase() === priority.toUpperCase()
  );
  return priorityOption ? priorityOption.text : priority;
};

const titleRules = [
  (v: string) => v.length <= 32 || t("taskList.modal.titleValidate"),
];
const descriptionRules = [
  (v: string) => v.length <= 200 || t("taskList.modal.descriptionValidate"),
];

// Props ed emit
const props = defineProps<{ filters: FilterOptions }>();
const emit = defineEmits(["change-view", "add-task", "edit-task"]);

// Stato locale
const allTasks = ref<Task[]>([]);
const filteredTasks = ref<Task[]>([]);
const search = ref("");

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

// Stato per l'ordinamento corrente
const currentSort = ref({
  field: "",
  order: "",
});

// Computed
const dialogTitle = computed(() =>
  modalMode.value === "view"
    ? t("taskList.modal.titleView")
    : modalMode.value === "edit"
    ? t("taskList.modal.titleEdit")
    : t("taskList.modal.titleCreate")
);

const expandedCharLimit = computed(() => {
  if (display.smAndDown.value) return 30; // mobile
  if (display.mdAndDown.value) return 50; // tablet
  return 70; // desktop
});

// Funzioni per gestire i filtri
const applyCurrentFilters = () => {
  let filtered = [...allTasks.value];

  console.log("TaskDataTable - Applicazione filtri:", props.filters);
  console.log("TaskDataTable - Tasks originali:", filtered.length);

  // Filtro per stato
  if (props.filters.statuses && props.filters.statuses.length > 0) {
    filtered = filtered.filter((task) =>
      props.filters.statuses.some(
        (status) => task.status.toUpperCase() === status.toUpperCase()
      )
    );
    console.log("TaskDataTable - Dopo filtro stati:", filtered.length);
  }

  // Filtro per priorità
  if (props.filters.priorities && props.filters.priorities.length > 0) {
    let priorityWeight: Record<string, number> = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      URGENT: 4,
    };

    filtered = filtered.filter((task) =>
      props.filters.priorities.some(
        (priority) => task.priority.toUpperCase() === priority.toUpperCase()
      )
    );
    console.log("TaskDataTable - Dopo filtro priorità:", filtered.length);
    console.log(
      "TaskDataTable - Dopo filtro priorità:",
      filtered.map((item) => item.priority)
    );

    filtered.sort((a: Task, b: Task) => {
      const aWeight = priorityWeight[a.priority?.toUpperCase()] || 0;
      const bWeight = priorityWeight[b.priority?.toUpperCase()] || 0;
      return aWeight - bWeight;
    });
  }

  // Filtro per data di scadenza
  if (props.filters.dueDateStart || props.filters.dueDateEnd) {
    filtered = filtered.filter((task) => {
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
    console.log("TaskDataTable - Dopo filtro date:", filtered.length);
  }

  // Applica l'ordinamento se presente
  if (currentSort.value.field && currentSort.value.order) {
    filtered = applySortToTasks(filtered, currentSort.value);
  }

  filteredTasks.value = filtered;
  console.log(
    "TaskDataTable - Tasks filtrati finali:",
    filteredTasks.value.length
  );
};

// Watch per sincronizzare con lo store
watch(
  () => taskStore.tasks,
  (newTasks) => {
    console.log("TaskDataTable - Aggiornamento tasks dallo store:", newTasks);
    allTasks.value = Array.isArray(newTasks) ? [...newTasks] : [];
    applyCurrentFilters();
  },
  { deep: true, immediate: true }
);

const applySortToTasks = (
  tasks: Task[],
  sortOptions: { field: string; order: string }
) => {
  const { field, order } = sortOptions;

  if (!field || !order) return tasks;

  const sortedTasks = [...tasks];

  sortedTasks.sort((a, b) => {
    // Ordinamento per priorità
    if (field === "priority") {
      const priorityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };
      const aPriorityKey =
        a.priority.toUpperCase() as keyof typeof priorityOrder;
      const bPriorityKey =
        b.priority.toUpperCase() as keyof typeof priorityOrder;

      const aPriority = priorityOrder[aPriorityKey] || 0;
      const bPriority = priorityOrder[bPriorityKey] || 0;

      return order === "asc" ? aPriority - bPriority : bPriority - aPriority;
    }

    // Ordinamento per data di scadenza
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

// Funzioni esposte al componente padre
const applyFilters = (filters: FilterOptions) => {
  console.log("TaskDataTable - applyFilters chiamata con:", filters);
  // I filtri vengono gestiti automaticamente tramite le props e i watch
  // Questa funzione è mantenuta per compatibilità con MainPage
  applyCurrentFilters();
};

const applySort = (sortOptions: { field: string; order: string }) => {
  console.log("TaskDataTable - applySort chiamata con:", sortOptions);
  currentSort.value = { field: sortOptions.field, order: sortOptions.order };
  applyCurrentFilters();
};

// Lifecycle
onBeforeMount(async () => {
  console.log("TaskDataTable - Caricamento iniziale tasks");
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
  return item.columns.description?.length > expandedCharLimit.value;
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
  confirmTitle.value = t("taskList.modal.editTaskTitle");
  confirmMessage.value = t("taskList.modal.editTaskMessage");
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
        showSnackbar(t("taskList.toast.toastCreate"), "error");
        loadingConfirm.value = false;
        return;
      }

      const parsedDate = parseDate(task.dueDate);
      if (!parsedDate) {
        showSnackbar(t("taskList.toast.toastDate"), "error");
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

// Watch per i filtri dalle props
watch(
  () => props.filters,
  (newFilters) => {
    console.log(
      "TaskDataTable - Ricevuti nuovi filtri dalle props:",
      newFilters
    );
    applyCurrentFilters();
  },
  { deep: true, immediate: true }
);

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
