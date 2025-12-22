export interface Chat {
  id: number;
  name: string;
  text: string;
  time: string;
  count?: number;
}

export interface Message {
  id: number;
  user_id: number;
  chat_id: number;
  type: string;
  time: string;
  content: string;
  is_read: boolean;
  file: null | string;
}

export interface ChatUser {
  first_name: string;
  second_name: string;
  avatar: string;
  email: string;
  login: string;
  phone: string;
}
export interface Chat {
  id: number;
  name: string;
  text: string;
  time: string;
  count?: number;
}

export interface ChatPageProps {
  chats?: Chat[];
  user?: {
    id?: number;
    first_name?: string;
  };
  isLoading?: boolean;
  loginError?: string;
  currentChatId?: number;
}

export interface ChatCardListProps {
  chats: Chat[];
  onChatClick?: (chatId: number) => void;
}
