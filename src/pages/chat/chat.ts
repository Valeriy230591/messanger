import Block from "../../core/block";
import Input from "../../ui/input/input";
import ChatCardList from "../../ui/cardList/cardList";
import MessagesList from "../../ui/messagesList/messagesList";
import UserModal from "../../ui/userModal/userModal";
import Modal from "../../ui/modal/modal";
import AuthApi from "../../api/auth/auth";
import ChatsApi from "../../api/chats/chats";
import AddUserForm from "./addUserForm";
import RemoveUserForm from "./removeUserForm";
import CreateChatForm from "./createChatForm";
import { withRouter } from "../../utils/withRouter";
import { connect } from "../../utils/connect";
import type { Chat, ChatPageProps, Message } from "./types";
import {
  createChatWebSocket,
  sendMessage as sendMessageService,
  getChatUsers,
} from "../../services/chats";
import "./chat.scss";

class ChatPage extends Block {
  private chatsApi: ChatsApi;
  private authApi: AuthApi;
  private socket: WebSocket | null = null;

  constructor(props: ChatPageProps = {}) {
    const searchInput = new Input({
      type: "text",
      id: "search-input",
      name: "search",
      placeholder: "Найти",
      search: true,
    });

    const chatsApi = new ChatsApi();
    const authApi = new AuthApi();

    const storeState = window.store.getState();
    const user = storeState.user as { id?: number } | null;
    const currentUserId = user?.id;

    const handleChatClick = async (chatId: number) => {
      const storeState = window.store.getState();
      const user = storeState.user as { id?: number } | null;
      const userId = user?.id;

      if (!userId) {
        return;
      }

      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }

      try {
        const chatUsers = await getChatUsers(chatId);

        window.store.set({
          currentChatUsers: chatUsers,
          currentChatId: chatId,
        });
      } catch (error) {
        console.error("Ошибка при получении пользователей чата:", error);
      }

      const socket = await createChatWebSocket(chatId, userId);

      if (!socket) {
        return;
      }

      this.socket = socket;

      socket.addEventListener("message", (event: MessageEvent) => {
        const data: Message | Message[] = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      });

      window.store.set({ currentChatId: chatId });
    };

    const chatCardList = new ChatCardList({
      chats: props.chats || [],
      onChatClick: handleChatClick,
    });

    const messagesList = new MessagesList({
      messages: [],
      currentUserId: currentUserId,
    });

    const addUserForm = new AddUserForm();
    const removeUserForm = new RemoveUserForm();
    const createChatForm = new CreateChatForm();

    const addUserModal = new Modal({
      isOpen: false,
      children: [addUserForm],
      title: "Добавить пользователя",
    });

    const removeUserModal = new Modal({
      isOpen: false,
      title: "Удалить пользователя",
      children: [removeUserForm],
    });

    const createChatModal = new Modal({
      isOpen: false,
      title: "Создать чат",
      children: [createChatForm],
    });

    const userModal = new UserModal({
      isOpen: false,
      onAddUser: () => {
        userModal.close();
        addUserModal.open();
      },
      onRemoveUser: () => {
        userModal.close();
        removeUserModal.open();
      },
      onClose: () => {
        userModal.close();
      },
    });

