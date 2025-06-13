<template>
  <v-row align="start">
    <!-- Sidebar sticky -->
    <v-col cols="12" md="3">
      <div class="fixed-sidebar">
        <v-btn
          class="mt-4"
          color="primary"
          prepend-icon="mdi-plus"
          @click="addTaskEmit"
          block
        >
          Aggiungi Task
        </v-btn>
        <v-card class="mt-4" elevation="2">
          <v-card-title>Filtri</v-card-title>
          <v-divider></v-divider>

          <!-- Priority and State panels -->
          <v-expansion-panels multiple variant="accordion">
            <v-expansion-panel
              v-for="filterGroup in filterGroups"
              :key="filterGroup.id"
              :title="filterGroup.title"
            >
              <template #text>
                <v-item-group>
                  <v-item v-for="item in filterGroup.items" :key="item.id">
                    <v-checkbox
                      v-model="item.selected"
                      :label="item.label"
                      hide-details
                      density="compact"
                    ></v-checkbox>
                  </v-item>
                </v-item-group>
              </template>
            </v-expansion-panel>

            <v-expansion-panel title="Data di scadenza">
              <template #text>
                <v-row class="mb-2" align="center">
                  <v-col cols="4">
                    <span class="font-weight-black">Data d'inizio:</span>
                  </v-col>
                  <v-col cols="8">
                    <v-menu
                      v-model="menuStart"
                      :close-on-content-click="false"
                      transition="slide-y-transition"
                    >
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          variant="outlined"
                          :color="dateStart ? 'light-blue-accent-3' : ''"
                          prepend-icon="mdi-calendar"
                          block
                        >
                          {{ dateStart ? formatDate(dateStart) : "Seleziona" }}
                        </v-btn>
                      </template>
                      <v-date-picker
                        v-model="dateStart"
                        :min="today"
                        :max="dateEnd"
                        @update:model-value="onDateChange('start')"
                        color="light-blue-accent-3"
                      />
                    </v-menu>
                  </v-col>
                </v-row>

                <v-row align="center">
                  <v-col cols="4">
                    <span class="font-weight-black">Data di termine:</span>
                  </v-col>
                  <v-col cols="8">
                    <v-menu
                      v-model="menuEnd"
                      :close-on-content-click="false"
                      transition="slide-y-transition"
                    >
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          variant="outlined"
                          :color="dateEnd ? 'light-blue-accent-3' : ''"
                          prepend-icon="mdi-calendar"
                          block
                        >
                          {{ dateEnd ? formatDate(dateEnd) : "Seleziona" }}
                        </v-btn>
                      </template>
                      <v-date-picker
                        v-model="dateEnd"
                        :min="dateStart || today"
                        @update:model-value="onDateChange('end')"
                        color="light-blue-accent-3"
                      />
                    </v-menu>
                  </v-col>
                  <v-btn
                    variant="outlined"
                    color="red"
                    prepend-icon="mdi-delete-outline"
                    class="mb-2 mt-4"
                    block
                    @click.stop="clearDates"
                  >
                    Cancella date
                  </v-btn>
                </v-row>
              </template>
            </v-expansion-panel>

            <!-- Sort by asc/desc & due date panel -->
            <v-expansion-panel title="Ordinamento">
              <template #text>
                <v-row align="center" justify="start">
                  <v-btn
                    variant="outlined"
                    color="primary"
                    @click="toggleSort('dueDate')"
                    class="mb-2 mt-3"
                    block
                  >
                    Per scadenza
                    <v-icon
                      class="ml-2"
                      v-if="
                        sortBy === 'dueDate' &&
                        sortingMethod[0].ascending !== null
                      "
                    >
                      {{
                        sortOrder === "asc" ? "mdi-arrow-up" : "mdi-arrow-down"
                      }}
                    </v-icon>
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    color="primary"
                    @click="toggleSort('priority')"
                    class="mb-2"
                    block
                  >
                    Per priorità
                    <v-icon
                      class="ml-2"
                      v-if="
                        sortBy === 'priority' &&
                        sortingMethod[1].ascending !== null
                      "
                    >
                      {{
                        sortOrder === "asc" ? "mdi-arrow-up" : "mdi-arrow-down"
                      }}
                    </v-icon>
                  </v-btn>
                </v-row>
              </template>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </div>
    </v-col>

    <!-- Task list in slot -->
    <v-col cols="12" md="9">
      <v-expand-transition>
        <v-card variant="flat" v-show="showExpand">
          <v-chip-group column class="mt-2">
            <v-btn
              variant="outlined"
              color="red"
              height="32"
              class="rounded-pill mr-2 text-body-2 my-auto"
              density="comfortable"
              @click.stop="clearFilters"
            >
              <v-icon icon="mdi-delete-outline" size="large"></v-icon>
              Clear filters</v-btn
            >
            <v-fade-transition group>
              <v-chip
                v-for="filter in activeFilters"
                :key="filter.id"
                closable
                @click:close.stop="removeFilter(filter)"
                :class="`bg-${getPriorityColor(filter.label)}`"
              >
                {{ filter.groupTitle }}: {{ filter.label }}
              </v-chip>
            </v-fade-transition>
          </v-chip-group>
        </v-card>
      </v-expand-transition>
      <slot name="taskList"></slot>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { parse, isValid, format } from "date-fns";
