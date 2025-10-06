import Handlebars from "handlebars";
import * as Page from "./pages";
import * as Components from "./ui";
import { mockAndConfigs } from "./const/mockAndConfig";
import "./style.scss";

const partials = {
  button: Components.Button,
  input: Components.Input,
  form: Components.Form,
  errorStatus: Components.errorStatus,
  avatar: Components.Avatar,
  profileForm: Components.profileForm,
  chatCard: Components.chatCard,
  cardList: Components.cardList,
  messageCard: Components.messageCard,
  messagesList: Components.messagesList,
  userModal: Components.userModal,
  formModal: Components.formModal,
};

Object.entries(partials).forEach(([name, component]) => {
  Handlebars.registerPartial(name, component);
});

const templates = {
  error: Handlebars.compile(Page.error),
  notFound: Handlebars.compile(Page.notFound),
  login: Handlebars.compile(Page.Login),
  signin: Handlebars.compile(Page.SignIn),
  navigate: Handlebars.compile(Page.Navigate),
  profile: Handlebars.compile(Page.Profile),
  editProfile: Handlebars.compile(Page.editProfile),
  editPassword: Handlebars.compile(Page.editPassword),
  chat: Handlebars.compile(Page.Chat),
};

document.body.innerHTML = `
    ${templates.navigate({})}
    <main id="content"></main>
`;

function showPage(page: string) {
  const content = document.getElementById("content");
  if (content) {
    const template = templates[page as keyof typeof templates];
    const config = mockAndConfigs[page as keyof typeof mockAndConfigs];

    if (template && config) {
      content.innerHTML = template(config);

      if (page === "chat") {
        setupChatModalHandlers();
      } else if (page === "editProfile") {
        setupAvatarModalHandlers();
      }
    }
  }
}

function setupChatModalHandlers() {
  const modalButton = document.querySelector('[data-action="open-modal"]');
  const modal = document.querySelector(".modal");

  const formModals = document.querySelectorAll(".modalform-overlay");

  if (modalButton && modal) {
    modalButton.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.toggle("modal-open");
    });
    const addUserBtn = modal.querySelector('[data-action="add-user"]');
    const removeUserBtn = modal.querySelector('[data-action="remove-user"]');
    const createChatBtn = modal.querySelector('[data-action="create-chat"]');

    if (addUserBtn) {
      addUserBtn.addEventListener("click", (e) => {
        e.preventDefault();

        modal.classList.remove("modal-open");
        const addUserModal = document
          .querySelector('[id*="add-user-login"]')
          ?.closest(".modalform-overlay");
        if (addUserModal) {
          addUserModal.classList.add("modal-open");
        }
      });
    }

    if (removeUserBtn) {
      removeUserBtn.addEventListener("click", (e) => {
        e.preventDefault();
        modal.classList.remove("modal-open");
        const removeUserModal = document
          .querySelector('[id*="remove-user-login"]')
          ?.closest(".modalform-overlay");
        if (removeUserModal) {
          removeUserModal.classList.add("modal-open");
        }
      });
    }

    if (createChatBtn) {
      createChatBtn.addEventListener("click", (e) => {
        e.preventDefault();
        modal.classList.remove("modal-open");
        const createChatModal = document
          .querySelector('[id*="chat-name"]')
          ?.closest(".modalform-overlay");
        if (createChatModal) {
          createChatModal.classList.add("modal-open");
        }
      });
    }

    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      if (
        !target.closest(".user-button-container") &&
        !target.closest(".modal-content")
      ) {
        modal.classList.remove("modal-open");
      }

      if (
        target.closest(".modalform-overlay") &&
        !target.closest(".modalform")
      ) {
        formModals.forEach((formModal) => {
          formModal.classList.remove("modal-open");
        });
      }
    });

    const closeButtons = document.querySelectorAll(
      ".modalform .close-button, .modalform .button--secondary"
    );
    closeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const formModal = button.closest(".modalform-overlay");
        if (formModal) {
          formModal.classList.remove("modal-open");
        }
      });
    });
  }
}

function setupAvatarModalHandlers() {
  const avatar = document.querySelector('[data-action="open-avatar-modal"]');
  const avatarModal = document.querySelector(".modalform-overlay");

  if (avatar && avatarModal) {
    avatar.addEventListener("click", (e) => {
      e.preventDefault();
      avatarModal.classList.add("modal-open");
    });

    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      if (
        !target.closest(".modalform") &&
        !target.closest(".avatar-clickable")
      ) {
        avatarModal.classList.remove("modal-open");
      }
    });

    const closeButton = avatarModal.querySelector(
      ".button--primary, .close-button"
    );
    if (closeButton) {
      closeButton.addEventListener("click", (e) => {
        e.preventDefault();
        avatarModal.classList.remove("modal-open");
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".nav-link");

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = link.getAttribute("href");

      if (href === "/login") {
        showPage("login");
      } else if (href === "/signin") {
        showPage("signin");
      } else if (href === "/notFound") {
        showPage("notFound");
      } else if (href === "/profile") {
        showPage("profile");
      } else if (href === "/editProfile") {
        showPage("editProfile");
      } else if (href === "/editPassword") {
        showPage("editPassword");
      } else if (href === "/chat") {
        showPage("chat");
      } else if (href === "/error") {
        showPage("error");
      }
    });
  });

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest(".button");

    if (button) {
      e.preventDefault();
    }
  });

  document.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  showPage("login");
});
