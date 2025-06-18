<template>
  <v-row align="start">
    <!-- Sidebar per desktop -->
    <v-col cols="12" md="3" v-if="!isMobile">
      <div class="fixed-sidebar">
        <v-row>
          <v-col cols="12" lg="5" class="pr-lg-0">
            <v-btn
              class="mt-4"
              color="secondary"
              @click="
                modeGrid
                  ? emitChangeDataViewMode('data-table')
                  : emitChangeDataViewMode('grid')
              "
              block
            >
              {{ modeGrid ? t("taskFilter.table") : t("taskFilter.grid") }}
              <v-icon
                v-if="modeGrid"
                icon="mdi-table-of-contents"
                size="x-large"
                end
              ></v-icon>
              <v-icon v-else icon="mdi-dots-grid" size="x-large" end></v-icon>
            </v-btn>
          </v-col>
          <v-col cols="12" md="12" lg="7">
            <v-btn
              class="mt-lg-4"
              color="primary"
              append-icon="mdi-plus"
              @click="addTaskEmit"
              block
            >
              {{ $t("taskFilter.addTask") }}
            </v-btn>
          </v-col>
        </v-row>

        <h6 class="mt-6 mb-0 ml-1 text-h6 font-weight-medium text-justify">
          {{ $t("taskFilter.filterHeaderMessage") }}
        </h6>
        <v-card class="mt-1" elevation="2">
          <!-- Priority and State panels -->
          <v-expansion-panels multiple variant="accordion">
            <v-expansion-panel
              v-for="filterGroup in filterGroups"
              :key="filterGroup.id"
              :title="filterGroup.title"
            >
              <v-expansion-panel-text>
                <v-checkbox
                  v-for="item in filterGroup.items"
                  :key="item.key"
                  v-model="item.selected"
                  :label="item.label"
                  hide-details
                  density="compact"
                ></v-checkbox>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel>
              <template #title>
                {{ $t("taskFilter.dueDate") }}
              </template>
              <template #text>
                <v-row class="mb-2" align="center">
                  <v-col cols="4">
                    <span class="font-weight-black">{{
                      $t("taskFilter.startDate")
                    }}</span>
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
                          append-icon="mdi-calendar"
                          block
                        >
                          {{
                            dateStart
                              ? formatDate(dateStart)
                              : $t("taskFilter.dateLabel")
                          }}
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
                    <span class="font-weight-black">{{
                      $t("taskFilter.endDate")
                    }}</span>
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
                          append-icon="mdi-calendar"
                          block
                        >
                          {{
                            dateEnd
                              ? formatDate(dateEnd)
                              : $t("taskFilter.dateLabel")
                          }}
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
                    append-icon="mdi-delete-outline"
                    class="mb-2 mt-4"
                    block
                    @click.stop="clearDates"
                  >
                    {{ $t("taskFilter.removeDate") }}
                  </v-btn>
                </v-row>
              </template>
            </v-expansion-panel>

            <!-- Sort by asc/desc & due date panel -->
            <v-expansion-panel>
              <template #title>
                {{ $t("taskFilter.orderBy") }}
              </template>
              <template #text>
                <v-row align="center" justify="start">
                  <v-btn
                    variant="outlined"
                    :color="
                      sortingMethod[0].ascending !== null ? 'primary' : ''
                    "
                    @click="toggleSort('dueDate')"
                    class="mb-2 mt-3"
                    block
                    >{{ $t("taskFilter.sortByDueDate") }}
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
                    :color="
                      sortingMethod[1].ascending !== null ? 'primary' : ''
                    "
                    @click="toggleSort('priority')"
                    class="mb-2"
                    block
                  >
                    {{ $t("taskFilter.sortByPriority") }}
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
                  <v-btn
                    variant="outlined"
                    color="red"
                    append-icon="mdi-arrow-u-left-top"
                    class="mb-2 mt-10"
                    block
                    @click.stop="clearOrderings"
                  >
                    {{ $t("taskFilter.resetSort") }}
                  </v-btn>
                </v-row>
              </template>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </div>
    </v-col>

    <!-- Navigation Drawer per mobile -->
    <v-navigation-drawer
      v-if="isMobile"
      v-model="mobileDrawer"
      temporary
      location="left"
      width="280"
      class="mobile-filter-drawer"
    >
      <v-card flat class="pa-4">
        <div class="d-flex justify-space-between align-center mb-4">
          <h6 class="text-h6 font-weight-bold">
            {{ $t("taskFilter.filterHeaderMessage") }}
          </h6>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="mobileDrawer = false"
          />
        </div>

        <v-btn
          color="primary"
          append-icon="mdi-plus"
          @click="addTaskEmit"
          class="mb-5"
        >
          {{ $t("taskFilter.addTask") }}
        </v-btn>

        <!-- sezione filtri in versione mobile-->
        <v-expansion-panels multiple variant="accordion">
          <v-expansion-panel
            v-for="filterGroup in filterGroups"
            :key="filterGroup.id"
            :title="filterGroup.title"
          >
            <v-expansion-panel-text>
              <v-checkbox
                v-for="item in filterGroup.items"
                :key="item.id"
                v-model="item.selected"
                :label="item.label"
                hide-details
                density="compact"
              ></v-checkbox>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <template #title>
              {{ $t("taskFilter.dueDate") }}
            </template>
            <template #text>
              <v-row class="mb-2" align="center">
                <v-col cols="4">
                  <span class="font-weight-black">{{
                    $t("taskFilter.startDate")
                  }}</span>
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
                        append-icon="mdi-calendar"
                        block
                      >
                        {{
                          dateStart
                            ? formatDate(dateStart)
                            : $t("taskFilter.dateLabel")
                        }}
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
                  <span class="font-weight-black">{{
                    $t("taskFilter.endDate")
                  }}</span>
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
                        append-icon="mdi-calendar"
                        block
                      >
                        {{
                          dateEnd
                            ? formatDate(dateEnd)
                            : $t("taskFilter.dateLabel")
                        }}
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
                  append-icon="mdi-delete-outline"
                  class="mb-2 mt-4"
                  block
                  @click.stop="clearDates"
                >
                  {{ $t("taskFilter.removeDate") }}
                </v-btn>
              </v-row>
            </template>
          </v-expansion-panel>

          <!-- Sort by asc/desc & due date panel -->
          <v-expansion-panel>
            <template #title>
              {{ $t("taskFilter.orderBy") }}
            </template>
            <template #text>
              <v-row align="center" justify="start">
                <v-btn
                  variant="outlined"
                  :color="sortingMethod[0].ascending !== null ? 'primary' : ''"
                  @click="toggleSort('dueDate')"
                  class="mb-2 mt-3"
                  block
                  >{{ $t("taskFilter.sortByDueDate") }}
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
                  :color="sortingMethod[1].ascending !== null ? 'primary' : ''"
                  @click="toggleSort('priority')"
                  class="mb-2"
                  block
                >
                  {{ $t("taskFilter.sortByPriority") }}
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
                <v-btn
                  variant="outlined"
                  color="red"
                  append-icon="mdi-arrow-u-left-top"
                  class="mb-2 mt-10"
                  block
                  @click.stop="clearOrderings"
                >
                  {{ $t("taskFilter.resetSort") }}
                </v-btn>
              </v-row>
            </template>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card>
    </v-navigation-drawer>

    <v-col :cols="isMobile ? 12 : 12" :md="isMobile ? 12 : 9">
      <!-- bottone filtri per mobile -->
      <v-card v-if="isMobile" variant="flat" color="transparent">
        <v-card-text class="py-2 mb-1">
          <div class="d-flex flex-column flex-sm-row">
            <v-btn
              color="primary"
              append-icon="mdi-filter-variant"
              @click="mobileDrawer = true"
              variant="tonal"
              class="flex-grow-1 flex-sm-grow-0 mb-4 mr-sm-4"
            >
              {{ $t("taskFilter.mobileTitle") }}
            </v-btn>
            <v-btn
              color="primary"
              append-icon="mdi-plus"
              @click="addTaskEmit"
              variant="elevated"
              class="flex-grow-1 flex-sm-grow-0"
            >
              {{ $t("taskFilter.addTask") }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <v-expand-transition>
        <v-card
          variant="flat"
          v-show="showExpand"
          class="pl-4"
          :class="{
            'sticky-chip-group border-b-md': scrolling,
            'mt-2': !scrolling,
          }"
        >
          <v-chip-group column>
            <v-btn
              variant="outlined"
              color="red"
              height="32"
              class="rounded-pill mr-2 text-body-2 my-auto"
              density="comfortable"
              @click.stop="clearFilters"
            >
              <v-icon icon="mdi-delete-outline" size="large"></v-icon>
              {{ $t("taskFilter.clearFilter") }}</v-btn
            >
            <v-fade-transition group>
              <v-chip
                v-for="filter in activeFilters"
                :key="filter.id"
                closable
                @click:close.stop="removeFilter(filter)"
                :class="`bg-${getPriorityColor(filter.label)}`"
              >
                {{ filter.groupTitle }} {{ filter.label }}
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
// TASKFILTER

