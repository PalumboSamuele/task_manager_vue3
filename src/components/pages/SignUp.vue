<template>
  <div class="mt-8">
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
          placeholder="esempio@email.com"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
          :error-messages="email.errorMessage.value"
        ></v-text-field>

        <div class="text-subtitle-1 text-medium-emphasis">
          {{ $t("loginForm.username") }}
        </div>

        <v-text-field
          v-model="username.value.value"
          density="compact"
          :placeholder="$t('loginForm.placeholderName')"
          prepend-inner-icon="mdi-email-outline"
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
          :placeholder="$t('loginForm.placeholderPassword')"
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

        <h4 class="text-subtitle-1 text-center mt-15 mb-1 pt-8">
          {{ $t("signupForm.alreadyRegistered") }}
        </h4>

        <v-card-text class="text-center">
          <router-link to="/login" class="text-blue text-decoration-none">
            {{ $t("signupForm.login") }}
            <v-icon icon="mdi-chevron-right"></v-icon>
          </router-link>
        </v-card-text>
      </v-form>
    </v-card>
  </div>
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

const isLoading = ref(false);
const error = ref(null);
const visible = ref(false);

const language = localStorage.getItem("locale");

const { handleSubmit } = useForm({
  validationSchema: {
    email(value) {
      if (!value) return t("signupForm.emailEmpty");
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!pattern.test(value))
        return language === "en"
          ? "Enter a valid email"
          : "Inserisci una mail valida";
      return true;
    },
    username(value) {
      if (!value) return t("signupForm.usernameRequired");
      if (value.length < 6) return t("signupForm.usernameInvalid");
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

  try {
    await authStore.register(values);
    router.replace("/login");
  } catch (err) {
    if (err.response) {
      if ([400, 401, 403, 404].includes(err.response.status)) {
        error.value = t("loginForm.loginEr");
      }
    } else if (err.request) {
      error.value = t("loginForm.loginEr");
    } else {
      error.value = err.message || t("loginForm.bohError");
    }
  } finally {
    isLoading.value = false;
  }
});
</script>
