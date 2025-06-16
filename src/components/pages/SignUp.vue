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
          {{ $t("signupForm.messagges") }}
        </v-card-title>

        <v-form @submit.prevent="submitForm">
          <div class="text-subtitle-1 text-medium-emphasis">Email</div>
          <v-text-field
            v-model="email.value.value"
            density="compact"
            :placeholder="$t('signupForm.emailExample')"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            :error-messages="email.errorMessage.value"
            @blur="email.handleBlur"
          ></v-text-field>

          <div class="text-subtitle-1 text-medium-emphasis">
            {{ $t("signupForm.username") }}
          </div>
          <v-text-field
            v-model="username.value.value"
            density="compact"
            :placeholder="$t('signupForm.username')"
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
            :placeholder="$t('signupForm.placeholderPassword')"
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
            {{ $t("signupForm.signup") }}
          </v-btn>
        </v-form>

        <h4 class="text-subtitle-1 text-center mt-15 mb-1 pt-8">
          {{ $t("signupForm.alreadyRegistered") }}
        </h4>

        <v-card-text class="text-center">
          <router-link to="/login" class="text-blue text-decoration-none">
            {{ $t("signupForm.login") }}
            <v-icon icon="mdi-chevron-right"></v-icon>
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
import { useI18n } from "vue-i18n";

const { t } = useI18n();

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
        return t("signupForm.emailInvalid");
      return true;
    },
    username(value) {
      if (!value) return t("signupForm.usernameRequired");
      if (value.length < 3) return t("signupForm.usernameInvalid");
      if (value.length > 32) return t("signupForm.usernameInvalid");
      return true;
    },
    password(value) {
      if (!value) return t("signupForm.passwordRequired");
      if (value.length < 8) return t("signupForm.passwordInvalid");
      if (value.length > 20) return t("signupForm.passwordInvalid");
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
