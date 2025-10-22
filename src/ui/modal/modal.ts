import Block from "../../core/block";
import "./modal.scss";

interface ModalProps {
  isOpen: boolean;
  children?: Block | Block[];
  title?: string;
  events?: {
    click?: (event: Event) => void;
  };
}

export default class Modal extends Block {
  constructor(props: ModalProps) {
    const defaultEvents = {
      click: (event: Event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains("modalform-overlay")) {
          this.close();
        }
        props.events?.click?.(event);
      },
    };

    super("div", {
      ...props,
      events: defaultEvents,
    });
  }

  public open(): void {
    this.setProps({ ...this.props, isOpen: true });
  }

  public close(): void {
    this.setProps({ ...this.props, isOpen: false });
  }

  public toggle(): void {
    this.setProps({ ...this.props, isOpen: !this.props.isOpen });
  }

  render(): string {
    const { isOpen } = this.props;

    return `
      <div class="modalform-overlay ${isOpen ? "modal-open" : ""}">
        <div class="modalform">
        <h1 class="modalform-title">${
  this.props.title ? this.props.title : ""
}</h1>
          {{#each children}}
            {{{this}}}
          {{/each}}
        </div>
      </div>
    `;
  }
}
