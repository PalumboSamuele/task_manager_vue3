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
        Task Manager
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
          append-icon="mdi-account-plus"
        >
          Login
        </v-btn>
        <v-btn
          variant="outlined"
          color="white"
          class="ml-2"
          :to="'/signup'"
          append-icon="mdi-account-plus"
        >
          Sign Up
        </v-btn>
      </template>

      <template v-else-if="isLoggedIn">
        <v-btn
          variant="outlined"
          color="white"
          class="ml-2"
          @click="logout"
          append-icon="mdi-login"
        >
          Logout
        </v-btn>
      </template>
    </v-row>
  </v-app-bar>

  <!-- menu visibile solo in versione mobile -->
  <v-navigation-drawer v-model="drawer" temporary app>
    <v-list v-if="!isLoggedIn">

      <v-list-item v-if="!isLoggedIn" :to="'/login'">
        <template #append>
          <v-icon>mdi-login</v-icon>
        </template>
        <v-list-item-title>Login</v-list-item-title>
      </v-list-item>

      <v-list-item :to="'/signup'">
        <template #append>
          <v-icon>mdi-account-plus</v-icon>
        </template>
        <v-list-item-title>Sign Up</v-list-item-title>
      </v-list-item>
    </v-list>

    <v-list v-if="isLoggedIn">
      <v-list-item :to="'/'" @click="logout">
        <template #append>
          <v-icon>mdi-logout</v-icon>
        </template>
        <v-list-item-title>Logout</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { useAuthStore } from "@/components/stores/auth/authStore";
export default {
  name: "TaskManagerHeader",
  data() {
    return {
      drawer: false,
    };
  },
  created() {
    this.authStore = useAuthStore();
  },
  computed: {
    isLoggedIn() {
      return this.authStore.isAuthenticated;
    },
  },
  methods: {
    logout() {
      this.authStore.logout();
      this.$router.replace("/login");
    },
  },
};
</script>
