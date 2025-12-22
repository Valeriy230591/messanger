import { HTTPTransport } from "../../core/httpTransport";
import type {
  CreateUser,
  LoginRequestData,
  SignUpResponse,
  UserDTO,
} from "./types";

const authApi = new HTTPTransport("https://ya-praktikum.tech/api/v2/auth");

export default class AuthApi {
  async create(data: CreateUser): Promise<SignUpResponse> {
    return authApi.post<SignUpResponse>("/signup", data);
  }

  async login(data: LoginRequestData): Promise<void> {
    return authApi.post("/signin", data);
  }

  async me(): Promise<UserDTO> {
    return authApi.get<UserDTO>("/user");
  }

  async logout(): Promise<void> {
    return authApi.post("/logout");
  }
}
