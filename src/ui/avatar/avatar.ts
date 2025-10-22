import Block from "../../core/block";
import Modal from "../modal/modal";
import AvatarModalForm from "./avatarModalForm";
import "./avatar.scss";

interface AvatarProps {
  avatarPath: string;
  name: string;
  events?: {
    click?: (event: Event) => void;
  };
}

export default class Avatar extends Block {
  private fileName: string = "";
  private selectedFile: File | null = null;

  constructor(props: AvatarProps) {
    const avatarModalForm = new AvatarModalForm({
      onFileSelect: (event: Event) => {
        this.triggerFileInput();
      },
      onUpload: (event: Event) => {
        event.preventDefault();
        this.handleAvatarUpload();
      },
    });

    const avatarModal = new Modal({
      isOpen: false,
      children: [avatarModalForm],
      title: "Загрузите файл",
    });

    super("div", {
      ...props,
      avatarModal: avatarModal,
      avatarModalForm: avatarModalForm,
      events: {
        click: (event: Event) => {
          const target = event.target as HTMLElement;
          const avatarElement = target.closest(".avatar-clickable");
          if (avatarElement) {
            this.openModal();
            props.events?.click?.(event);
          }
        },
      },
    });
  }

  private triggerFileInput(): void {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";

    fileInput.addEventListener("change", (event) => {
      this.handleFileSelect(event);
      document.body.removeChild(fileInput);
    });

    document.body.appendChild(fileInput);
    fileInput.click();
  }

  private handleFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;

      const avatarModalForm = this.children.avatarModalForm as AvatarModalForm;
      avatarModalForm.updateFileInputDisplay(this.fileName);
    }
  }

  private openModal(): void {
    const avatarModal = this.children.avatarModal as Modal;
    avatarModal.open();

    this.fileName = "";
    this.selectedFile = null;

    const avatarModalForm = this.children.avatarModalForm as AvatarModalForm;
    avatarModalForm.updateFileInputDisplay("");
  }

  private handleAvatarUpload(): void {
    if (!this.selectedFile) {
      return;
    }
    console.log(this.selectedFile);
  }

  public setAvatarPath(newPath: string): void {
    this.setProps({ ...this.props, avatarPath: newPath });
  }

  public setName(newName: string): void {
    this.setProps({ ...this.props, name: newName });
  }

  render(): string {
    const { avatarPath, name } = this.props;

    return `
      <div class="avatar-container">
        <div class="image avatar-clickable">
          <img src="${avatarPath}" alt="Avatar" />
          <div class="overlay-text">Добавить аватар</div>
        </div>
        <p class="avatar-name">${name}</p>
        {{{avatarModal}}}
      </div>
    `;
  }
}
