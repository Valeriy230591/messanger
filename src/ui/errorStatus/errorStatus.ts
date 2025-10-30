import Block from "../../core/block";
import Button from "../../ui/button/button";
import "./errorStatus.scss";

interface ErrorProps {
  status: string;
  text: string;
  buttonText: string;
  events?: {
    click?: (event: Event) => void;
  };
}

export default class Error extends Block {
  constructor(props: ErrorProps) {
    const button = new Button({
      text: props.buttonText,
      variant: "secondary",
      events: {
        click: (event: Event) => {
          props.events?.click?.(event);
        },
      },
    });

    super("div", {
      ...props,
      button,
      className: "container-error",
    });
  }

  public setStatus(newStatus: string): void {
    this.setProps({ ...this.props, status: newStatus });
  }

  public setText(newText: string): void {
    this.setProps({ ...this.props, text: newText });
  }

  public setButtonText(newButtonText: string): void {
    this.setProps({ ...this.props, buttonText: newButtonText });
  }

  render(): string {
    return `
    
        <div class="error-info">
          <h1 class="status">{{status}}</h1>
          <p class="text">{{text}}</p>
        </div>
        {{{button}}}
      
    `;
  }
}
