import Block from "../../core/block";
import Input from "../../ui/input/input";
import Button from "../../ui/button/button";
import { deleteUsersFromChat } from "../../services/chats";

export default class RemoveUserForm extends Block {
  constructor() {
    const loginInput = new Input({
      type: "text",
      id: "login",
      name: "login",
      placeholder: "Логин пользователя",
      required: true,
    });

    const removeUserButton = new Button({
      text: "Удалить",
      type: "submit",
      variant: "primary",
    });

    super("form", {
      className: "action-user-modal-form",
      loginInput,
      removeUserButton,
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
              errorMessage: "Выберите чат для удаления пользователя",
            });
            return;
          }

          try {
            const currentChatUsers = state.currentChatUsers as
              | Array<{
                  id: number;
                  login: string;
                  first_name: string;
                  second_name: string;
                }>
              | undefined;

            if (!currentChatUsers || currentChatUsers.length === 0) {
              this.setProps({
                errorMessage: "Не удалось получить список пользователей чата",
              });
              return;
            }

            const userToRemove = currentChatUsers.find(
              (user) => user.login.toLowerCase() === loginValue.toLowerCase()
            );

            if (!userToRemove) {
              this.setProps({
                errorMessage: `Пользователь с логином "${loginValue}" не найден в этом чате`,
              });
              return;
            }

            const success = await deleteUsersFromChat(currentChatId, [
              userToRemove.id,
            ]);

            if (success) {
              this.setProps({
                successMessage: `Пользователь ${userToRemove.login} успешно удален из чата`,
              });
              const updatedUsers = currentChatUsers.filter(
                (user) => user.id !== userToRemove.id
              );
              window.store.set({ currentChatUsers: updatedUsers });

              (loginInput as Input).setValue("");

              setTimeout(() => {
                const removeUserModal = document.querySelector(
                  '[data-modal-type="remove-user"]'
                );
                if (removeUserModal) {
                  removeUserModal.dispatchEvent(
                    new CustomEvent("closeModal", {
                      detail: { modalType: "removeUser" },
                    })
                  );
                }
              }, 2000);
            } else {
              this.setProps({
                errorMessage: "Не удалось удалить пользователя из чата",
              });
            }
          } catch (error) {
            console.error("Ошибка при удалении пользователя:", error);
            this.setProps({
              errorMessage: "Произошла ошибка при удалении пользователя",
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
          {{{removeUserButton}}}
        </div>
      </div>
    `;
  }
}
