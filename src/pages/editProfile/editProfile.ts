import Block from "../../core/block";
import Button from "../../ui/button/button";
import Avatar from "../../ui/avatar/avatar";
import Input from "../../ui/input/input";

interface EditProfilePageProps {}

export default class EditProfilePage extends Block {
  constructor(props: EditProfilePageProps) {
    // Аватар с обработчиком клика
    const ProfileAvatar = new Avatar({
      avatarPath: "/noAvatar.svg",
      name: "Иван",
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
      value: "",
      inline: true,
      required: true,
    });
    const loginInput = new Input({
      type: "text",
      id: "login",
      name: "login",
      label: "Логин",
      placeholder: "Логин",
      value: "",
      inline: true,
      required: true,
    });
    const firstNameInput = new Input({
      type: "text",
      id: "first_name",
      name: "first_name",
      label: "Имя",
      placeholder: "Имя",
      value: "",
      inline: true,
      required: true,
    });
    const secondNameInput = new Input({
      type: "text",
      id: "second_name",
      name: "second_name",
      label: "Фамилия",
      placeholder: "Фамилия",
      value: "",
      inline: true,
      required: true,
    });
    const displayNameInput = new Input({
      type: "text",
      id: "name",
      name: "display_name",
      label: "Имя в чате",
      placeholder: "Имя в чате",
      value: "",
      inline: true,
      required: true,
    });
    const phoneInput = new Input({
      type: "tel",
      id: "phone",
      name: "phone",
      label: "Телефон",
      placeholder: "Телефон",
      value: "",
      inline: true,
      required: true,
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
    });
  }
  private handleSubmit(): void {
    const emailInput = this.children.emailInput as Input;
    const loginInput = this.children.loginInput as Input;
    const firstNameInput = this.children.firstNameInput as Input;
    const secondNameInput = this.children.secondNameInput as Input;
    const displayNameInput = this.children.displayNameInput as Input;
    const phoneInput = this.children.phoneInput as Input;

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
      return;
    }
    const email = emailInput.getValue();
    const login = loginInput.getValue();
    const first_name = firstNameInput.getValue();
    const second_name = secondNameInput.getValue();

    const display_name = displayNameInput.getValue();
    const phone = phoneInput.getValue();

    console.log({
      email,
      login,
      first_name,
      second_name,
      display_name,
      phone,
    });
  }
  render(): string {
    return `
      <div class="container">
        {{{ProfileAvatar}}}
      <form class="editProfile-form" autocomplete="off">
            {{{emailInput}}}
            {{{loginInput}}}
            {{{firstNameInput}}}
            {{{secondNameInput}}}
            {{{displayNameInput}}}
            {{{phoneInput}}}
            <div class="btn-wrapper">
            {{{saveButton}}}
            </div>
            
        </form>
      </div>
    `;
  }
}
