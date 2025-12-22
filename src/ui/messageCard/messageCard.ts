import Block from "../../core/block";
import "./messageCard.scss";

interface MessageCardProps {
  id: number;
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
    const { text, time, isOutgoing, isRead } = this.props;

    return `
      <div class="message-content">
        <p class="text-block">${text}</p>
        <div class="message-footer">
          ${
            isOutgoing
              ? isRead
                ? '<img src="/read.svg" class="read-status" alt="Прочитано">'
                : '<img src="/unread.svg" class="read-status" alt="Не прочитано">'
              : ""
          }
          <p class="time-block">${time}</p>
        </div>
      </div>
    `;
  }
}
