<template>
  <v-app>
    <the-header />
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { useAuthStore } from "./components/stores/auth/authStore";
import {onMounted} from "vue";

// Inizializza lo store Pinia
const authStore = useAuthStore();

// Usa onMounted per chiamare tryLogin quando il componente è montato
onMounted(() => {
  authStore.tryLogin();
});
</script>
