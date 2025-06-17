<template>
  <v-app>
    <the-header />


    <v-main>
      <router-view v-slot="{ Component }">
        <transition name="route" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { useAuthStore } from "./components/stores/auth/authStore";
import { onMounted } from "vue";


// Inizializza lo store Pinia
const authStore = useAuthStore();

// Usa onMounted per chiamare tryLogin quando il componente è montato
onMounted(() => {
  authStore.tryLogin();
});
</script>

<style>
.route-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.route-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.route-enter-active {
  transition: all 0.3s ease-out;
}

.route-leave-active {
  transition: all 0.3s ease-in;
}

.route-enter-to,
.route-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
