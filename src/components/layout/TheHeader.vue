<template>
  <v-app-bar
    app
    color="light-blue-accent-3"
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
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { useAuthStore } from "@/components/stores/auth/authStore";
import { useI18n } from "vue-i18n";

export default {
  name: "TaskManagerHeader",
  data() {
    return {
      drawer: false,
    };
  },
  setup() {
    const { locale } = useI18n();
    return { locale };
  },
  created() {
    this.authStore = useAuthStore();
  },
  computed: {
    isLoggedIn() {
      return this.authStore.isAuthenticated;
    },
    currentLocale() {
      return this.locale;
    },
  },
  methods: {
    toggleLanguage() {
      const newLocale = this.locale === "it" ? "en" : "it";
      localStorage.setItem("locale", newLocale);
      window.location.reload();
    },
    logout() {
      this.authStore.logout();
      this.$router.replace("/login");
    },
  },
};
</script>
