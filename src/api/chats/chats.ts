import { HTTPTransport } from "../../core/httpTransport";
import type {
  APIError,
  Chat,
  CreateChatRequest,
  CreateChatResponse,
  ChatUsersRequest,
  ChatTokenResponse,
  ChatUserWithId,
  UserSearchRequest,
  UserSearchResponse,
} from "./types";

const baseApi = new HTTPTransport("https://ya-praktikum.tech/api/v2");

export default class ChatsApi {
  async getChats(): Promise<Chat[]> {
    return baseApi.get<Chat[]>("/chats");
  }

  async createChat(data: CreateChatRequest): Promise<CreateChatResponse> {
    return baseApi.post<CreateChatResponse>("/chats", data);
  }

  async deleteChat(chatId: number): Promise<void> {
    return baseApi.delete("/chats", { chatId });
  }

  async getChatUsers(chatId: number): Promise<ChatUserWithId[]> {
    return baseApi.get<ChatUserWithId[]>(`/chats/${chatId}/users`);
  }

  async addUsersToChat(data: ChatUsersRequest): Promise<void> {
    return baseApi.put("/chats/users", data);
  }

  async deleteUsersFromChat(data: ChatUsersRequest): Promise<void> {
    return baseApi.delete("/chats/users", data);
  }

  async getChatToken(chatId: number): Promise<ChatTokenResponse> {
    return baseApi.post<ChatTokenResponse>(`/chats/token/${chatId}`);
  }

  async searchUsers(data: UserSearchRequest): Promise<UserSearchResponse[]> {
    return baseApi.post<UserSearchResponse[]>("/user/search", data);
  }
}
