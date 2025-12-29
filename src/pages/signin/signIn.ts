import Block from "../../core/block";
import Button from "../../ui/button/button";
import Input from "../../ui/input/input";
import { withRouter } from "../../utils/withRouter";
import { connect } from "../../utils/connect";
import { signIn } from "../../services/auth";
import Router from "../../core/Router";
import { configSignIn } from "./configSignIn";
import "./signin.scss";

interface SignInProps {
  router?: Router;
  isLoading?: boolean;
  signupError?: string;
}

interface FormFields {
  email: string;
  login: string;
  first_name: string;
  second_name: string;
  phone: string;
  password: string;
}

class SignIn extends Block {
  constructor(props: SignInProps) {
    const inputs = configSignIn.reduce((acc, config) => {
      acc[config.name!] = new Input(config);
      return acc;
    }, {} as Record<string, Input>);

    const submitButton = new Button({
      text: "Зарегистрироваться",
      variant: "primary",
      type: "submit",
      events: {
        click: (event: Event) => {
          event.preventDefault();
          this.handleSubmit();
        },
      },
    });

    const secondaryButton = new Button({
      text: "Войти",
      variant: "secondary",
      events: {
        click: (event: Event) => {
          event.preventDefault();
          const props = this.props as SignInProps;
          if (props.router) {
            props.router.go("/");
          }
        },
      },
    });

    super("div", {
      ...props,
      ...inputs,
      submitButton,
      secondaryButton,
    });
  }

  private async handleSubmit(): Promise<void> {
    const children = this.children as Record<string, Input>;

    let hasErrors = false;
    let firstErrorField: string | null = null;

    const fieldOrder = [
      "email",
      "login",
      "first_name",
      "second_name",
      "phone",
      "password",
    ];

    for (const fieldName of fieldOrder) {
      const input = children[fieldName];
      if (input) {
        const isValid = input.isValid();
        if (!isValid) {
          hasErrors = true;
          if (!firstErrorField) {
            firstErrorField = fieldName;
          }
        }
      }
    }

    if (hasErrors) {
      if (firstErrorField) {
        const input = children[firstErrorField];
        const inputElement = input.element?.querySelector("input");
        if (inputElement) {
          inputElement.focus();
        }
      }
      return;
    }

    const data: FormFields = {
      email: (children.email as Input).getValue(),
      login: (children.login as Input).getValue(),
      first_name: (children.first_name as Input).getValue(),
      second_name: (children.second_name as Input).getValue(),
      phone: (children.phone as Input).getValue(),
      password: (children.password as Input).getValue(),
    };

    if (this.props.isLoading) {
      return;
    }

    try {
      await signIn(data);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  }

  render(): string {
    const { isLoading, signupError } = this.props as SignInProps;

    return `
      <div class="container">
        <form class="signin-form">
          <h1>Регистрация</h1>
          ${signupError ? `<div class="form-error">${signupError}</div>` : ""}
          ${isLoading ? '<div class="loading">Загрузка...</div>' : ""}
          
          {{{email}}}
          {{{login}}}
          {{{first_name}}}
          {{{second_name}}}
          {{{phone}}}
          {{{password}}}
          
          {{{submitButton}}}
          {{{secondaryButton}}}
        </form>
      </div>
    `;
  }
}

const mapStateToProps = (state: Record<string, unknown>) => ({
  isLoading: state.isLoading as boolean | undefined,
  signupError: state.signupError as string | undefined,
});

export default connect(mapStateToProps)(withRouter(SignIn));
