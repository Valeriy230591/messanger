import Block from "../../core/block";
import "./messageCard.scss";

interface MessageCardProps {
  text: string;
  time: string;
  isOutgoing?: boolean;
  isRead?: boolean;
}

export default class MessageCard extends Block {
  constructor(props: MessageCardProps) {
    const baseClassName = props.isOutgoing
      ? "message-card message-outgoing"
      : "message-card";

    super("div", {
      ...props,
      className: baseClassName,
    });
  }

  render(): string {
    const { text, time, isRead } = this.props;

    return `
      <p class="text-block">${text}</p>
      <div class="message-footer">
        ${
  this.props.isOutgoing
    ? `
          ${isRead ? "<img src=\"/read.svg\" class=\"read-status\">" : ""}
        `
    : ""
}
        <p class="time-block">${time}</p>
      </div>
    `;
  }
}
