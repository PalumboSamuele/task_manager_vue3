import { createRouter, createWebHistory } from "vue-router";
import UserAuth from "../components/pages/UserAuth.vue";
// import NotFound from "./components/pages/NotFound.vue";
import MainPage from "@/components/pages/MainPage.vue";
import SignUp from "@/components/pages/SignUp.vue";
import { useAuthStore } from "@/components/stores/auth/authStore.js";

const routes = [
  {
    path: "/",
    alias: "/home",
    redirect: "/login",
  },
  {
    path: "/login",
    component: UserAuth,
    meta: { requiresAuth: false },
  },
  {
    path: "/users/:userId/tasks/",
    component: MainPage,
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: "/signup",
    component: SignUp,
    meta: { requiresAuth: false },
  },
  // {
  //   path: "/:notFound(.*)",
  //   component: NotFound,
  // },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  const isAuthenticated = authStore.isAuthenticated || authStore.tryLogin();
  const userId = authStore.userId;

  // Se la rotta richiede autenticazione e l'utente non è autenticato
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
    return;
  }

  // Se l'utente è autenticato e sta cercando di accedere a login o signup
  if (isAuthenticated && ["/login", "/signup", "/"].includes(to.path)) {
    next(`/users/${userId}/tasks/`);
    return;
  }

  next();
});

export default router;