import { parse, isValid, format, startOfToday } from "date-fns";
import { useTaskStore } from "@/components/stores/tasks/tasksStore";
import { useI18n } from "vue-i18n";
import { useDisplay } from "vuetify";

const { t } = useI18n();
const display = useDisplay();

const today = startOfToday();
const emit = defineEmits([
  "change-filter",
  "change-sort",
  "add-task",
  "change-view",
]);
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

const taskStore = useTaskStore();

//-----------------REACTIVE VARIABLES--------------------
const showExpand = ref(false);
const scrolling = ref(false);
const mobileDrawer = ref(false);

const dateStart = ref<Date | null>(null);
const menuStart = ref(false);

const dateEnd = ref<Date | null>(null);
const menuEnd = ref(false);
const sortBy = ref<string>("");
const sortOrder = ref<"asc" | "desc" | "">("");

const priorities = ref([
  {
    id: 1,
    key: "LOW",
    label: t("taskFilter.priorityFilter.low"),
    selected: false,
  },
  {
    id: 2,
    key: "MEDIUM",
    label: t("taskFilter.priorityFilter.medium"),
    selected: false,
  },
  {
    id: 3,
    key: "HIGH",
    label: t("taskFilter.priorityFilter.high"),
    selected: false,
  },
  {
    id: 4,
    key: "URGENT",
    label: t("taskFilter.priorityFilter.urgent"),
    selected: false,
  },
]);
const statuses = ref([
  {
    id: 1,
    key: "COMPLETED",
    label: t("taskFilter.statusFilter.completed"),
    selected: false,
  },
  {
    id: 2,
    key: "PENDING",
    label: t("taskFilter.statusFilter.pending"),
    selected: false,
  },
  {
    id: 3,
    key: "IN_PROGRESS",
    label: t("taskFilter.statusFilter.inProgress"),
    selected: false,
  },
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
  { id: 1, title: t("taskFilter.priority"), items: priorities },
  { id: 2, title: t("taskFilter.status"), items: statuses },
  // { id: 3, title: "Date", items: dates },
  // { id: 4, title: "Ordinamento", items: orderButtons },
]);