import { startOfToday } from "date-fns";

const today = startOfToday();
const emit = defineEmits(["change-filter", "change-sort", "add-task"]);
type PriorityMapping = {
  BASSA: "LOW";
  MEDIA: "MEDIUM";
  ALTA: "HIGH";
  URGENTE: "URGENT";
};

type StatusMapping = {
  "IN ATTESA": "PENDING";
  "IN CORSO": "IN_PROGRESS";
  COMPLETATA: "COMPLETED";
};

const priorityMapping: PriorityMapping = {
  BASSA: "LOW",
  MEDIA: "MEDIUM",
  ALTA: "HIGH",
  URGENTE: "URGENT",
};

const statusMapping: StatusMapping = {
  "IN ATTESA": "PENDING",
  "IN CORSO": "IN_PROGRESS",
  COMPLETATA: "COMPLETED",
};

//-----------------REACTIVE VARIABLES--------------------
const showExpand = ref(false);

const dateStart = ref<Date | null>(null);
const menuStart = ref(false);

const dateEnd = ref<Date | null>(null);
const menuEnd = ref(false);
const sortBy = ref<string>("");
const sortOrder = ref<"asc" | "desc" | "">("");

const priorities = ref([
  { id: 1, label: "BASSA", selected: false },
  { id: 2, label: "MEDIA", selected: false },
  { id: 3, label: "ALTA", selected: false },
  { id: 4, label: "URGENTE", selected: false },
]);
const statuses = ref([
  { id: 1, label: "COMPLETATA", selected: false },
  { id: 2, label: "IN ATTESA", selected: false },
  { id: 3, label: "IN CORSO", selected: false },
]);
const dates = ref([
  { id: 1, label: "Inizio", selected: null as string | null },
  { id: 2, label: "Fine", selected: null as string | null },
]);
const sortingMethod = ref([
  { ascending: null as boolean | null },
  { ascending: null as boolean | null },
]);
const filterGroups = ref([
  { id: 1, title: "Priorità", items: priorities },
  { id: 2, title: "Stato", items: statuses },
  // { id: 3, title: "Date", items: dates },
  // { id: 4, title: "Ordinamento", items: orderButtons },
]);

//----------------------COMPUTED------------------------
const expand = computed(() => activeFilters.value.length);
const activeFilters = computed(() => {
  return filterGroups.value.flatMap((group) =>
    group.items
      .filter((item) => item.selected)
      .map((item) => ({
        ...item,
        groupTitle: group.title, // aggiungi titolo del gruppo
      }))
  );
});

//----------------------WATCHES------------------------
// Sincronizza showExpand con expand, ma con delay all'abbassamento
watch(expand, (newVal, oldVal) => {
  if (newVal) {
    // Se expand diventa true, mostra subito
    showExpand.value = true;
  } else {
    // Se expand diventa false, aspetta prima di nascondere
    setTimeout(() => {
      showExpand.value = false;
    }, 300); // durata animazione approx
  }
});

watch([dateStart, dateEnd], ([start, end]) => {
  if (start && end && start > end) {
    dateEnd.value = null;
  }
  emitFilters();
});

watch(
  filterGroups,
  () => {
    emitFilters();
  },
  { deep: true }
);

//----------------------METHODS------------------------
function addTaskEmit() {
  emit("add-task");
}

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

