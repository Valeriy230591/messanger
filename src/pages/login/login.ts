import Block from "../../core/block";
import Button from "../../ui/button/button";
import Input from "../../ui/input/input";
import { withRouter } from "../../utils/withRouter";
import { connect } from "../../utils/connect";
import { login } from "../../services/auth";
import Router from "../../core/Router";
import "./login.scss";

interface LoginPageProps {
  router?: Router;
  isLoading?: boolean;
  loginError?: string;
}

class LoginPage extends Block {
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
          const props = this.props as LoginPageProps;
          if (props.router) {
            props.router.go("/signin");
          }
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

  private async handleSubmit(): Promise<void> {
    const children = this.children as Record<string, Input>;
    const loginInput = children.loginInput;
    const passwordInput = children.passwordInput;

    const loginValue = loginInput.getValue();
    const passwordValue = passwordInput.getValue();

    if (!loginValue || !passwordValue) {
      console.error("Все поля обязательны для заполнения");
      return;
    }

    if (this.props.isLoading) {
      return;
    }

    await login({
      login: loginValue,
      password: passwordValue,
    });
  }

  render(): string {
    const { isLoading, loginError } = this.props as LoginPageProps;

    return `
      <div class="container">
        <form class="login-form">
          <h1>Вход в систему</h1>
          {{{loginInput}}}
          {{{passwordInput}}}
           ${isLoading ? '<div class="loading">Загрузка...</div>' : ""}
          
          ${loginError ? `<div class="error">${loginError}</div>` : ""}
          {{{button}}}
          {{{buttonSecondary}}}
        </form>
      </div>
    `;
  }
}

const mapStateToProps = (state: Record<string, unknown>) => ({
  isLoading: state.isLoading as boolean | undefined,
  loginError: state.loginError as string | undefined,
});

export default connect(mapStateToProps)(withRouter(LoginPage));
