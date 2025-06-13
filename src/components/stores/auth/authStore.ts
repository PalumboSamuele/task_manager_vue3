import { defineStore } from "pinia";
import api from "@/axios";

interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

interface LoginPayload {
  username: string;
  password: string;
}

interface LoginResponseData {
  token: string;
  expiration: number;
  userDto: {
    userId: string;
  };
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null as string | null,
    userId: null as string | null,
    firstVisit: true as boolean,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
    isFirstVisit: (state): boolean => state.firstVisit,
  },
  actions: {
    async register(payload: RegisterPayload) {
      const ENDPOINT_URL = "/auth/register";
      try {
        const response = await api.post(ENDPOINT_URL, {
          email: payload.email,
          username: payload.username,
          password: payload.password,
        });
        return response.data;
      } catch (error: unknown) {
        let message = "Failed to register. Please check your data.";
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response &&
          error.response.data &&
          typeof error.response.data === "object" &&
          "message" in error.response.data
        ) {
          message = (error.response.data as { message: string }).message;
        }
        throw new Error(message);
      }
    },
    async login(payload: LoginPayload) {
      const ENDPOINT_URL = "/auth/login";

      const response = await api.post<LoginResponseData>(ENDPOINT_URL, {
        username: payload.username,
        password: payload.password,
      });

      const responseData = response.data;
      const expiration = +responseData.expiration;
      const expiresIn = expiration - new Date().getTime();

      this.token = responseData.token;
      this.userId = responseData.userDto.userId;
      this.firstVisit = false;

      localStorage.setItem("token", this.token);
      localStorage.setItem("userId", this.userId);
      localStorage.setItem("expiration", expiration.toString()); // Salva come stringa

      timer = setTimeout(() => {
        this.autoLogout();
      }, expiresIn);
    },
    tryLogin(): boolean {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const expiration = localStorage.getItem("expiration");

      const parsedExpiration = expiration ? +expiration : 0; // Converte in numero
      const expiresIn = parsedExpiration - new Date().getTime();

      if (expiresIn <= 3000) {
        this.autoLogout();
        return false;
      }

      if (token && userId && parsedExpiration > 0) {
        // 12. Aggiungi controllo per expiration
        this.token = token;
        this.userId = userId;
        this.firstVisit = false;

        timer = setTimeout(() => {
          this.autoLogout();
        }, expiresIn);

        return true;
      }

      return false;
    },
    logout() {
      this.token = null;
      this.userId = null;

      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("expiration");
      if (timer) {
        // 13. Controlla se timer è definito prima di cancellarlo
        clearTimeout(timer);
        timer = undefined; // Resetta timer dopo averlo cancellato
      }
    },

    autoLogout() {
      this.logout();
    },

    setFirstVisit(payload: boolean) {
      // 6. Tipizza il parametro payload
      this.firstVisit = payload;
    },
  },
});
