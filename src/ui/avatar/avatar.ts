import Block from "../../core/block";
import Modal from "../modal/modal";
import AvatarModalForm from "./avatarModalForm";
import { updateAvatar } from "../../services/profile";
import { userMe } from "../../services/auth";
import type { UserDTO } from "../../api/auth/types";
import "./avatar.scss";

interface AvatarProps {
  avatarPath: string;
  name: string;
  events?: {
    click?: (event: Event) => void;
    onAvatarUpdated?: (newAvatarPath: string) => void;
  };
}

export default class Avatar extends Block {
  private fileName: string = "";
  private selectedFile: File | null = null;

  constructor(props: AvatarProps) {
    const avatarModalForm = new AvatarModalForm({
      onFileSelect: (_event: Event) => {
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
      isUploading: false,
      uploadError: null,
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

    this.loadUserData();
  }

  private async loadUserData(): Promise<void> {
    try {
      const storeState = window.store?.getState?.();
      if (storeState?.user && this.isValidUser(storeState.user)) {
        this.updateUserData(storeState.user);
        return;
      }

      const user = await userMe();

      if (user && this.isValidUser(user)) {
        this.updateUserData(user);

        if (window.store?.set) {
          window.store.set({ user });
        }
      } else {
        console.warn("Получены некорректные данные пользователя:", user);
      }
    } catch (error) {
      console.error("Ошибка при получении данных пользователя:", error);
    }
  }

  private isValidUser(obj: unknown): obj is UserDTO {
    return (
      !!obj &&
      typeof obj === "object" &&
      "id" in obj &&
      "login" in obj &&
      "first_name" in obj &&
      "second_name" in obj &&
      "display_name" in obj &&
      "avatar" in obj &&
      "phone" in obj &&
      "email" in obj
    );
  }

  private updateUserData(user: UserDTO): void {
    if (user.avatar) {
      const fullPath = this.getFullAvatarUrl(user.avatar);
      this.setAvatarPath(fullPath);
    }

    if (user.display_name || user.first_name) {
      this.setName(user.display_name || user.first_name || "");
    }
  }

  private triggerFileInput(): void {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/jpeg,image/jpg,image/png,image/gif,image/webp";
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
      const file = input.files[0];

      this.selectedFile = file;
      this.fileName = this.selectedFile.name;
      this.setProps({ uploadError: null });

      const avatarModalForm = this.children.avatarModalForm as AvatarModalForm;
      avatarModalForm.updateFileInputDisplay(this.fileName);
    }
  }

  private openModal(): void {
    const avatarModal = this.children.avatarModal as Modal;
    avatarModal.open();

    this.fileName = "";
    this.selectedFile = null;
    this.setProps({ uploadError: null });

    const avatarModalForm = this.children.avatarModalForm as AvatarModalForm;
    avatarModalForm.updateFileInputDisplay("");
  }

  private getFullAvatarUrl(path: string | null): string {
    if (!path) return "/default-avatar.png";

    if (path.startsWith("http")) return path;

    if (path.startsWith("/")) {
      return `https://ya-praktikum.tech/api/v2/resources${path}`;
    }

    return path;
  }

  private async handleAvatarUpload(): Promise<void> {
    if (!this.selectedFile) {
      this.setProps({ uploadError: "Выберите файл для загрузки" });
      return;
    }

    try {
      this.setProps({ isUploading: true, uploadError: null });

      await updateAvatar(this.selectedFile);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const user = await userMe();

      if (user && user.avatar) {
        const timestamp = new Date().getTime();
        const avatarURL = this.getFullAvatarUrl(
          `${user.avatar}?t=${timestamp}`
        );

        this.setAvatarPath(avatarURL);

        window.store.set({ user });
      }

      const avatarModal = this.children.avatarModal as Modal;
      avatarModal.close();

      setTimeout(() => {
        this.setProps({ isUploading: false });
      }, 300);

      const events = this.props.events as AvatarProps["events"];
      const onAvatarUpdated = events?.onAvatarUpdated;
      if (onAvatarUpdated && user?.avatar && typeof user.avatar === "string") {
        onAvatarUpdated(user.avatar);
      }
    } catch (error) {
      console.error("Ошибка при загрузке аватара:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка при загрузке файла";
      this.setProps({
        isUploading: false,
        uploadError: errorMessage,
      });
    }
  }

  public setAvatarPath(newPath: string): void {
    const fullPath = this.getFullAvatarUrl(newPath);
    this.setProps({
      ...this.props,
      avatarPath: fullPath,
    });
  }

  public setName(newName: string): void {
    this.setProps({ ...this.props, name: newName });
  }

  componentDidUpdate(
    oldProps: Record<string, unknown>,
    newProps: Record<string, unknown>
  ): boolean {
    if (oldProps.user !== newProps.user) {
      const user = newProps.user as UserDTO | null;
      if (user) {
        this.updateUserData(user);
      }
    }

    return true;
  }

  render(): string {
    const avatarPath =
      typeof this.props.avatarPath === "string" ? this.props.avatarPath : "";
    const name = typeof this.props.name === "string" ? this.props.name : "";
    const isUploading = !!this.props.isUploading;
    const uploadError =
      typeof this.props.uploadError === "string" ? this.props.uploadError : "";

    return `
      <div class="avatar-container">
        <div class="image avatar-clickable">
          <img src="${avatarPath || "/default-avatar.png"}" alt="Avatar" />
          <div class="overlay-text">Добавить аватар</div>
        </div>
        <p class="avatar-name">${name}</p>

        ${uploadError ? `<div class="avatar-error">${uploadError}</div>` : ""}

        ${
          isUploading
            ? `
          <div class="avatar-uploading">
            <div class="spinner"></div>
            <span>Загрузка...</span>
          </div>
        `
            : ""
        }

        {{{avatarModal}}}
      </div>
    `;
  }
}
