import Block from "../../core/block";

import ErrorStatus from "../../ui/errorStatus/errorStatus";
interface notFoundPageProps {}

export default class NotFoundPage extends Block {
  constructor(props: notFoundPageProps) {
    const error = new ErrorStatus({
      status: "404",
      text: "Не туда попали",
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
