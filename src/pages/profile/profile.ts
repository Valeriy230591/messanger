import Block from "../../core/block";
import Button from "../../ui/button/button";
import Avatar from "../../ui/avatar/avatar";
import Input from "../../ui/input/input";

interface ProfilePageProps {}

export default class ProfilePage extends Block {
  constructor(props: ProfilePageProps) {
    const ProfileAvatar = new Avatar({
      avatarPath: "/noAvatar.svg",
      name: "Иван",
    });
    const emailInput = new Input({
      type: "email",
      id: "email",
      name: "email",
      label: "Почта",
      placeholder: "Почта",
      value: "ivan@example.com",
      inline: true,
      disabled: true,
    });
    const loginInput = new Input({
      type: "text",
      id: "login",
      name: "login",
      label: "Логин",
      placeholder: "Логин",
      value: "ivan123",
      inline: true,
      disabled: true,
    });
    const firstNameInput = new Input({
      type: "text",
      id: "first_name",
      name: "first_name",
      label: "Имя",
      placeholder: "Имя",
      value: "Иван",
      inline: true,
      disabled: true,
    });
    const secondNameInput = new Input({
      type: "text",
      id: "second_name",
      name: "second_name",
      label: "Фамилия",
      placeholder: "Фамилия",
      value: "Иванов",
      inline: true,
      disabled: true,
    });
    const displayNameInput = new Input({
      type: "text",
      id: "name",
      name: "display_name",
      label: "Имя в чате",
      placeholder: "Имя в чате",
      value: "Иван",
      inline: true,
      disabled: true,
    });
    const phoneInput = new Input({
      type: "tel",
      id: "phone",
      name: "phone",
      label: "Телефон",
      placeholder: "Телефон",
      value: "+7 (123) 456-78-90",
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
          // тут клик для перехода на editProfile когда будет роутинг
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
          // тут клик для перехода на editPassword когда будет роутинг
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
          // тут клик для перехода назад по истории? когда будет роутинг
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
