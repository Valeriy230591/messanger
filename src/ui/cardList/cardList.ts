import Block from "../../core/block";
import ChatCard from "../chatCard/chatCard";
import type { Chat, ChatCardListProps } from "../../pages/chat/types";

interface ChatCardListState {
  selectedChatId?: number;
}

export default class ChatCardList extends Block {
  constructor(props: ChatCardListProps) {
    const initialState: ChatCardListState = {
      selectedChatId: undefined,
    };

    const handleChatClick = (chatId: number) => {
      this.setProps({ selectedChatId: chatId });

      if (props.onChatClick) {
        props.onChatClick(chatId);
      }
    };

    const chatCards = props.chats.map(
      (chat) =>
        new ChatCard({
          ...chat,
          isActive: false,
          events: {
            click: () => handleChatClick(chat.id),
          },
        })
    );

    super("div", {
      ...props,
      className: "chat-card-list",
      chatCards,
      ...initialState,
    });
  }

  componentDidUpdate(
    oldProps: Record<string, unknown>,
    newProps: Record<string, unknown>
  ): boolean {
    const shouldUpdate =
      oldProps.chats !== newProps.chats ||
      oldProps.onChatClick !== newProps.onChatClick ||
      oldProps.selectedChatId !== newProps.selectedChatId;

    if (shouldUpdate) {
      const chats = (newProps.chats as Chat[]) || [];
      const onChatClick = newProps.onChatClick as
        | ((chatId: number) => void)
        | undefined;
      const selectedChatId = newProps.selectedChatId as number | undefined;

      const handleChatClick = (chatId: number) => {
        this.setProps({ selectedChatId: chatId });

        if (onChatClick) {
          onChatClick(chatId);
        }
      };

      const newChatCards = chats.map(
        (chat) =>
          new ChatCard({
            ...chat,
            isActive: chat.id === selectedChatId,
            events: {
              click: () => handleChatClick(chat.id),
            },
          })
      );

      this.children.chatCards = newChatCards;

      this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
    }

    return true;
  }

  render(): string {
    return `
      <div class="chat-card-list">
        {{#each chatCards}}
          {{{this}}}
        {{/each}}
      </div>
    `;
  }
}
