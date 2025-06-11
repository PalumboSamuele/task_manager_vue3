import { createRouter, createWebHistory } from "vue-router";
import UserAuth from "../components/pages/UserAuth.vue";
// import NotFound from "./components/pages/NotFound.vue";
import TaskList from "@/components/pages/TaskList.vue";
import SignUp from "@/components/pages/SignUp.vue";

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
    component: TaskList,
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
  const { useAuthStore } = await import(
    "@/components/stores/auth/authStore.js"
  );
  const authStore = useAuthStore();

  const isAuthenticated = authStore.isAuthenticated || authStore.tryLogin();
  const userId = authStore.userId;

  // Se la rotta richiede autenticazione e l'utente non è autenticato
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log("Reindirizzamento a login: utente non autenticato");
    next("/login");
    return;
  }

  // Se l'utente è autenticato e sta cercando di accedere a login o signup
  if (isAuthenticated && ["/login", "/signup", "/"].includes(to.path)) {
    console.log("Reindirizzamento a tasks: utente già autenticato");
    next(`/users/${userId}/tasks/`);
    return;
  }

  next();
});

export default router;
