import { HTTPTransport } from "../../core/httpTransport";
import { BASE_URL } from "../const";
import type {
  CreateUser,
  LoginRequestData,
  SignUpResponse,
  UserDTO,
} from "./types";

const authApi = new HTTPTransport(BASE_URL);

export default class AuthApi {
  async create(data: CreateUser): Promise<SignUpResponse> {
    return authApi.post<SignUpResponse>("/auth/signup", data);
  }

  async login(data: LoginRequestData): Promise<void> {
    return authApi.post("/auth/signin", data);
  }

  async me(): Promise<UserDTO> {
    return authApi.get<UserDTO>("/auth/user");
  }

  async logout(): Promise<void> {
    return authApi.post("/auth/logout");
  }
}
