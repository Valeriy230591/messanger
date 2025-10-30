import Block from "../../core/block";
import Input from "../../ui/input/input";
import Button from "../../ui/button/button";

export default class RemoveUserForm extends Block {
  constructor() {
    const loginInput = new Input({
      type: "text",
      id: "login",
      name: "login",
      placeholder: "Логин",
      required: true,
    });

    const addUserButton = new Button({
      text: "Удалить",
      type: "submit",
      variant: "primary",
      events: {
        click: (event: Event) => {
          event.preventDefault();
          this.handleSubmit();
        },
      },
    });

    super("form", {
      className: "action-user-modal-form",
      loginInput,
      addUserButton,

      events: {
        submit: (event: Event) => {
          event.preventDefault();
          this.handleSubmit();
        },
      },
    });
  }

  private handleSubmit(): void {
    const loginValue = (this.children.loginInput as Input).getValue();
    const data = {
      login: loginValue,
    };

    console.log(data);
    // Логика отправки формы
  }

  render(): string {
    return `
   
        {{{loginInput}}}
        {{{addUserButton}}}
   
    `;
  }
}
