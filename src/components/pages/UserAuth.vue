<template>
  <v-main>
    <div>
      <v-card
        class="mx-auto pa-12 pb-6"
        elevation="10"
        max-width="480"
        rounded="lg"
      >
        <v-card-title class="text-h5 text-center mb-4">
          Entra nel tuo account
        </v-card-title>

        <v-form @submit.prevent="submitForm">
          <div class="text-subtitle-1 text-medium-emphasis">Username</div>

          <v-text-field
            v-model="username.value.value"
            density="compact"
            placeholder="Username"
            inner-icon="mdi-email-outline"
            variant="outlined"
            :error-messages="username.errorMessage.value"
          ></v-text-field>

          <div
            class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between"
          >
            Password
          </div>

          <v-text-field
            v-model="password.value.value"
            :error-messages="password.errorMessage.value"
            :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
            :type="visible ? 'text' : 'password'"
            density="compact"
            placeholder="Enter your password"
            inner-icon="mdi-lock-outline"
            variant="outlined"
            @click:append-inner="visible = !visible"
          ></v-text-field>

          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mb-4"
            density="compact"
          >
            {{ error }}
          </v-alert>

          <v-btn
            class="mb-8 mt-15"
            color="blue"
            size="large"
            variant="tonal"
            block
            type="submit"
            :loading="isLoading"
            :disabled="isLoading"
          >
            Login
          </v-btn>

          <h4 class="text-subtitle-1 text-center mt-15 mb-1 pt-8">
            Sign up if you don't have an account!
          </h4>

          <v-card-text class="text-center">
            <router-link to="/signup" class="text-blue text-decoration-none">
              SignUp now <v-icon icon="mdi-chevron-right"></v-icon>
            </router-link> </v-card-text
        ></v-form>
      </v-card>
    </div>
  </v-main>
</template>
<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/components/stores/auth/authStore";
import { useField, useForm } from "vee-validate";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const isLoading = ref(false);
const error = ref(null);
const visible = ref(false);

const { handleSubmit } = useForm({
  validationSchema: {
    username(value) {
      if (!value) return "Username is required.";
      if (value.length < 3) return "Username must be at least 3 characters.";
      if (value.length > 8) return "Username must be at most 8 characters.";
      return true;
    },
    password(value) {
      if (!value) return "Password is required.";
      if (value.length < 8) return "Password must be at least 8 characters.";
      if (value.length > 20) return "Password must be at most 20 characters.";
      return true;
    },
  },
});

const username = useField("username");
const password = useField("password");

const submitForm = handleSubmit(async (values) => {
  error.value = null; // Resetta gli errori precedenti
  isLoading.value = true; // Inizia il caricamento

  const formPayload = {
    username: values.username,
    password: values.password,
  };

  try {
    await authStore.login({
      username: formPayload.username,
      password: formPayload.password,
    });
    router.replace(`/users/${authStore.userId}/tasks/`);
  } catch (err) {
    console.error("Errore durante il login:", err);

    if (err.response) {
      if (err.response.status === 404) {
        error.value =
          "L'endpoint di login non è stato trovato. Controlla l'URL della tua API nel backend.";
      } else if (err.response.status === 401 || err.response.status === 403) {
        error.value = "Credenziali non valide. Verifica username e password.";
      } else {
        error.value = `Errore del server: ${err.response.status} - ${
          err.response.data.message || err.message
        }`;
      }
    } else if (err.request) {
      error.value =
        "Nessuna risposta dal server. Il backend potrebbe non essere in esecuzione o non raggiungibile.";
    } else {
      error.value =
        err.message || "Si è verificato un errore inatteso durante il login.";
    }
  } finally {
    isLoading.value = false; // Ferma lo stato di caricamento
  }
});
</script>
