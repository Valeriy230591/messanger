import Block from "../../core/block";
import Button from "../../ui/button/button";
import Input from "../../ui/input/input";

interface LoginPageProps {}

export default class LoginPage extends Block {
  constructor(props: LoginPageProps) {
    const loginInput = new Input({
      type: "text",
      id: "login",
      name: "login",
      label: "Логин",
      placeholder: "Логин",
      required: true,
    });

    const passwordInput = new Input({
      type: "password",
      id: "password",
      name: "password",
      label: "Пароль",
      placeholder: "Пароль",
      required: true,
    });

    const button = new Button({
      text: "Войти",
      type: "submit",
      variant: "primary",
      events: {
        click: (event: Event) => {
          event.preventDefault();
          this.handleSubmit();
        },
      },
    });

    const buttonSecondary = new Button({
      text: "Нет аккаунта?",
      type: "button",
      variant: "secondary",
      events: {
        click: (event: Event) => {
          event.preventDefault();
          // тут клик для перехода на signIn когда будет роутинг
        },
      },
    });

    super("div", {
      ...props,
      loginInput,
      passwordInput,
      button,
      buttonSecondary,
    });
  }

  private handleSubmit(): void {
    const loginInput = this.children.loginInput as Input;
    const passwordInput = this.children.passwordInput as Input;

    const login = loginInput.getValue();
    const password = passwordInput.getValue();

    console.log({
      login,
      password,
    });

    // Здесь функция для отправки данных на сервер
  }

  render(): string {
    return `
      <div class="container">
        <form class="login-form">
          <h1>Вход в систему</h1>
          
          {{{loginInput}}}
          {{{passwordInput}}}
          
          {{{button}}}
          {{{buttonSecondary}}}
        </form>
      </div>
    `;
  }
}
