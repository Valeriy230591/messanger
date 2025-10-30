import Block from "../../core/block";
import Button from "../../ui/button/button";
import Input from "../../ui/input/input";
import { configSignIn } from "./configSignIn";
interface SignInProps {}

interface FormFields {
  email: string;
  login: string;
  first_name: string;
  second_name: string;
  phone: string;
  password: string;
  newPassword: string;
}

export default class SignIn extends Block {
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
    });

    super("div", {
      ...props,
      ...inputs,
      submitButton,
      secondaryButton,
    });
  }

  private handleSubmit(): void {
    const data: FormFields = {
      email: (this.children.email as Input).getValue(),
      login: (this.children.login as Input).getValue(),
      first_name: (this.children.first_name as Input).getValue(),
      second_name: (this.children.second_name as Input).getValue(),
      phone: (this.children.phone as Input).getValue(),
      password: (this.children.password as Input).getValue(),
      newPassword: (this.children.newPassword as Input).getValue(),
    };

    console.log(data);
  }

  render(): string {
    return `
      <div class="container">
        <form class="signin-form" autocomplete="off">
          <h1>Регистрация</h1>
          {{{email}}}
          {{{login}}}
          {{{first_name}}}
          {{{second_name}}}
          {{{phone}}}
          {{{password}}}
          {{{newPassword}}}
          {{{submitButton}}}
          {{{secondaryButton}}}
        </form>
      </div>
    `;
  }
}
