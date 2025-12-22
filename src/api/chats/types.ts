export interface APIError {
  reason: string;
}

export interface ChatUser {
  first_name: string;
  second_name: string;
  avatar: string;
  email: string;
  login: string;
  phone: string;
}

export interface LastMessage {
  user: ChatUser;
  time: string;
  content: string;
}

export interface Chat {
  id: number;
  title: string;
  avatar: string;
  unread_count: number;
  created_by: number;
  last_message: LastMessage | null;
}

export interface CreateChatRequest {
  title: string;
}

export interface CreateChatResponse {
  id: number;
}

export interface ChatUsersRequest {
  users: number[];
  chatId: number;
}

export interface ChatTokenResponse {
  token: string;
}

export interface ChatUserWithId extends ChatUser {
  id: number;
  display_name: string;
  role: string;
}

// Добавленные типы для поиска пользователей
export interface UserSearchRequest {
  login: string;
}

export interface UserSearchResponse {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string;
}
