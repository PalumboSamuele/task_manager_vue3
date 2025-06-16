<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card>
      <v-card-title>{{ dialogTitle }}</v-card-title>

      <v-card-text v-if="task">
        <v-row dense>
          <v-col cols="12">
            <v-text-field
              label="Titolo Task"
              v-model="localTask.title"
              :readonly="isViewMode"
              variant="outlined"
              color="deep-purple-accent-3"
              required
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              label="Descrizione"
              v-model="localTask.description"
              :readonly="isViewMode"
              variant="outlined"
              color="deep-purple-accent-3"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              label="Priorità"
              :items="['LOW', 'MEDIUM', 'HIGH', 'URGENT']"
              v-model="localTask.priority"
              :readonly="isViewMode"
              variant="outlined"
              color="deep-purple-accent-3"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              label="Stato"
              :items="['PENDING', 'IN_PROGRESS', 'COMPLETED']"
              v-model="localTask.status"
              :readonly="isViewMode"
              variant="outlined"
              color="deep-purple-accent-3"
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
                  v-model="localTask.dueDate"
                  v-bind="menuProps"
                  :readonly="isViewMode"
                  variant="outlined"
                  color="deep-purple-accent-3"
                  prepend-inner-icon="mdi-calendar"
                />
              </template>
              <v-date-picker
                v-if="!isViewMode"
                v-model="datePickerValue"
                :min="today"
                @update:model-value="updateDueDate"
                color="deep-purple-accent-3"
              />
            </v-menu>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn text="Chiudi" color="red-accent-4" @click="close" />
        <v-btn
          v-if="isViewMode"
          text="Modifica"
          color="light-blue-accent-4"
          variant="tonal"
          @click="enableEditMode"
        />
        <v-btn
          v-else
          text="Salva"
          color="light-blue-accent-4"
          variant="tonal"
          @click="save"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { parse, format, isValid, startOfToday } from "date-fns";
import type { Task } from "@/components/stores/tasks/tasksStore";

// Props
const props = defineProps<{
  modelValue: boolean;
  task: Partial<Task> | null;
  mode: "view" | "edit" | "create";
}>();

// Emits
const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "save", task: Partial<Task>): void;
  (e: "edit"): void;
}>();

// Local states
const dialog = ref(props.modelValue);
const localTask = ref<Partial<Task>>({});
const isViewMode = ref(props.mode === "view");
const dateMenu = ref(false);
const datePickerValue = ref<Date | null>(null);
const today = startOfToday();

// Sync prop to local dialog
watch(
  () => props.modelValue,
  (val) => (dialog.value = val)
);
watch(dialog, (val) => emit("update:modelValue", val));

// Sync prop to local task
watch(
  () => props.task,
  (task) => {
    localTask.value = { ...task };
    datePickerValue.value = parseDate(task?.dueDate);
  },
  { immediate: true }
);

watch(
  () => props.mode,
  (mode) => {
    isViewMode.value = mode === "view";
  },
  { immediate: true }
);

// Title
const dialogTitle = computed(() =>
  props.mode === "view"
    ? "Dettagli Task"
    : props.mode === "edit"
    ? "Modifica Task"
    : "Crea Nuova Task"
);

// Handlers
function updateDueDate(date: Date | null) {
  localTask.value.dueDate = formatDate(date);
  dateMenu.value = false;
}

function close() {
  dialog.value = false;
}

function enableEditMode() {
  isViewMode.value = false;
  emit("edit");
}

function save() {
  emit("save", localTask.value);
}

// Utils
function parseDate(dateStr?: string) {
  if (!dateStr) return null;
  const parsed = parse(dateStr, "dd-MM-yyyy", new Date());
  return isValid(parsed) ? parsed : null;
}

function formatDate(date: Date | null) {
  return date && isValid(date) ? format(date, "dd-MM-yyyy") : "";
}
</script>
