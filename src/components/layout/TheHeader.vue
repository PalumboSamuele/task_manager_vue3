<template>
  <v-app-bar
    app
    :color="
      theme.global.current.value.dark ? 'grey-darken-4' : 'light-blue-accent-3'
    "
    elevation="12"
    style="border-bottom-left-radius: 8px; border-bottom-right-radius: 8px"
  >
    <v-app-bar-nav-icon
      class="hidden-md-and-up"
      @click="drawer = !drawer"
    ></v-app-bar-nav-icon>

    <v-row align="center" class="flex-grow-0 ml-4">
      <v-avatar size="40" class="mr-2">
        <v-img src="https://mayeit.taskaid.eu/img/task-logo.png" alt="Logo" />
      </v-avatar>
      <v-toolbar-title class="text-h6 font-weight-bold text-white">
        {{ $t("header.title") }}
      </v-toolbar-title>
    </v-row>

    <v-spacer></v-spacer>

    <v-row align="center" class="flex-grow-0 mr-4 hidden-sm-and-down">
      <template v-if="!isLoggedIn">
        <v-btn
          variant="outlined"
          color="white"
          class="ml-2"
          :to="'/login'"
          prepend-icon="mdi-login"
        >
          {{ $t("header.login") }}
        </v-btn>
        <v-btn
          variant="outlined"
          color="white"
          class="ml-2"
          :to="'/signup'"
          append-icon="mdi-account-plus"
        >
          {{ $t("header.signup") }}
        </v-btn>
      </template>

      <template v-else-if="isLoggedIn">
        <v-btn
          variant="outlined"
          color="white"
          class="ml-2"
          @click="logout"
          prepend-icon="mdi-logout"
        >
          {{ $t("header.logout") }}
        </v-btn>
      </template>

      <!-- Language Switcher Button -->
      <v-btn
        variant="outlined"
        color="white"
        class="ml-2"
        prepend-icon="mdi-translate"
        @click="toggleLanguage"
      >
        {{ currentLocale === "it" ? "IT" : "EN" }}
      </v-btn>
      <v-btn @click="toggleTheme" variant="outlined" color="white" class="ml-2">
        <v-icon
          :icon="
            theme.global.current.value.dark
              ? 'mdi-weather-night'
              : 'mdi-weather-sunny'
          "
          size="large"
          color="white"
          class="mr-2"
        />
        {{ theme.global.current.value.dark ? "Dark" : "Light" }}
      </v-btn>
    </v-row>
  </v-app-bar>

  <!-- menu visibile solo in versione mobile -->
  <v-navigation-drawer v-model="drawer" temporary app>
    <v-list v-if="!isLoggedIn">
      <v-list-item v-if="!isLoggedIn" :to="'/login'">
        <template #append>
          <v-icon>mdi-login</v-icon>
        </template>
        <v-list-item-title>{{ $t("header.login") }}</v-list-item-title>
      </v-list-item>

      <v-list-item :to="'/signup'">
        <template #append>
          <v-icon>mdi-account-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t("header.signup") }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <v-list v-if="isLoggedIn">
      <v-list-item @click="logout">
        <template #prepend>
          <v-icon>mdi-logout</v-icon>
        </template>
        <v-list-item-title>{{ $t("header.logout") }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>
    <v-list>
      <v-list-item @click="toggleLanguage">
        <template #prepend>
          <v-icon>mdi-translate</v-icon>
        </template>
        <v-list-item-title>
          {{ currentLocale === "it" ? "Italiano" : "English" }}
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="toggleTheme">
        <template #prepend>
          <v-icon>{{ theme.global.current.value.dark ? "mdi-weather-night" : "mdi-weather-sunny" }}</v-icon>
        </template>
        <v-list-item-title>
          {{ theme.global.current.value.dark ? "Dark" : "Light" }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/components/stores/auth/authStore";
import { useTheme } from "vuetify";

const drawer = ref(false);
const router = useRouter();
const { locale, t } = useI18n();
const authStore = useAuthStore();
const theme = useTheme();

const isLoggedIn = computed(() => authStore.isAuthenticated);
const currentLocale = computed(() => locale.value);

function toggleTheme() {
  const newTheme = theme.global.current.value.dark ? "light" : "dark";
  theme.global.name.value = newTheme;
  //serve a salvare il tema impostato
  localStorage.setItem("theme", newTheme);
}

const toggleLanguage = () => {
  const newLocale = locale.value === "it" ? "en" : "it";
  localStorage.setItem("locale", newLocale);
  window.location.reload();
};

const logout = () => {
  authStore.logout();
  router.replace("/login");
};
</script>
