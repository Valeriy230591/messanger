import Block from "../../core/block";
import "./chatCard.scss";

interface ChatCardProps {
  id: number;
  name: string;
  text: string;
  time: string;
  count?: number;
  isActive?: boolean;
  events?: {
    click?: () => void;
  };
}

export default class ChatCard extends Block {
  constructor(props: ChatCardProps) {
    const className = props.isActive ? "card active" : "card";

    super("div", {
      ...props,
      className: className,
      events: props.events,
    });
  }

  public updateCount(newCount: number): void {
    this.setProps({ ...this.props, count: newCount });
  }

  public updateLastMessage(message: string): void {
    this.setProps({ ...this.props, text: message });
  }

  render(): string {
    const { name, text, time, count, isActive } = this.props;

    return `
      <div class="${isActive ? "card active" : "card"}">
        <div class="info">
          <div class="no-photo"></div>
          <div class="left-info">
            <p class="info-name">${name}</p>
            <div class="last-message">${text}</div>
          </div>
        </div>
        <div class="right-info">
          <p class="time">${time}</p>
          ${count ? `<p class="count">${count}</p>` : ""}
        </div>
      </div>
    `;
  }
}