function removeFilter(filterToRemove: any) {
  for (const group of filterGroups.value) {
    const target = group.items.find((item) => item.id === filterToRemove.id);
    if (target) {
      target.selected = false;
      break;
    }
  }
}

function clearFilters() {
  filterGroups.value.forEach((group) => {
    group.items.forEach((item: any) => {
      item.selected = false;
    });
  });
  dateStart.value = null;
  dateEnd.value = null;
  sortBy.value = "";
  sortOrder.value = "";
  emit("change-sort", { field: "", order: "" });
  emitFilters();
}

function clearDates() {
  dateStart.value = null;
  dateEnd.value = null;
}

function toggleSort(field: string) {
  if (sortBy.value === field) {
    if (sortOrder.value === "asc") {
      sortOrder.value = "desc";
    } else if (sortOrder.value === "desc") {
      sortBy.value = "";
      sortOrder.value = "";
    } else {
      sortOrder.value = "asc";
    }
  } else {
    sortBy.value = field;
    sortOrder.value = "asc";
  }

  // aggiorna sortingMethod
  if (field === "dueDate") {
    sortingMethod.value[0].ascending =
      sortOrder.value === "asc"
        ? true
        : sortOrder.value === "desc"
        ? false
        : null;
    sortingMethod.value[1].ascending = null;
  } else if (field === "priority") {
    sortingMethod.value[1].ascending =
      sortOrder.value === "asc"
        ? true
        : sortOrder.value === "desc"
        ? false
        : null;
    sortingMethod.value[0].ascending = null;
  } else {
    sortingMethod.value[0].ascending = null;
    sortingMethod.value[1].ascending = null;
  }

  emit("change-sort", {
    field: sortBy.value,
    order: sortOrder.value,
  });
  emitFilters();
}

const mapPriority = (label: string): string => {
  const key = label.toUpperCase() as keyof PriorityMapping;
  return priorityMapping[key] || label;
};

const mapStatus = (label: string): string => {
  const key = label.toUpperCase() as keyof StatusMapping;
  return statusMapping[key] || label;
};

function emitFilters() {
  const selectedStatuses = statuses.value
    .filter((s) => s.selected)
    .map((s) => mapStatus(s.label));

  const selectedPriorities = priorities.value
    .filter((p) => p.selected)
    .map((p) => mapPriority(p.label));

  emit("change-filter", {
    statuses: selectedStatuses,
    priorities: selectedPriorities,
    dueDateStart: dateStart.value
      ? format(dateStart.value, "dd-MM-yyyy")
      : null,
    dueDateEnd: dateEnd.value ? format(dateEnd.value, "dd-MM-yyyy") : null,
  });
}

function onDateChange(which: "start" | "end") {
  if (which === "start" && dateStart.value) {
    const parsed = new Date(dateStart.value);
    if (isValid(parsed)) {
      dateStart.value = parsed;
    }
    menuStart.value = false;
  } else if (which === "end" && dateEnd.value) {
    const parsed = new Date(dateEnd.value);
    if (isValid(parsed)) {
      dateEnd.value = parsed;
    }
    menuEnd.value = false;
  }

  if (dateStart.value && dateEnd.value && dateStart.value > dateEnd.value) {
    if (which === "start") dateEnd.value = null;
    else dateStart.value = null;
  }
}

const formatDate = (date: Date | null): string => {
  return date && isValid(date) ? format(date, "dd-MM-yyyy") : "";
};

const parseDate = (dateString: string): Date | null => {
  const parsed = parse(dateString, "dd-MM-yyyy", new Date());
  return isValid(parsed) ? parsed : null;
};

const getDateOnly = (str: string | null): string | undefined => {
  if (!str) return undefined;
  const parsed = parseDate(str);
  return parsed && isValid(parsed) ? format(parsed, "yyyy-MM-dd") : undefined;
};
</script>

<style scoped>
.fixed-sidebar {
  position: fixed;
  top: calc(var(--v-layout-top, 0px) - 1px);
  left: 0;
  width: 25%;
  padding: 14px;
  height: calc(100vh - var(--v-layout-top, 0px) - 16px);
  overflow-y: auto;
  background-color: transparent;
  z-index: 10;
}

.offset-content {
  margin-left: 250px;
  padding: 16px;
}
</style>
