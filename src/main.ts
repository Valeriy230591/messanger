import Handlebars from "handlebars";
import * as Page from "./pages";
import * as Components from "./components";
import { formConfigs } from "./const/formConfig";
import "./style.scss";

Handlebars.registerPartial("button", Components.Button);
Handlebars.registerPartial("input", Components.Input);
Handlebars.registerPartial("form", Components.Form);
Handlebars.registerPartial("errorStatus", Components.errorStatus);
Handlebars.registerPartial("avatar", Components.Avatar);
Handlebars.registerPartial("profileForm", Components.profileForm);
Handlebars.registerPartial("chatCard", Components.chatCard);
Handlebars.registerPartial("cardList", Components.cardList);
Handlebars.registerPartial("messageCard", Components.messageCard);
Handlebars.registerPartial("messagesList", Components.messagesList);
Handlebars.registerPartial("userModal", Components.userModal);
Handlebars.registerPartial("userFormModal", Components.userFormModal);
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

// Показываем навигацию и начальную страницу
document.body.innerHTML = `
    ${templates.navigate({})}
    <div id="content"></div>
`;

function showPage(page: string) {
  const content = document.getElementById("content");
  if (content) {
    const template = templates[page as keyof typeof templates];
    const config = formConfigs[page as keyof typeof formConfigs];

    if (template && config) {
      content.innerHTML = template(config);

      // Добавляем обработчики для модальных окон после рендера
      if (page === "chat") {
        setupModalHandlers();
      }
    }
  }
}

function setupModalHandlers() {
  const modalButton = document.querySelector('[data-action="open-modal"]');
  const modal = document.querySelector(".modal");

  if (modalButton && modal) {
    modalButton.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.toggle("modal-open");
    });

    // Закрытие модального окна при клике вне его
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(".user-button-container") &&
        !target.closest(".modal-content")
      ) {
        modal.classList.remove("modal-open");
      }
    });
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
