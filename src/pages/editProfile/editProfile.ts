import Block, { type BlockProps } from "../../core/block";
import Button from "../../ui/button/button";
import Avatar from "../../ui/avatar/avatar";
import Input from "../../ui/input/input";
import { connect } from "../../utils/connect";
import { withRouter } from "../../utils/withRouter";
import { updateProfile } from "../../services/profile";
import Router from "../../core/Router";
import { Store } from "../../core/Store";
import "./editProfile.scss";

interface EditProfilePageProps extends BlockProps {
  router?: Router;
  isLoading?: boolean;
  profileError?: string;
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

class EditProfilePage extends Block {
  constructor(props: EditProfilePageProps) {
    const initialUser = props.user || {};

    const ProfileAvatar = new Avatar({
      avatarPath: initialUser.avatar || "/noAvatar.svg",
      name:
        initialUser.display_name || initialUser.first_name || "Пользователь",
      events: {
        click: (event: Event) => {
          event.preventDefault();
        },
      },
    });

    const emailInput = new Input({
      type: "email",
      id: "email",
      name: "email",
      label: "Почта",
      placeholder: "Почта",
      value: initialUser.email || "",
      inline: true,
      required: true,
    });

    const loginInput = new Input({
      type: "text",
      id: "login",
      name: "login",
      label: "Логин",
      placeholder: "Логин",
      value: initialUser.login || "",
      inline: true,
      required: true,
    });

    const firstNameInput = new Input({
      type: "text",
      id: "first_name",
      name: "first_name",
      label: "Имя",
      placeholder: "Имя",
      value: initialUser.first_name || "",
      inline: true,
      required: true,
    });

    const secondNameInput = new Input({
      type: "text",
      id: "second_name",
      name: "second_name",
      label: "Фамилия",
      placeholder: "Фамилия",
      value: initialUser.second_name || "",
      inline: true,
      required: true,
    });

    const displayNameInput = new Input({
      type: "text",
      id: "display_name",
      name: "display_name",
      label: "Имя в чате",
      placeholder: "Имя в чате",
      value: initialUser.display_name || "",
      inline: true,
      required: true,
    });

    const phoneInput = new Input({
      type: "tel",
      id: "phone",
      name: "phone",
      label: "Телефон",
      placeholder: "Телефон",
      value: initialUser.phone || "",
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
      emailInput,
      loginInput,
      firstNameInput,
      secondNameInput,
      displayNameInput,
      phoneInput,
      saveButton,
      backButton,
    });
  }

  componentDidMount() {
    this.updateInputsFromStore();
  }

  componentDidUpdate(oldProps: BlockProps, newProps: BlockProps): boolean {
    const oldTypedProps = oldProps as EditProfilePageProps;
    const newTypedProps = newProps as EditProfilePageProps;

    if (oldTypedProps.user !== newTypedProps.user) {
      this.updateInputsFromStore();
    }
    return true;
  }

  private updateInputsFromStore(): void {
    const { user } = this.props as EditProfilePageProps;

    if (user) {
      const children = this.children as Record<string, Input | Avatar>;

      const avatar = children.ProfileAvatar as Avatar;
      if (avatar) {
        avatar.setProps({
          avatarPath: user.avatar || "/noAvatar.svg",
          name: user.display_name || user.first_name || "Пользователь",
        });
      }

      const updateInput = (inputName: string, value: string) => {
        const input = children[inputName] as Input;
        if (input) {
          input.setProps({ value });
        }
      };

      updateInput("emailInput", user.email || "");
      updateInput("loginInput", user.login || "");
      updateInput("firstNameInput", user.first_name || "");
      updateInput("secondNameInput", user.second_name || "");
      updateInput("displayNameInput", user.display_name || "");
      updateInput("phoneInput", user.phone || "");
    }
  }

  private async handleSubmit(): Promise<void> {
    const { isLoading } = this.props as EditProfilePageProps;

    if (isLoading) {
      return;
    }

    const children = this.children as Record<string, Input>;

    const emailInput = children.emailInput;
    const loginInput = children.loginInput;
    const firstNameInput = children.firstNameInput;
    const secondNameInput = children.secondNameInput;
    const displayNameInput = children.displayNameInput;
    const phoneInput = children.phoneInput;

    const isEmailValid = emailInput.isValid();
    const isLoginValid = loginInput.isValid();
    const isFirstNameValid = firstNameInput.isValid();
    const isSecondNameValid = secondNameInput.isValid();
    const isDisplayNameValid = displayNameInput.isValid();
    const isPhoneValid = phoneInput.isValid();

    if (
      !isLoginValid ||
      !isEmailValid ||
      !isFirstNameValid ||
      !isSecondNameValid ||
      !isDisplayNameValid ||
      !isPhoneValid
    ) {
      console.error("Некоторые поля содержат ошибки");
      return;
    }

    const email = emailInput.getValue();
    const login = loginInput.getValue();
    const first_name = firstNameInput.getValue();
    const second_name = secondNameInput.getValue();
    const display_name = displayNameInput.getValue();
    const phone = phoneInput.getValue();

    if (
      !email ||
      !login ||
      !first_name ||
      !second_name ||
      !display_name ||
      !phone
    ) {
      console.error("Все поля обязательны для заполнения");
      return;
    }

    await updateProfile({
      first_name,
      second_name,
      display_name,
      login,
      email,
      phone,
    });

    const { profileError } = this.props as EditProfilePageProps;
    if (!profileError) {
      sessionStorage.setItem("activeSettingsPage", "profile");
      Store.getInstance().set({ activeSettingsPage: "profile" });
    }
  }

  render(): string {
    const { isLoading, profileError } = this.props as EditProfilePageProps;

    return `
      <div class="container">
        <div class="edit-profile">
          <div class="profile-header">
            {{{ProfileAvatar}}}
          </div>
          
          <form class="editProfile-form" autocomplete="off">
            ${isLoading ? '<div class="loading">Сохранение...</div>' : ""}
            
            ${profileError ? `<div class="error">${profileError}</div>` : ""}
            
            {{{emailInput}}}
            {{{loginInput}}}
            {{{firstNameInput}}}
            {{{secondNameInput}}}
            {{{displayNameInput}}}
            {{{phoneInput}}}
            
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
  profileError: state.profileError as string | undefined,
  user: state.user as EditProfilePageProps["user"] | undefined,
});

export default connect(mapStateToProps)(withRouter(EditProfilePage));
