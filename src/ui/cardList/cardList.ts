import Block from "../../core/block";
import ChatCard from "../chatCard/chatCard";

interface Chat {
  id: number;
  name: string;
  text: string;
  time: string;
  count?: number;
}

interface ChatCardListProps {
  chats: Chat[];
}

export default class ChatCardList extends Block {
  constructor(props: ChatCardListProps) {
    const chatCards = props.chats.map((chat) => new ChatCard(chat));

    super("div", {
      ...props,
      className: "chat-card-list",
      children: chatCards,
    });
  }

  render(): string {
    return `

        {{#each children}}
          {{{this}}}
        {{/each}}
   
    `;
  }
}
