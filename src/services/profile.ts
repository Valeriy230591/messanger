import ProfileApi from "../api/profile/profile";
import type {
  ProfileUpdateData,
  PasswordUpdateData,
  ProfileResponse,
  AvatarUpdateResponse,
} from "../api/profile/types";
import type { APIError, UserDTO } from "../api/auth/types";

const profileApi = new ProfileApi();

const toUserDTO = (
  apiResponse: ProfileResponse | AvatarUpdateResponse
): UserDTO => {
  return {
    id: apiResponse.id,
    login: apiResponse.login,
    first_name: apiResponse.first_name,
    second_name: apiResponse.second_name,
    display_name: apiResponse.display_name,
    avatar: apiResponse.avatar || null,
    phone: apiResponse.phone,
    email: apiResponse.email,
  };
};

const isXMLHttpRequest = (error: unknown): error is XMLHttpRequest => {
  return error instanceof XMLHttpRequest;
};

const handleApiError = async (error: unknown): Promise<string> => {
  if (isXMLHttpRequest(error)) {
    try {
      const errorData: APIError = JSON.parse(error.responseText);
      return errorData.reason || "Произошла ошибка при обновлении данных";
    } catch {
      return `HTTP Error ${error.status}: ${error.statusText}`;
    }
  } else if (error instanceof Error) {
    return error.message;
  } else {
    return "Произошла неизвестная ошибка";
  }
};

export const updateProfile = async (
  model: ProfileUpdateData
): Promise<void> => {
  window.store.set({ isLoading: true, profileError: null });

  try {
    const response = await profileApi.updateProfile(model);
    const user = toUserDTO(response);
    window.store.set({ user });
  } catch (error) {
    const errorMessage = await handleApiError(error);
    window.store.set({ profileError: errorMessage });
  } finally {
    window.store.set({ isLoading: false });
  }
};

export const updateAvatar = async (avatarFile: File): Promise<void> => {
  window.store.set({ isLoading: true, avatarError: null });

  try {
    const response = await profileApi.updateAvatar(avatarFile);
    const user = toUserDTO(response);
    window.store.set({ user });
  } catch (error) {
    const errorMessage = await handleApiError(error);
    window.store.set({ avatarError: errorMessage });
  } finally {
    window.store.set({ isLoading: false });
  }
};

export const updatePassword = async (
  model: PasswordUpdateData
): Promise<void> => {
  window.store.set({ isLoading: true, passwordError: null });

  try {
    await profileApi.updatePassword(model);
  } catch (error) {
    const errorMessage = await handleApiError(error);
    window.store.set({ passwordError: errorMessage });
  } finally {
    window.store.set({ isLoading: false });
  }
};

export const loadUserAvatar = async (path: string): Promise<Blob> => {
  return await profileApi.getResource(path);
};
export const loadUserAvatarUrl = async (path: string): Promise<string> => {
  const blob = await profileApi.getResource(path);
  return URL.createObjectURL(blob);
};