    const handleMessageSubmit = (event: Event) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);
      const messageText = formData.get("message") as string;
      if (messageText && messageText.trim() !== "") {
        this.sendMessage(messageText.trim());
        form.reset();
      }
    };

    const handleUserButtonClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const button = target.closest(
        '[data-action="open-modal"]'
      ) as HTMLElement;
      if (button) {
        event.stopPropagation();
        const rect = button.getBoundingClientRect();
        userModal.setPosition(rect.right, rect.bottom);
        userModal.open();
      }
    };

    const handleCreateChatClick = (event: Event) => {
      event.preventDefault();
      createChatModal.open();
    };

    const handleOutsideClick = (event: Event) => {
      const { target } = event;
      if (!(target instanceof HTMLElement)) return;
      if (
        !target.closest(".modal-content") &&
        !target.closest('[data-action="open-modal"]') &&
        !target.closest('[data-action="create-chat"]')
      ) {
        userModal.close();
      }
    };

    const handleProfileClick = (event: Event) => {
      event.preventDefault();
      window.router.go("/settings");
    };

    const handleCloseModal = (event: CustomEvent) => {
      const modalType = event.detail?.modalType;

      if (modalType === "createChat") {
        createChatModal.close();
      } else if (modalType === "addUser") {
        addUserModal.close();
      } else if (modalType === "removeUser") {
        removeUserModal.close();

        window.store.set({
          removeUserError: undefined,
          removeUserSuccess: undefined,
        });
      }
    };

    super("div", {
      ...props,
      searchInput,
      chatCardList,
      messagesList,
      userModal,
      addUserModal,
      removeUserModal,
      createChatModal,
      createChatForm,
      events: {
        submit: (event: Event) => {
          const target = event.target as HTMLElement;
          if (target.closest(".enter-form")) {
            handleMessageSubmit(event);
          }
        },
        click: (event: Event) => {
          const target = event.target as HTMLElement;
          if (target.closest('[data-action="open-modal"]')) {
            handleUserButtonClick(event);
          } else if (target.closest('[data-action="profile"]')) {
            handleProfileClick(event);
          } else if (target.closest('[data-action="create-chat"]')) {
            handleCreateChatClick(event);
          } else {
            handleOutsideClick(event);
          }
        },
        closeModal: (event: Event) => {
          handleCloseModal(event as CustomEvent);
        },
      },
    });

    this.chatsApi = chatsApi;
    this.authApi = authApi;
  }

  async componentDidMount() {
    const state = window.store.getState();
    const user = state.user as { id?: number } | null;

    if (!user || !user.id) {
      window.router.go("/");
      return;
    }

    await this.checkAuth();

    if (user?.id) {
      await this.loadChats();
    }
  }

  private handleWebSocketMessage(data: Message | Message[]): void {
    if (Array.isArray(data)) {
      const storeState = window.store.getState();
      const user = storeState.user as { id?: number } | null;
      const currentUserId = user?.id;

      const messagesList = this.children.messagesList as Block;
      if (messagesList && typeof messagesList.setProps === "function") {
        messagesList.setProps({
          messages: data,
          currentUserId: currentUserId,
        });
      }
    } else if (data.type === "message") {
      const storeState = window.store.getState();
      const user = storeState.user as { id?: number } | null;
      const currentUserId = user?.id;

      const messagesList = this.children.messagesList as Block;
      if (messagesList && messagesList.props) {
        const currentMessages =
          (messagesList.props.messages as Message[]) || [];

        const newMessage: Message = {
          id: Date.now(),
          user_id: data.user_id || currentUserId || 0,
          chat_id: data.chat_id || 0,
          type: "message",
          time: new Date().toISOString(),
          content: data.content || "",
          is_read: false,
          file: null,
        };

        const updatedMessages = [...currentMessages, newMessage];

        messagesList.setProps({
          messages: updatedMessages,
          currentUserId: currentUserId,
        });
      }
    }
  }

  private sendMessage(message: string): void {
    const success = sendMessageService(this.socket, message);
  }

  async checkAuth() {
    try {
      const currentUser = this.props.user as { id?: number } | null;

      if (!currentUser || !currentUser.id) {
        const user = await this.authApi.me();

        if (user && user.id) {
          window.store.set({ user });
        } else {
          this.redirectToLogin();
        }
      }
    } catch (error) {
      this.redirectToLogin();
    }
  }

  async loadChats() {
    try {
      const chats = await this.chatsApi.getChats();

      const formattedChats = chats.map((chat) => ({
        id: chat.id,
        name: chat.title,
        text: chat.last_message?.content || "Нет сообщений",
        time: this.formatTime(chat.last_message?.time || ""),
        count: chat.unread_count > 0 ? chat.unread_count : undefined,
      }));

      window.store.set({ chats: formattedChats });

      this.setProps({
        chats: formattedChats,
      });
    } catch (error) {
      this.setProps({
        chats: [],
      });
    }
  }

  private redirectToLogin() {
    window.router.go("/");
  }

  private formatTime(timeString: string): string {
    if (!timeString) return "";
    const date = new Date(timeString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  componentDidUpdate(
    oldProps: Record<string, unknown>,
    newProps: Record<string, unknown>
  ): boolean {
    const oldUser = oldProps.user as { id?: number } | null;
    const newUser = newProps.user as { id?: number } | null;

    if (!oldUser?.id && newUser?.id) {
      this.loadChats();
    }

    if (oldProps.chats !== newProps.chats) {
      const chatCardList = this.children.chatCardList as Block;
      if (chatCardList && typeof chatCardList.setProps === "function") {
        chatCardList.setProps({
          chats: newProps.chats || [],
        });
      }
    }

    if (oldProps.user !== newProps.user) {
      const currentUserId = (newProps.user as { id?: number } | null)?.id;
      const messagesList = this.children.messagesList as Block;
      if (messagesList && typeof messagesList.setProps === "function") {
        messagesList.setProps({
          currentUserId: currentUserId,
        });
      }
    }

    if (oldUser?.id && !newUser?.id) {
      this.redirectToLogin();
    }

    return true;
  }

  render(): string {
    const chats = this.props.chats as Chat[] | undefined;
    const isLoading = this.props.isLoading as boolean | undefined;
    const currentChatUsers = this.props.currentChatUsers as
      | Array<{ login: string }>
      | undefined;

    let displayName = "Других пользователей нет в чате";
    if (currentChatUsers && currentChatUsers.length > 0) {
      const logins = currentChatUsers.map((user) => user.login);
      displayName = `(${logins.join(", ")})`;
    }

    return `
      <div class="chat">
        <article class="chats">
          <div class="chats-header">
            <button class="link" data-action="profile">Профиль</button>
            <button class="create-chat-btn" data-action="create-chat">
              + Создать чат
            </button>
          </div>
          <form class="search-container">
            {{{searchInput}}}
          </form>
          <div class="card-wrapper">
            ${
              isLoading
                ? '<div class="loading">Загрузка чатов...</div>'
                : chats && chats.length > 0
                ? "{{{chatCardList}}}"
                : '<div class="no-chats">Чатов пока нет</div>'
            }
          </div>
        </article>

        <section class="messages">
          <header class="messages-header">
            <div class="messages-info">
              <div class="messages-no-photo"></div>
              <p class="name">${displayName}</p>
            </div>
            <div class="user-button-container">
              <button class="user-button" data-action="open-modal">
                <img src="/dots.svg">
              </button>
            </div>
          </header>

          <article class="messages-list">
            {{{messagesList}}}
          </article>

          <footer class="messages-footer">
            <form class="enter-form">
              <input name="message" class="enter" placeholder="Сообщение">
              <button type="submit" class="entered-button">
                <img src="/arrow.svg">
              </button>
            </form>
          </footer>
        </section>
        {{{addUserModal}}}
        {{{removeUserModal}}}
        {{{createChatModal}}}
        {{{userModal}}}
      </div>
    `;
  }
}

const mapStateToProps = (state: Record<string, unknown>) => {
  return {
    isLoading: state.isLoading as boolean | undefined,
    loginError: state.loginError as string | undefined,
    chats: state.chats as Chat[] | undefined,
    user: state.user as { id?: number; first_name?: string } | undefined,
    currentChatUsers: state.currentChatUsers as
      | Array<{
          id: number;
          first_name: string;
          second_name: string;
          display_name?: string;
          login: string;
          avatar?: string;
        }>
      | undefined,
    currentChatId: state.currentChatId as number | undefined,
  };
};

export default connect(mapStateToProps)(withRouter(ChatPage));
