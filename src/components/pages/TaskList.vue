<template>
  <div :class="{ 'blurred-background': dialog }">
    <v-container fluid>
      <v-row justify="space-evenly">
        <Draggable
          v-model="tasks"
          item-key="id"
          handle=".drag-handle"
          class="d-flex flex-wrap"
        >
          <template #item="{ element: task }">
            <v-col :cols="columns">
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
      <v-dialog
        v-model="dialog"
        max-width="600"
      >
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
import { shallowRef, ref, computed, watch } from "vue"; // Importa 'watch'

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  description: string;
  dueDate: string; 
  createdDate: string;
}

const dialog = shallowRef(false); 
const selectedTask = ref<Task | null>(null); 
const isViewMode = ref(false); 

const display = useDisplay(); 

const dateMenu = ref(false); 
const datePickerValue = ref<Date | null>(null); 

// --- Computed Properties ---
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

const dialogTitle = computed(() => {
  return isViewMode.value ? "Dettagli Task" : "Modifica Task";
});

// Funzione per formattare un oggetto Date (o null) in una stringa 'DD-MM-YYYY'
const formatDate = (date: Date | null): string => {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // I mesi sono 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Funzione per parsare una stringa 'DD-MM-YYYY' in un oggetto Date (o null)
const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  const parts = dateString.split("-");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Mesi 0-indexed
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    // Valida per evitare date invalide (es. 31 febbraio)
    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {
      return date;
    }
  }
  return null;
};

const tasks = ref<Task[]>([
  {
    id: "task1",
    title: "TASK VUETIFY 1",
    priority: "LOW",
    status: "PENDING",
    description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
    dueDate: "12-03-2026",
    createdDate: "10-06-2025",
  },
  {
    id: "task_2",
    title: "TASK VUETIFY 2",
    priority: "MEDIUM",
    status: "PENDING",
    description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
    dueDate: "12-03-2026",
    createdDate: "10-06-2025",
  },
  {
    id: "task_3",
    title: "TASK VUETIFY 3",
    priority: "HIGH",
    status: "PENDING",
    description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
    dueDate: "12-03-2026",
    createdDate: "10-06-2025",
  },
  {
    id: "task_4",
    title: "TASK VUETIFY 4",
    priority: "URGENT",
    status: "PENDING",
    description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
    dueDate: "12-03-2026",
    createdDate: "10-06-2025",
  },
  {
    id: "task_5",
    title: "TASK VUETIFY 5",
    priority: "LOW",
    status: "PENDING",
    description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
    dueDate: "12-03-2026",
    createdDate: "10-06-2025",
  },
  {
    id: "task_6",
    title: "TASK VUETIFY 6",
    priority: "MEDIUM",
    status: "PENDING",
    description: "Ciao a tutti, sono una task creata usando Vuetify3 DX",
    dueDate: "12-03-2026",
    createdDate: "10-06-2025",
  },
]);


watch(
  () => selectedTask.value?.dueDate,
  (newVal) => {
    if (selectedTask.value && newVal !== undefined) {
      datePickerValue.value = parseDate(newVal);
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
  const task = tasks.value.find((t) => t.id === taskId);
  if (task) {
    selectedTask.value = { ...task }; 
    isViewMode.value = true; 
    dialog.value = true; 
  }
};

const editTask = (taskId: string) => {
  const task = tasks.value.find((t) => t.id === taskId);
  if (task) {
    selectedTask.value = { ...task }; 
    isViewMode.value = false; 
    dialog.value = true; 
  }
};

const enableEditMode = () => {
  isViewMode.value = false; 
};

const deleteTask = (taskId: string) => {
  if (confirm("Sei sicuro di voler eliminare questa task?")) {
    tasks.value = tasks.value.filter((t) => t.id !== taskId);
  }
};

const closeDialog = () => {
  dialog.value = false; 
  selectedTask.value = null;
  datePickerValue.value = null; 
  isViewMode.value = false; 
};

const saveTask = () => {
  if (selectedTask.value) {
    const index = tasks.value.findIndex((t) => t.id === selectedTask.value!.id);
    if (index !== -1) {
      tasks.value[index] = { ...selectedTask.value }; 
    }
  }
  closeDialog(); 
};
</script>

<style scoped>
.blurred-background {
  filter: blur(2px); 
  transition: filter 0.3s ease-in-out; 
}


</style>