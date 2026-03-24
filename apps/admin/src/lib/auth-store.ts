import type { AuthenticatedAdminUser } from "./auth";

type AuthState = {
  accessToken: string | null;
  currentUser: AuthenticatedAdminUser | null;
};

function createAuthStore() {
  let state: AuthState = {
    accessToken: null,
    currentUser: null
  };

  return {
    clear() {
      state = {
        accessToken: null,
        currentUser: null
      };
    },
    getAccessToken() {
      return state.accessToken;
    },
    getCurrentUser() {
      return state.currentUser;
    },
    setAccessToken(accessToken: string | null) {
      state = {
        ...state,
        accessToken
      };
    },
    setCurrentUser(currentUser: AuthenticatedAdminUser | null) {
      state = {
        ...state,
        currentUser
      };
    },
    setSession(input: { accessToken: string; user: AuthenticatedAdminUser }) {
      state = {
        accessToken: input.accessToken,
        currentUser: input.user
      };
    }
  };
}

export const authStore = createAuthStore();

export function getCurrentAdminUser() {
  return authStore.getCurrentUser();
}

export function resetAuthStore() {
  authStore.clear();
}
