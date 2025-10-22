import Block from "../../core/block";
import Button from "../../ui/button/button";
import Avatar from "../../ui/avatar/avatar";
import Input from "../../ui/input/input";

interface EditPasswordPageProps {}

export default class EditPasswordPage extends Block {
  constructor(props: EditPasswordPageProps) {
    const ProfileAvatar = new Avatar({
      avatarPath: "/noAvatar.svg",
      name: "Иван",
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
      placeholder: "Старый пароль ",
      value: "",
      inline: true,
      required: true,
    });
    const newPasswordInput = new Input({
      type: "password",
      id: "newPassword",
      name: "newPassword",
      label: "Новый пароль",
      placeholder: "Новый пароль ",
      value: "",
      inline: true,
      required: true,
    });
    const repeatPasswordInput = new Input({
      type: "password",
      id: "password",
      name: "password",
      label: "Повторите новый пароль",
      placeholder: "Новый пароль(еще раз)",
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
      oldPasswordInput,
      newPasswordInput,
      repeatPasswordInput,
      saveButton,
    });
  }
  private handleSubmit(): void {
    const oldPasswordInput = this.children.oldPasswordInput as Input;
    const newPasswordInput = this.children.newPasswordInput as Input;
    const repeatPasswordInput = this.children.repeatPasswordInput as Input;
    const isOldPasswordValid = oldPasswordInput.isValid();
    const isNewPasswordValid = newPasswordInput.isValid();
    const isRepeatPasswordValid = repeatPasswordInput.isValid();
    if (!isOldPasswordValid || !isNewPasswordValid || !isRepeatPasswordValid) {
      return;
    }
    const oldPassword = oldPasswordInput.getValue();
    const newPassword = newPasswordInput.getValue();
    const password = repeatPasswordInput.getValue();
    console.log({
      oldPassword,
      newPassword,
      password,
    });
  }
  render(): string {
    return `
      <div class="container">  
        {{{ProfileAvatar}}}
        <form class="editPassword-form" autocomplete="off">
           {{{oldPasswordInput}}}
           {{{newPasswordInput}}}
           {{{repeatPasswordInput}}}
          <div class="submit-wrapper">
            {{{saveButton}}}
          </div>
        </form>
      </div>
    `;
  }
}
