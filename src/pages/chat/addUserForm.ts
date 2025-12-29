import Block from "../../core/block";
import Input from "../../ui/input/input";
import Button from "../../ui/button/button";
import { searchUsers, addUsersToChat } from "../../services/chats";

interface User {
  id: number;
  login: string;
  first_name: string;
  second_name: string;
}

export default class AddUserForm extends Block {
  constructor() {
    const loginInput = new Input({
      type: "text",
      id: "login",
      name: "login",
      placeholder: "Логин пользователя",
      required: true,
    });

    const addUserButton = new Button({
      text: "Добавить",
      type: "submit",
      variant: "primary",
    });

    super("form", {
      className: "action-user-modal-form",
      loginInput,
      addUserButton,
      errorMessage: "",
      successMessage: "",

      events: {
        submit: async (event: Event) => {
          event.preventDefault();

          this.setProps({
            errorMessage: "",
            successMessage: "",
          });

          const loginValue = (loginInput as Input).getValue();

          if (!loginValue || loginValue.trim() === "") {
            this.setProps({
              errorMessage: "Введите логин пользователя",
            });
            return;
          }

          const state = window.store.getState();
          const currentChatId = state.currentChatId as number;

          if (!currentChatId) {
            this.setProps({
              errorMessage: "Выберите чат для добавления пользователя",
            });
            return;
          }

          try {
            const foundUsers = await searchUsers(loginValue.trim());

            if (!foundUsers || foundUsers.length === 0) {
              this.setProps({
                errorMessage: `Пользователь с логином "${loginValue}" не найден`,
              });
              return;
            }

            const userToAdd = foundUsers[0];

            const currentChatUsers = state.currentChatUsers as
              | User[]
              | undefined;

            if (currentChatUsers) {
              const alreadyInChat = currentChatUsers.some(
                (user) => user.id === userToAdd.id
              );

              if (alreadyInChat) {
                this.setProps({
                  errorMessage: `Пользователь ${userToAdd.login} уже есть в этом чате`,
                });
                return;
              }
            }

            const success = await addUsersToChat(currentChatId, [userToAdd.id]);

            if (success) {
              this.setProps({
                successMessage: `Пользователь ${userToAdd.login} успешно добавлен в чат`,
              });

              if (currentChatUsers) {
                const updatedUsers = [...currentChatUsers, userToAdd];
                window.store.set({ currentChatUsers: updatedUsers });
              } else {
                window.store.set({ currentChatUsers: [userToAdd] });
              }

              (loginInput as Input).setValue("");

              setTimeout(() => {
                const addUserModal = document.querySelector(
                  '[data-modal-type="add-user"]'
                );
                if (addUserModal) {
                  addUserModal.dispatchEvent(
                    new CustomEvent("closeModal", {
                      detail: { modalType: "addUser" },
                    })
                  );
                }
              }, 2000);
            } else {
              this.setProps({
                errorMessage: "Не удалось добавить пользователя в чат",
              });
            }
          } catch (error) {
            console.error("Ошибка при добавлении пользователя:", error);
            this.setProps({
              errorMessage: "Произошла ошибка при добавлении пользователя",
            });
          }
        },
      },
    });
  }

  public clearForm(): void {
    const loginInput = this.children.loginInput as Input;
    if (loginInput) {
      loginInput.setValue("");
    }

    this.setProps({
      errorMessage: "",
      successMessage: "",
    });
  }

  render(): string {
    const errorMessage = this.props.errorMessage as string;
    const successMessage = this.props.successMessage as string;

    return `
      <div class="form-controls">
        <div class="form-field">
          {{{loginInput}}}
        </div>

        ${
          errorMessage
            ? `
          <div class="form-error">
            <span class="error-text">${errorMessage}</span>
          </div>
        `
            : ""
        }

        ${
          successMessage
            ? `
          <div class="form-success">
            <span class="success-text">${successMessage}</span>
          </div>
        `
            : ""
        }

        <div class="form-actions">
          {{{addUserButton}}}
        </div>
      </div>
    `;
  }
}
