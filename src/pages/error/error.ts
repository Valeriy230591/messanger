import Block from "../../core/block";

import ErrorStatus from "../../ui/errorStatus/errorStatus";
interface ErrorPageProps {}

export default class ErrorPage extends Block {
  constructor(props: ErrorPageProps) {
    const error = new ErrorStatus({
      status: "500",
      text: "Мы уже чиним",
      buttonText: "Назад к чатам",
    });
    super("div", {
      ...props,
      error,
    });
  }
  render(): string {
    return `
      <div class="container">  
        {{{error}}}
      </div>
    `;
  }
}
