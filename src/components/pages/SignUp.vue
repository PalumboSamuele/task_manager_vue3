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
          Crea il tuo Account
        </v-card-title>

        <v-form @submit.prevent="submitForm">
          <div class="text-subtitle-1 text-medium-emphasis">Email</div>
          <v-text-field
            v-model="email.value.value"
            density="compact"
            placeholder="name@example.com"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            :error-messages="email.errorMessage.value"
            @blur="email.handleBlur"
          ></v-text-field>

          <div class="text-subtitle-1 text-medium-emphasis">Username</div>
          <v-text-field
            v-model="username.value.value"
            density="compact"
            placeholder="Username"
            prepend-inner-icon="mdi-account-outline"
            variant="outlined"
            :error-messages="username.errorMessage.value"
            @blur="username.handleBlur"
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
            prepend-inner-icon="mdi-lock-outline"
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
            Signup
          </v-btn>
        </v-form>

        <h4 class="text-subtitle-1 text-center mt-15 mb-1 pt-8">
          Sei già registrato? Accedi!
        </h4>

        <v-card-text class="text-center">
          <router-link to="/login" class="text-blue text-decoration-none">
            Accedi ora <v-icon icon="mdi-chevron-right"></v-icon>
          </router-link>
        </v-card-text>
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

const isLoading = ref(false); // Per lo stato di caricamento del pulsante
const error = ref(null);
const visible = ref(false); 

const { handleSubmit } = useForm({
  validationSchema: {
    email(value) {
      if (!value) return "L'email è richiesta."; 
      if (!/^[a-z0-9.-]+@[a-z.-]+\.[a-z]+$/i.test(value))
        return "L'email non è valida.";
      return true;
    },
    username(value) {
      if (!value) return "Il nome utente è richiesto."; 
      if (value.length < 3)
        return "Il nome utente deve avere almeno 3 caratteri.";
      if (value.length > 8)
        return "Il nome utente deve avere al massimo 8 caratteri.";
      return true;
    },
    password(value) {
      if (!value) return "La password è richiesta.";
      if (value.length < 8) return "La password deve avere almeno 8 caratteri.";
      if (value.length > 20)
        return "La password deve avere al massimo 20 caratteri.";
      return true;
    },
  },
});

const email = useField("email");
const username = useField("username");
const password = useField("password");

const submitForm = handleSubmit(async (values) => {
  error.value = null;
  isLoading.value = true;

  const formPayload = {
    email: values.email,
    username: values.username,
    password: values.password,
  };

  try {
    await authStore.register(formPayload);
    router.replace("/login"); // Reindirizza l'utente alla pagina di login dopo la registrazione
  } catch (err) {
    error.value = err.message || "Registrazione fallita. Riprova più tardi."; // Usa t()
  } finally {
    isLoading.value = false;
  }
});
</script>
