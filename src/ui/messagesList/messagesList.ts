import Block from "../../core/block";
import MessageCard from "../messageCard/messageCard";

interface Message {
  id: number;
  text: string;
  time: string;
  isOutgoing: boolean;
  isRead?: boolean;
}

interface MessagesListProps {
  messages: Message[];
}

export default class MessagesList extends Block {
  constructor(props: MessagesListProps) {
    const messageCards = props.messages.map(
      (message) =>
        new MessageCard({
          text: message.text,
          time: message.time,
          isOutgoing: message.isOutgoing,
          isRead: message.isRead,
        })
    );

    super("div", {
      ...props,
      className: "messages-list",
      children: messageCards,
    });
  }

  render(): string {
    return `
      <div class="messages-list">
        {{#each children}}
          {{{this}}}
        {{/each}}
      </div>
    `;
  }
}
