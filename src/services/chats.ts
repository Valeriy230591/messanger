import type { APIError } from "../api/auth/types";
import ChatsApi from "../api/chats/chats";
import type {
  Chat,
  ChatUserWithId,
  UserSearchResponse,
} from "../api/chats/types";

export interface WebSocketMessage {
  id?: number;
  user_id?: number;
  chat_id?: number;
  type: string;
  time?: string;
  content?: string;
  is_read?: boolean;
  file?: null | string;
}

const chatsApi = new ChatsApi();

const isXMLHttpRequest = (error: unknown): error is XMLHttpRequest => {
  return error instanceof XMLHttpRequest;
};

const handleApiError = async (error: unknown): Promise<string> => {
  if (isXMLHttpRequest(error)) {
    try {
      const errorData: APIError = JSON.parse(error.responseText);
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

export const getChats = async (): Promise<Chat[]> => {
  try {
    const chats = await chatsApi.getChats();

    const formattedChats = chats.map((chat) => ({
      id: chat.id,
      name: chat.title,
      text: chat.last_message?.content || "Нет сообщений",
      time: formatTime(chat.last_message?.time || ""),
      count: chat.unread_count > 0 ? chat.unread_count : undefined,
    }));

    window.store.set({ chats: formattedChats });
    return chats;
  } catch (error) {
    const errorMessage = await handleApiError(error);
    window.store.set({ chatsError: errorMessage });
    return [];
  }
};

const formatTime = (timeString: string): string => {
  if (!timeString) return "";
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};
export const createChat = async (title: string): Promise<number | null> => {
  try {
    const response = await chatsApi.createChat({ title });
    await getChats();
    return response.id;
  } catch (error) {
    const errorMessage = await handleApiError(error);
    window.store.set({ createChatError: errorMessage });
    return null;
  }
};

export const deleteChat = async (chatId: number): Promise<boolean> => {
  try {
    await chatsApi.deleteChat(chatId);
    await getChats();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getChatUsers = async (
  chatId: number
): Promise<ChatUserWithId[]> => {
  try {
    const users = await chatsApi.getChatUsers(chatId);
    return users;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getChatToken = async (chatId: number): Promise<string | null> => {
  try {
    const response = await chatsApi.getChatToken(chatId);
    return response.token;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const addUsersToChat = async (
  chatId: number,
  userIds: number[]
): Promise<boolean> => {
  try {
    await chatsApi.addUsersToChat({ users: userIds, chatId });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const deleteUsersFromChat = async (
  chatId: number,
  userIds: number[]
): Promise<boolean> => {
  try {
    await chatsApi.deleteUsersFromChat({ users: userIds, chatId });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const searchUsers = async (
  login: string
): Promise<UserSearchResponse[]> => {
  try {
    const users = await chatsApi.searchUsers({ login });
    return users;
  } catch (error) {
    const errorMessage = await handleApiError(error);
    window.store.set({ userSearchError: errorMessage });
    return [];
  }
};

export const createChatWebSocket = async (
  chatId: number,
  userId: number,
  onMessage?: (data: WebSocketMessage | WebSocketMessage[]) => void
): Promise<WebSocket | null> => {
  try {
    const token = await getChatToken(chatId);

    if (!token) {
      return null;
    }

    const socket = new WebSocket(
      `wss://ya-praktikum.tech/ws/chats/${userId}/${chatId}/${token}`
    );

    socket.addEventListener("open", () => {
      socket.send(
        JSON.stringify({
          content: "0",
          type: "get old",
        })
      );
    });

    socket.addEventListener("message", (event: MessageEvent) => {
      const data: WebSocketMessage | WebSocketMessage[] = JSON.parse(
        event.data
      );

      if (onMessage) {
        onMessage(data);
      } else {
        if (Array.isArray(data)) {
          window.store.set({ messages: data });
        } else if (data.type === "message") {
          const storeState = window.store.getState();
          const currentMessages =
            (storeState.messages as WebSocketMessage[]) || [];
          window.store.set({ messages: [...currentMessages, data] });
        }
      }
    });

    socket.addEventListener("error", () => {});

    return socket;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const sendMessage = (
  socket: WebSocket | null,
  message: string
): boolean => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false;
  }

  try {
    const messageData: { content: string; type: string } = {
      content: message,
      type: "message",
    };

    socket.send(JSON.stringify(messageData));
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
