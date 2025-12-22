import AuthApi from "../api/auth/auth";
import type {
  LoginRequestData,
  APIError,
  UserDTO,
  CreateUser,
} from "../api/auth/types";

const ROUTER = {
  login: "/",
  signin: "/signin",
  profile: "/profile",
  editProfile: "/edit-profile",
  editPassword: "/edit-password",
  chat: "/messanger",
  error: "/error",
  notFound: "/404",
} as const;

const authApi = new AuthApi();

const isXMLHttpRequest = (error: unknown): error is XMLHttpRequest => {
  return error instanceof XMLHttpRequest;
};

const handleApiError = async (error: unknown): Promise<string> => {
  if (isXMLHttpRequest(error)) {
    try {
      const errorData: APIError = JSON.parse(error.responseText);

      if (errorData.reason === "User already in system") {
        return "ALREADY_LOGGED_IN";
      }

      return errorData.reason;
    } catch {
      return `HTTP Error ${error.status}: ${error.statusText}`;
    }
  } else if (error instanceof Error) {
    return error.message;
  } else {
    return "Произошла неизвестная ошибка";
  }
};

export const userMe = async (): Promise<UserDTO | null> => {
  window.store.set({ isLoading: true });

  try {
    const user = await authApi.me();
    window.store.set({ user });
    return user;
  } catch (error) {
    const errorMessage = await handleApiError(error);
    console.error("Error getting current user:", errorMessage);

    if (
      errorMessage.includes("401") ||
      errorMessage.includes("Not authorized")
    ) {
      window.store.set({ user: undefined });
    }

    return null;
  } finally {
    window.store.set({ isLoading: false });
  }
};

export const login = async (model: LoginRequestData): Promise<void> => {
  window.store.set({ isLoading: true, loginError: null });
  try {
    await authApi.login(model);

    const user = await authApi.me();
    window.store.set({ user });

    window.router.go(ROUTER.chat);
  } catch (error) {
    const errorMessage = await handleApiError(error);

    if (errorMessage === "ALREADY_LOGGED_IN") {
      const user = await authApi.me();
      window.store.set({ user });
      window.router.go(ROUTER.chat);
    } else {
      window.store.set({ loginError: errorMessage });
    }
  } finally {
    window.store.set({ isLoading: false });
  }
};

export const signIn = async (model: CreateUser): Promise<void> => {
  window.store.set({ isLoading: true, signupError: null });
  try {
    await authApi.create(model);

    const user = await authApi.me();
    window.store.set({ user });

    window.router.go(ROUTER.chat);
  } catch (error) {
    const errorMessage = await handleApiError(error);

    if (errorMessage === "ALREADY_LOGGED_IN") {
      const user = await authApi.me();
      window.store.set({ user });
      window.router.go(ROUTER.chat);
    } else {
      window.store.set({ signupError: errorMessage });
    }
  } finally {
    window.store.set({ isLoading: false });
  }
};

export const logout = async (): Promise<void> => {
  window.store.set({ isLoading: true });
  try {
    await authApi.logout();

    window.store.set({
      user: undefined,
      chats: [],
      messages: {},
      activeSettingsPage: "profile",
    });

    window.router.go(ROUTER.login);
  } catch (error) {
    const errorMessage = await handleApiError(error);
    console.error("Logout error:", errorMessage);

    window.store.set({
      user: undefined,
      chats: [],
      messages: {},
      activeSettingsPage: "profile",
    });
    window.router.go(ROUTER.login);
  } finally {
    window.store.set({ isLoading: false });
  }
};
