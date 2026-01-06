import Block, { type BlockProps } from "../../core/block";
import Button from "../../ui/button/button";
import Avatar from "../../ui/avatar/avatar";
import Input from "../../ui/input/input";
import { connect } from "../../utils/connect";
import { withRouter } from "../../utils/withRouter";
import { updatePassword } from "../../services/profile";
import Router from "../../core/Router";
import { Store } from "../../core/Store";
import "./editPassword.scss";

interface EditPasswordPageProps extends BlockProps {
  router?: Router;
  isLoading?: boolean;
  passwordError?: string;
  user?: {
    id?: number;
    login?: string;
    first_name?: string;
    second_name?: string;
    display_name?: string;
    avatar?: string | null;
    phone?: string;
    email?: string;
  };
}

class EditPasswordPage extends Block {
  private validationError: string = "";

  constructor(props: EditPasswordPageProps) {
    const user = props.user || {};

    const ProfileAvatar = new Avatar({
      avatarPath: user.avatar || "/noAvatar.svg",
      name: user.display_name || user.first_name || "Пользователь",
      events: {
        click: (event: Event) => {
          event.preventDefault();
        },
      },
    });

    const oldPasswordInput = new Input({
      type: "password",
      id: "oldPassword",
      name: "oldPassword",
      label: "Старый пароль",
      placeholder: "Старый пароль",
      value: "",
      inline: true,
      required: true,
    });

    const newPasswordInput = new Input({
      type: "password",
      id: "newPassword",
      name: "newPassword",
      label: "Новый пароль",
      placeholder: "Новый пароль",
      value: "",
      inline: true,
      required: true,
    });

    const repeatPasswordInput = new Input({
      type: "password",
      id: "password",
      name: "password",
      label: "Повторите новый пароль",
      placeholder: "Новый пароль (еще раз)",
      value: "",
      inline: true,
      required: true,
    });

    const backButton = new Button({
      text: "Назад",
      type: "button",
      variant: "secondary",
      events: {
        click: (event: Event) => {
          event.preventDefault();

          sessionStorage.setItem("activeSettingsPage", "profile");
          Store.getInstance().set({ activeSettingsPage: "profile" });
          this.clearValidationError();
        },
      },
    });

    const saveButton = new Button({
      text: "Сохранить",
      type: "submit",
      variant: "primary",
      events: {
        click: (event: Event) => {
          event.preventDefault();
          this.handleSubmit();
        },
      },
    });

    super("div", {
      ...props,
      ProfileAvatar,
      oldPasswordInput,
      newPasswordInput,
      repeatPasswordInput,
      saveButton,
      backButton,
    });
  }

  private setValidationError(error: string): void {
    this.validationError = error;
    this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
  }

  private clearValidationError(): void {
    this.validationError = "";
    this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
  }

  componentDidUpdate(oldProps: BlockProps, newProps: BlockProps): boolean {
    const oldTypedProps = oldProps as EditPasswordPageProps;
    const newTypedProps = newProps as EditPasswordPageProps;

    if (oldTypedProps.user !== newTypedProps.user) {
      this.updateAvatarFromStore();
    }

    if (oldTypedProps.passwordError !== newTypedProps.passwordError) {
      this.clearValidationError();
    }

    return true;
  }

  private updateAvatarFromStore(): void {
    const { user } = this.props as EditPasswordPageProps;

    if (user) {
      const children = this.children as Record<string, Avatar>;
      const avatar = children.ProfileAvatar as Avatar;

      if (avatar) {
        avatar.setProps({
          avatarPath: user.avatar || "/noAvatar.svg",
          name: user.display_name || user.first_name || "Пользователь",
        });
      }
    }
  }

  private async handleSubmit(): Promise<void> {
    const { isLoading } = this.props as EditPasswordPageProps;

    this.clearValidationError();

    if (isLoading) {
      return;
    }

    const children = this.children as Record<string, Input>;
    const oldPasswordInput = children.oldPasswordInput;
    const newPasswordInput = children.newPasswordInput;
    const repeatPasswordInput = children.repeatPasswordInput;

    const isOldPasswordValid = oldPasswordInput.isValid();
    const isNewPasswordValid = newPasswordInput.isValid();
    const isRepeatPasswordValid = repeatPasswordInput.isValid();

    if (!isOldPasswordValid || !isNewPasswordValid || !isRepeatPasswordValid) {
      this.setValidationError("Некоторые поля содержат ошибки");
      return;
    }

    const oldPassword = oldPasswordInput.getValue();
    const newPassword = newPasswordInput.getValue();
    const repeatPassword = repeatPasswordInput.getValue();

    if (!oldPassword || !newPassword || !repeatPassword) {
      this.setValidationError("Все поля обязательны для заполнения");
      return;
    }

    if (newPassword !== repeatPassword) {
      this.setValidationError("Новый пароль и повторный пароль не совпадают");
      return;
    }

    if (oldPassword === newPassword) {
      this.setValidationError("Новый пароль должен отличаться от старого");
      return;
    }

    await updatePassword({
      oldPassword,
      newPassword,
    });

    const { passwordError } = this.props as EditPasswordPageProps;
    if (!passwordError) {
      sessionStorage.setItem("activeSettingsPage", "profile");
      Store.getInstance().set({ activeSettingsPage: "profile" });

      const updateInput = (inputName: string) => {
        const input = children[inputName] as Input;
        if (input) {
          input.setProps({ value: "" });
        }
      };

      updateInput("oldPasswordInput");
      updateInput("newPasswordInput");
      updateInput("repeatPasswordInput");
    }
  }

  render(): string {
    const { isLoading, passwordError } = this.props as EditPasswordPageProps;

    return `
      <div class="container">  
        <div class="edit-password">
          <div class="profile-header">
            {{{ProfileAvatar}}}
          </div>
          
          <form class="editPassword-form" autocomplete="off">
            {{{oldPasswordInput}}}
            {{{newPasswordInput}}}
            {{{repeatPasswordInput}}}
              ${isLoading ? "<div class=\"loading\">Сохранение...</div>" : ""}
            
            ${passwordError ? `<div class="error">${passwordError}</div>` : ""}
            
            ${
  this.validationError
    ? `<div class="error validation-error">${this.validationError}</div>`
    : ""
}
            <div class="btn-wrapper">
              {{{backButton}}}
              {{{saveButton}}}
            </div>
          </form>
        </div>
      </div>
    `;
  }
}

const mapStateToProps = (state: Record<string, unknown>) => ({
  isLoading: state.isLoading as boolean | undefined,
  passwordError: state.passwordError as string | undefined,
  user: state.user as EditPasswordPageProps["user"] | undefined,
});

export default connect(mapStateToProps)(withRouter(EditPasswordPage));
