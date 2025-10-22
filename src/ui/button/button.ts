import Block from "../../core/block";
import "./button.scss";

interface ButtonProps {
  text?: string;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  events?: {
    click?: (event: Event) => void;
    submit?: (event: Event) => void;
  };
}

export default class Button extends Block {
  constructor(props: ButtonProps) {
    super("button", {
      ...props,
      attrs: {
        type: props.type || "button",
        class: `button ${props.variant ? `button--${props.variant}` : ""} ${
          props.disabled ? "button--disabled" : ""
        }`,
        ...(props.disabled && { disabled: "disabled" }),
      },
    });
  }

  render(): string {
    const { text } = this.props;

    return `${text || ""}`;
  }
}
