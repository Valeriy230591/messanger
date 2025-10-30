import Block from "../../core/block";
import "./userModal.scss";

interface UserModalProps {
  isOpen?: boolean;
  positionX?: number;
  positionY?: number;
  onAddUser?: () => void;
  onRemoveUser?: () => void;
  onClose?: () => void;
}

export default class UserModal extends Block {
  constructor(props: UserModalProps = {}) {
    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const action = target
        .closest("[data-action]")
        ?.getAttribute("data-action");

      if (action === "add-user" && props.onAddUser) {
        props.onAddUser();
      } else if (action === "remove-user" && props.onRemoveUser) {
        props.onRemoveUser();
      }

      if (action || !target.closest(".modal-content")) {
        if (props.onClose) {
          props.onClose();
        }
      }
    };

    super("div", {
      ...props,
      className: `${props.isOpen ? "modal modal-open" : "modal"}`,
      events: {
        click: handleClick,
      },
    });
  }

  public open(): void {
    this.setProps({ ...this.props, isOpen: true });
  }

  public close(): void {
    this.setProps({ ...this.props, isOpen: false });
  }

  public setPosition(x: number, y: number): void {
    this.setProps({ ...this.props, positionX: x, positionY: y });
  }

  componentDidUpdate(
    oldProps: Record<string, unknown>,
    newProps: Record<string, unknown>
  ): boolean {
    const oldUserProps = oldProps as UserModalProps;
    const newUserProps = newProps as UserModalProps;

    if (
      this._element &&
      (newUserProps.positionX !== oldUserProps.positionX ||
        newUserProps.positionY !== oldUserProps.positionY)
    ) {
      this.updatePosition();
    }

    if (newUserProps.isOpen) {
      this._element?.classList.add("modal-open");
    } else {
      this._element?.classList.remove("modal-open");
    }

    return true;
  }

  private updatePosition(): void {
    const modalElement = this._element;
    const props = this.props as UserModalProps;

    if (
      modalElement &&
      props.positionX !== undefined &&
      props.positionY !== undefined
    ) {
      modalElement.style.position = "fixed";
      modalElement.style.left = `${props.positionX - 200}px`;
      modalElement.style.top = `${props.positionY + 10}px`;
      modalElement.style.zIndex = "1000";
    }
  }

  render(): string {
    return `
      <div class="modal-content">
        <div class="modal-body">
          <button class="modal-btn" data-action="add-user">
            <div class="plus">
              <img src="/plus.svg">
            </div>
            <p class="modal-btn--text">Добавить пользователя</p>
          </button>
          <button class="modal-btn" data-action="remove-user">
            <div class="plus">
              <img class="img-plus" src="/plus.svg">
            </div>
            <p class="modal-btn--text">Удалить пользователя</p>
          </button>
        </div>
      </div>
    `;
  }
}
