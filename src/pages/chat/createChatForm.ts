import Block from "../../core/block";
import Input from "../../ui/input/input";
import Button from "../../ui/button/button";
import { createChat, getChats } from "../../services/chats";

export default class CreateChatForm extends Block {
  constructor() {
    const chatNameInput = new Input({
      type: "text",
      id: "chat_name",
      name: "chat_name",
      placeholder: "Название чата",
      required: true,
    });

    const createButton = new Button({
      text: "Создать",
      type: "submit",
      variant: "primary",
      events: {
        click: async (event: Event) => {
          event.preventDefault();
          const chatNameValue = (chatNameInput as Input).getValue();

          if (chatNameValue && chatNameValue.trim() !== "") {
            try {
              const chatId = await createChat(chatNameValue.trim());

              if (chatId !== null) {
                await getChats();

                const currentState = window.store.getState();
                window.store.set({
                  ...currentState,
                  shouldCloseCreateChatModal: true,
                });

                (chatNameInput as Input).setValue("");

                setTimeout(() => {
                  const state = window.store.getState();
                  window.store.set({
                    ...state,
                    shouldCloseCreateChatModal: false,
                  });
                }, 100);
              }
            } catch (error) {
              console.error("Ошибка при создании чата:", error);
            }
          }
        },
      },
    });

    super("form", {
      className: "create-chat-form",
      chatNameInput,
      createButton,
      events: {
        submit: (event: Event) => {
          event.preventDefault();
          createButton.props.events?.click(event);
        },
      },
    });
  }

  render(): string {
    return `
      <div class="form-controls">
        {{{chatNameInput}}}
        {{{createButton}}}
      </div>
    `;
  }
}
