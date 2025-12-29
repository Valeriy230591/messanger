import Block from "../../core/block";
import Button from "../../ui/button/button";
import Avatar from "../../ui/avatar/avatar";
import Input from "../../ui/input/input";
import { Store } from "../../core/Store";
import { logout, userMe } from "../../services/auth";
import type { UserDTO } from "../../api/auth/types";

export default class ProfilePage extends Block {
  constructor(props: Record<string, unknown>) {
    const store = Store.getInstance();
    const state = store.getState();

    const user = state.user as UserDTO | undefined;

    const ProfileAvatar = new Avatar({
      avatarPath: user?.avatar || "/noAvatar.svg",
      name: user?.display_name || user?.first_name || "Иван",
      events: {
        onAvatarUpdated: (newAvatarPath: string) => {
          store.set({
            user: {
              ...(user as UserDTO),
              avatar: newAvatarPath,
            },
          });
        },
      },
    });

    const emailInput = new Input({
      type: "email",
      id: "email",
      name: "email",
      label: "Почта",
      placeholder: "Почта",
      value: user?.email || "ivan@example.com",
      inline: true,
      disabled: true,
    });

    const loginInput = new Input({
      type: "text",
      id: "login",
      name: "login",
      label: "Логин",
      placeholder: "Логин",
      value: user?.login || "ivan123",
      inline: true,
      disabled: true,
    });

    const firstNameInput = new Input({
      type: "text",
      id: "first_name",
      name: "first_name",
      label: "Имя",
      placeholder: "Имя",
      value: user?.first_name || "Иван",
      inline: true,
      disabled: true,
    });

    const secondNameInput = new Input({
      type: "text",
      id: "second_name",
      name: "second_name",
      label: "Фамилия",
      placeholder: "Фамилия",
      value: user?.second_name || "Иванов",
      inline: true,
      disabled: true,
    });

    const displayNameInput = new Input({
      type: "text",
      id: "name",
      name: "display_name",
      label: "Имя в чате",
      placeholder: "Имя в чате",
      value: user?.display_name || user?.first_name || "Иван",
      inline: true,
      disabled: true,
    });

    const phoneInput = new Input({
      type: "tel",
      id: "phone",
      name: "phone",
      label: "Телефон",
      placeholder: "Телефон",
      value: user?.phone || "+7 (123) 456-78-90",
      inline: true,
      disabled: true,
    });

    const editProfileLink = new Button({
      text: "Изменить данные",
      type: "button",
      variant: "secondary",
      events: {
        click: (event: Event) => {
          event.preventDefault();

          sessionStorage.setItem("activeSettingsPage", "editProfile");
          Store.getInstance().set({ activeSettingsPage: "editProfile" });
        },
      },
    });

    const editPasswordLink = new Button({
      text: "Изменить пароль",
      type: "button",
      variant: "secondary",
      events: {
        click: (event: Event) => {
          event.preventDefault();

          sessionStorage.setItem("activeSettingsPage", "editPassword");
          Store.getInstance().set({ activeSettingsPage: "editPassword" });
        },
      },
    });

    const exitLink = new Button({
      text: "Выйти",
      type: "button",
      variant: "secondary",
      events: {
        click: (event: Event) => {
          event.preventDefault();

          sessionStorage.removeItem("activeSettingsPage");
          logout();
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
      editProfileLink,
      editPasswordLink,
      exitLink,
    });
  }

  async componentDidMount(): Promise<void> {
    try {
      const store = Store.getInstance();
      const state = store.getState();

      let user = state.user as UserDTO | undefined;

      if (!user) {
        const userResponse = await userMe();
        if (userResponse !== null) {
          user = userResponse;
          store.set({ user });
          this.updateChildComponents(user);
        } else {
          this.redirectToLogin();
          return;
        }
      } else {
        this.updateChildComponents(user);
      }
    } catch (error) {
      console.error("Ошибка при загрузке профиля:", error);
      this.redirectToLogin();
    }
  }

  componentDidUpdate(
    oldProps: Record<string, unknown>,
    newProps: Record<string, unknown>
  ): boolean {
    const oldState = oldProps as { user?: UserDTO };
    const newState = newProps as { user?: UserDTO };

    if (oldState.user !== newState.user && newState.user) {
      this.updateChildComponents(newState.user);
      return true;
    }

    return false;
  }

  private updateChildComponents(user: UserDTO): void {
    const avatar = this.children.ProfileAvatar as Avatar;
    if (user.avatar) {
      avatar.setAvatarPath(user.avatar);
    }
    if (user.display_name || user.first_name) {
      avatar.setName(user.display_name || user.first_name || "");
    }

    const emailInput = this.children.emailInput as Input;
    emailInput.setProps({ value: user.email || "" });

    const loginInput = this.children.loginInput as Input;
    loginInput.setProps({ value: user.login || "" });

    const firstNameInput = this.children.firstNameInput as Input;
    firstNameInput.setProps({ value: user.first_name || "" });

    const secondNameInput = this.children.secondNameInput as Input;
    secondNameInput.setProps({ value: user.second_name || "" });

    const displayNameInput = this.children.displayNameInput as Input;
    displayNameInput.setProps({
      value: user.display_name || user.first_name || "",
    });

    const phoneInput = this.children.phoneInput as Input;
    phoneInput.setProps({ value: user.phone || "" });
  }

  private redirectToLogin(): void {
    sessionStorage.removeItem("activeSettingsPage");

    if (window.router) {
      window.router.go("/");
    }
  }

  render(): string {
    return `
      <div class="container">  
        {{{ProfileAvatar}}}
        <form class="profile-form">
          {{{emailInput}}}
          {{{loginInput}}}
          {{{firstNameInput}}}
          {{{secondNameInput}}}
          {{{displayNameInput}}}
          {{{phoneInput}}}
          {{{editProfileLink}}}
          {{{editPasswordLink}}}
          {{{exitLink}}}
        </form>
      </div>
    `;
  }
}
