<template>
  <v-card
    variant="outlined"
    class="my-3 d-flex flex-column"
    :class="[`bg-${priorityColor}`]"
    rounded="lg"
    hover
    @click.stop="emitView"
  >
    <template #title>
      <div class="d-flex justify-space-between">
        <div class="d-block text-truncate text-grey-darken-4">{{ title }}</div>
        <v-icon
          class="drag-handle mr-2 cursor-grab"
          icon="mdi-drag-variant"
          size="small"
        ></v-icon>
      </div>
    </template>

    <v-card-text class="d-flex flex-column">
      <div>
        <div class="text-subtitle-2 mb-2 text-grey-lighten-3">
          <span class="d-block">
            <strong> {{ $t("baseTask.priority") }}</strong>
            {{ priorityTranslated }}
          </span>
          <span class="d-block">
            <strong>{{ $t("baseTask.status") }}</strong> {{ statusTranslated }}
          </span>
        </div>

        <div class="d-block text-truncate mb-2 text-grey-lighten-3">
          <strong>{{ $t("baseTask.description") }}</strong> {{ description }}
        </div>
        <div class="text-caption text-grey-lighten-3">
          <span>
            <strong>{{ $t("baseTask.completition") }}</strong> {{ dueDate }}
          </span>
        </div>
      </div>

      <div class="mt-4">
        <div class="d-flex flex-wrap justify-space-between">
          <v-btn
            color="indigo-darken-1"
            class="rounded-pill"
            @click.stop="emitEdit"
          >
            <v-icon icon="mdi-pencil" start></v-icon>
            <span class="button-text">{{ $t("baseTask.button.modify") }}</span>
          </v-btn>

          <v-btn
            color="red-darken-4"
            class="rounded-pill"
            @click.stop="emitDelete"
          >
            <v-icon icon="mdi-delete"></v-icon>
            <span class="button-text"
              >&nbsp; {{ $t("baseTask.button.delete") }}</span
            >
          </v-btn>
        </div>
        <p class="mt-3 text-white text-caption">
          {{ $t("baseTask.createdOn") }} {{ createdDate }}
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useDisplay } from "vuetify";
import { defineEmits, defineProps } from "vue";

import { useI18n } from "vue-i18n";
const { locale, t } = useI18n();

const props = defineProps({
  taskId: String,
  title: String,
  description: String,
  status: String,
  priority: String,
  dueDate: String,
  createdDate: String,
});

const emit = defineEmits(["callDelete", "editTask", "viewTask"]);

const prioritiesMapENtoIT = {
  LOW: "BASSA",
  MEDIUM: "MEDIA",
  HIGH: "ALTA",
  URGENT: "URGENTE",
} as const;

const statusesMapENtoIT = {
  IN_PROGRESS: "IN CORSO",
  COMPLETED: "COMPLETATA",
  PENDING: "IN ATTESA",
} as const;

const priorityTranslated = computed(() => {
  return locale.value !== "en"
    ? prioritiesMapENtoIT[props.priority as keyof typeof prioritiesMapENtoIT] ??
        props.priority
    : props.priority;
});

const statusTranslated = computed(() => {
  return locale.value !== "en"
    ? statusesMapENtoIT[props.status as keyof typeof statusesMapENtoIT] ??
        props.status
    : props.status;
});

const priorityColor = computed(() => {
  switch (props.priority) {
    case "LOW":
      return "light-green-darken-1";
    case "MEDIUM":
      return "orange-darken-1";
    case "HIGH":
      return "red-lighten-1";
    case "URGENT":
      return "purple-lighten-1";
    default:
      return "white";
  }
});

function emitDelete() {
  emit("callDelete", props.taskId);
}

function emitEdit() {
  emit("editTask", props.taskId);
}

function emitView() {
  emit("viewTask", props.taskId);
}
</script>
