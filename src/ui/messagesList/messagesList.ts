import Block from "../../core/block";
import MessageCard from "../messageCard/messageCard";

interface ServerMessage {
  id: number;
  user_id: number;
  chat_id: number;
  type: string;
  time: string;
  content: string;
  is_read: boolean;
  file: null | string;
}

interface MessagesListProps {
  messages: ServerMessage[];
  currentUserId?: number;
}

export default class MessagesList extends Block {
  constructor(props: MessagesListProps) {
    super("div", {
      ...props,
      className: "messages-list",
      children: [],
    });

    this.createMessageCards(props.messages, props.currentUserId);
  }

  private createMessageCards(
    messages: ServerMessage[],
    currentUserId?: number
  ): void {
    const sortedMessages = this.sortMessagesByTime(messages);

    const messageCards = sortedMessages.map(
      (message) =>
        new MessageCard({
          id: message.id,
          text: message.content,
          time: this.formatTime(message.time),
          isOutgoing: message.user_id === currentUserId,
          isRead: message.is_read,
        })
    );

    this.children.children = messageCards;
  }

  componentDidUpdate(
    oldProps: Record<string, unknown>,
    newProps: Record<string, unknown>
  ): boolean {
    if (
      oldProps.messages !== newProps.messages ||
      oldProps.currentUserId !== newProps.currentUserId
    ) {
      const messages = (newProps.messages as ServerMessage[]) || [];
      const currentUserId = newProps.currentUserId as number | undefined;

      const sortedMessages = this.sortMessagesByTime(messages);

      const newMessageCards = sortedMessages.map(
        (message) =>
          new MessageCard({
            id: message.id,
            text: message.content,
            time: this.formatTime(message.time),
            isOutgoing: message.user_id === currentUserId,
            isRead: message.is_read,
          })
      );

      this.children.children = newMessageCards;
      this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
    }

    return true;
  }

  private formatTime(timeString: string): string {
    if (!timeString) return "";
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }

  private sortMessagesByTime(messages: ServerMessage[]): ServerMessage[] {
    return [...messages].sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeA - timeB;
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
