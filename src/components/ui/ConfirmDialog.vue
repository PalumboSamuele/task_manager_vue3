<template>
  <v-dialog v-model="dialogVisible" max-width="400">
    <v-card class="pa-4 rounded-xl">
      <v-card-title class="d-flex align-center text-h6">
        <v-icon class="me-2" color="primary">mdi-help-circle-outline</v-icon>
        {{ title }}
      </v-card-title>

      <v-card-text class="text-body-1 text-high-emphasis">
        {{ message }}
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-card-actions class="justify-end pt-4">
          <v-btn
            variant="elevated"
            color="error"
            @click="onCancel"
            :disabled="loading"
          >
            Annulla
          </v-btn>
          <v-btn
            variant="elevated"
            color="light-blue-accent-3"
            @click="onConfirm"
            :loading="loading"
            class="ms-2"
          >
            Conferma
          </v-btn>
        </v-card-actions>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

// Props
const props = defineProps<{
  modelValue: boolean;
  title: string;
  message: string;
  loading: boolean;
}>();

// Emits
const emits = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "cancel"): void;
  (e: "confirm"): void;
}>();

// Variabile interna per controllare il dialog
const dialogVisible = ref(props.modelValue);

// Sincronizza la prop -> variabile interna
watch(
  () => props.modelValue,
  (newVal) => {
    dialogVisible.value = newVal;
  }
);

// Sincronizza la variabile interna -> prop nel parent
watch(dialogVisible, (newVal) => {
  emits("update:modelValue", newVal);
});

// Azioni
const onCancel = () => {
  emits("cancel");
  dialogVisible.value = false;
};

const onConfirm = () => {
  emits("confirm");
};
</script>