//----------------------COMPUTED------------------------
const isMobile = computed(() => display.smAndDown.value);
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
const modeGrid = computed(() => taskStore.visualizationMode === "grid");

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
    }, 75); // durata animazione approx
  }
});

watch([dateStart, dateEnd], ([start, end]) => {
  if (start && end && start > end) {
    dateEnd.value = null;
  }
  emitFilters();
});

watch(
  () =>
    filterGroups.value
      .map((group) => group.items.map((item) => item.selected))
      .flat(),
  () => {
    console.log("TaskFilter - Cambio nei filtri rilevato");
    emitFilters();
  },
  { deep: true }
);

//----------------------METHODS------------------------
onMounted(() => {
  const SCROLL_THRESHOLD = 5;
  const onScroll = () => {
    scrolling.value = window.scrollY > SCROLL_THRESHOLD;
  };
  window.addEventListener("scroll", onScroll);
  onScroll();
  onBeforeUnmount(() => {
    window.removeEventListener("scroll", onScroll);
  });
});

function addTaskEmit() {
  emit("add-task");
  // Chiudi il drawer mobile dopo aver aggiunto la task
  if (isMobile.value) {
    mobileDrawer.value = false;
  }
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
  let emitTimeout = null;
  // Cancella il timeout precedente se esiste
  if (emitTimeout) {
    clearTimeout(emitTimeout);
  }

  // Crea un nuovo timeout per il debouncing
  emitTimeout = setTimeout(() => {
    const selectedStatuses = statuses.value
      .filter((s) => s.selected)
      .map((s) => s.key);

    const selectedPriorities = priorities.value
      .filter((p) => p.selected)
      .map((p) => p.key);

    // Debug log per verificare i filtri emessi
    console.log("TaskFilter - Emettendo filtri:", {
      statuses: selectedStatuses,
      priorities: selectedPriorities,
      dueDateStart: dateStart.value
        ? format(dateStart.value, "dd-MM-yyyy")
        : null,
      dueDateEnd: dateEnd.value ? format(dateEnd.value, "dd-MM-yyyy") : null,
    });

    emit("change-filter", {
      statuses: selectedStatuses,
      priorities: selectedPriorities,
      dueDateStart: dateStart.value
        ? format(dateStart.value, "dd-MM-yyyy")
        : null,
      dueDateEnd: dateEnd.value ? format(dateEnd.value, "dd-MM-yyyy") : null,
    });
  }, 100); // Debounce di 100ms
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

function clearOrderings() {
  sortingMethod.value.forEach((method) => {
    method.ascending = null;
  });
}

function emitChangeDataViewMode(mode: "grid" | "data-table") {
  emit("change-view", mode);
}
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

.sticky-chip-group {
  position: sticky;
  top: calc(var(--v-layout-top, 64px) - 8px);
  z-index: 10;
  background: white;
  padding: 2rem 0 0 0;
}

.offset-content {
  margin-left: 250px;
  padding: 16px;
}

.mobile-filter-drawer {
  z-index: 2000;
}

@media (max-width: 960px) {
  .fixed-sidebar {
    display: none;
  }
}
</style>
