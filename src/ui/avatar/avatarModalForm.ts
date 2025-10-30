import Block from "../../core/block";
import Button from "../button/button";

interface AvatarModalFormProps {
  onFileSelect: (event: Event) => void;
  onUpload: (event: Event) => void;
  fileName?: string;
}

export default class AvatarModalForm extends Block {
  constructor(props: AvatarModalFormProps) {
    const initialClassName = props.fileName
      ? "avatar-file-input has-file"
      : "avatar-file-input";

    const fileInputComponent = new Block("div", {
      className: initialClassName,
      events: {
        click: (event: Event) => {
          props.onFileSelect(event);
        },
      },
    });

    const uploadButton = new Button({
      text: "Загрузить фото",
      variant: "primary",
      events: {
        click: (event: Event) => {
          event.preventDefault();
          props.onUpload(event);
        },
      },
    });

    super("div", {
      className: "avatar-modal-form",
      fileInputComponent,
      uploadButton,
      fileName: props.fileName || "",
    });

    this.updateFileInputDisplay(props.fileName);
  }

  public updateFileInputDisplay(fileName?: string): void {
    const fileInputComponent = this.children.fileInputComponent as Block;
    if (fileInputComponent) {
      const displayText = fileName ? `${fileName}` : "Выберите файл";
      const className = fileName
        ? "avatar-file-input has-file"
        : "avatar-file-input";

      fileInputComponent.setProps({
        className: className,
      });

      if (fileInputComponent.element) {
        fileInputComponent.element.innerHTML = `
          <div class="file-input-placeholder">${displayText}</div>
           
        `;
      }
    }
  }

  render(): string {
    return `
      <div class="avatar-modal-form">
        {{{fileInputComponent}}}
        {{{uploadButton}}}
      </div>
    `;
  }
}
