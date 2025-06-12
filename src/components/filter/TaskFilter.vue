<template>
  <v-row align="start">
    <!-- Sidebar sticky -->
    <v-col cols="12" md="3" class="mt-4">
      <div class="fixed-sidebar">
        <v-card class="mb-4" elevation="2">
          <v-card-title>Filtri</v-card-title>
          <v-divider></v-divider>
          <v-card elevation="0" v-if="activeFilters.length" class="mb-3">
            <v-card-text>
              <v-chip-group column>
                <v-chip
                  v-for="filter in activeFilters"
                  :key="filter.id"
                  closable
                  @click:close.stop="removeFilter(filter)"
                  :class="`bg-${getPriorityColor(filter.label)}`"
                >
                  {{ filter.groupTitle }}: {{ filter.label }}
                </v-chip>
              </v-chip-group>
            </v-card-text>
          </v-card>
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
          </v-expansion-panels>
        </v-card>
      </div>
    </v-col>

    <!-- Task list in slot -->
    <v-col cols="12" md="9">
      <slot name="taskList"></slot>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
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

const filters = ref([
  { id: 1, label: "Alta priorità", selected: false },
  { id: 2, label: "In scadenza", selected: false },
  { id: 3, label: "Completate", selected: false },
]);

const filterGroups = ref([
  { id: 1, title: "Priorità", items: priorities },
  { id: 2, title: "Stato", items: statuses },
  // { id: 3, title: "Date", items: dates },
  // { id: 4, title: "Ordinamento", items: orderButtons },
]);

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

// const filteredTasks = computed(() => {
//   // Per semplicità, ritorna tutte le task
//   return tasks.value;
// });

function removeFilter(filterToRemove: any) {
  for (const group of filterGroups.value) {
    const target = group.items.find((item) => item.id === filterToRemove.id);
    if (target) {
      target.selected = false;
      break;
    }
  }
}
</script>

<style scoped>
.fixed-sidebar {
  position: fixed;
  top: 8.15%; /* altezza dell'app-bar */
  left: 0;
  width: 25%;
  padding: 16px;
  height: calc(100vh - 108px);
  overflow-y: auto;
  background-color: white;
  z-index: 10;
}

.offset-content {
  margin-left: 250px;
  padding: 16px;
}
</style>
