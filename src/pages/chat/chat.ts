import Block from "../../core/block";
import Input from "../../ui/input/input";
import ChatCardList from "../../ui/cardList/cardList";
import MessagesList from "../../ui/messagesList/messagesList";
import UserModal from "../../ui/userModal/userModal";
import Modal from "../../ui/modal/modal";
import Button from "../../ui/button/button";
import AddUserForm from "./addUserForm"; // Импортируем нашу форму
import RemoveUserForm from "./removeUserForm";
import { mockChats, mockMessages } from "./mock";
import "./chat.scss";

interface Chat {
  id: number;
  name: string;
  text: string;
  time: string;
  count?: number;
}

interface Message {
  id: number;
  text: string;
  time: string;
  isOutgoing: boolean;
  isRead?: boolean;
}

interface ChatPageProps {
  chats?: Chat[];
  messages?: Message[];
}

export default class ChatPage extends Block {
  constructor(props: ChatPageProps = {}) {
    const addUserForm = new AddUserForm();
    const removeUserForm = new RemoveUserForm();

    const searchInput = new Input({
      type: "text",
      id: "search-input",
      name: "search",
      placeholder: "Найти",
      search: true,
    });

    const chatCardList = new ChatCardList({
      chats: mockChats,
    });

    const messagesList = new MessagesList({
      messages: mockMessages,
    });

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
      const messageData = {
        message: formData.get("message") as string,
      };

      console.log(messageData);
      form.reset();
    };

    const handleUserButtonClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const button = target.closest(
        "[data-action=\"open-modal\"]"
      ) as HTMLElement;

      if (button) {
        event.stopPropagation();

        const rect = button.getBoundingClientRect();
        userModal.setPosition(rect.right, rect.bottom);
        userModal.open();
      }
    };

    const handleOutsideClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".modal-content") &&
        !target.closest("[data-action=\"open-modal\"]")
      ) {
        userModal.close();
      }
    };

    super("div", {
      ...props,
      chats: mockChats,
      searchInput,
      chatCardList,
      messagesList,
      userModal,
      addUserModal,
      removeUserModal,
      events: {
        submit: (event: Event) => {
          const target = event.target as HTMLElement;
          if (target.closest(".enter-form")) {
            handleMessageSubmit(event);
          }
        },
        click: (event: Event) => {
          const target = event.target as HTMLElement;
          if (target.closest("[data-action=\"open-modal\"]")) {
            handleUserButtonClick(event);
          } else {
            handleOutsideClick(event);
          }
        },
      },
    });
  }

  render(): string {
    return `
      <div class="chat">
        <article class="chats">
          <a class="link">Профиль</a>
          <form class="search-container">
            {{{searchInput}}}
          </form>
          <div class="card-wrapper">
            {{{chatCardList}}}
          </div>
        </article>

        <section class="messages">
          <header class="messages-header">
            <div class="messages-info">
              <div class="messages-no-photo"></div>
              <p class="name">Вадим</p>
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
        {{{userModal}}}
      </div>
    `;
  }
}
