import { HTTPTransport } from "../../core/httpTransport";
import { BASE_URL } from "../const";
import type {
  ProfileUpdateData,
  PasswordUpdateData,
  ProfileResponse,
  AvatarUpdateResponse,
} from "./types";

const profileApi = new HTTPTransport(BASE_URL);

export default class ProfileApi {
  async updateProfile(data: ProfileUpdateData): Promise<ProfileResponse> {
    return profileApi.put<ProfileResponse>("/user/profile", data);
  }

  async updateAvatar(avatarFile: File): Promise<AvatarUpdateResponse> {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    return profileApi.put<AvatarUpdateResponse>(
      "/user/profile/avatar",
      formData,
      {
        formData: true,
      }
    );
  }
  async getResource(path: string): Promise<Blob> {
    return profileApi.get<Blob>(`/resources/${path}`, undefined, {
      responseType: "blob",
    });
  }

  async updatePassword(data: PasswordUpdateData): Promise<void> {
    return profileApi.put("/user/password", data);
  }
}
