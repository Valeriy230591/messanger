// import Handlebars from "handlebars";
// import * as Page from "./pages";
// import * as Components from "./components"; // Импортируем компоненты
// const formConfigs = {
//   login: {
//     title: "Вход",
//     fields: [
//       {
//         type: "text",
//         id: "login",
//         name: "login",
//         label: "Логин",
//         placeholder: "Логин",
//         required: true,
//       },
//       {
//         type: "password",
//         id: "password",
//         name: "password",
//         label: "Пароль",
//         placeholder: "Пароль",
//         required: true,
//       },
//     ],
//     buttons: [
//       { text: "Авторизоваться", variant: "primary", type: "submit" },
//       { text: "Нет аккаунта?", variant: "secondary" },
//     ],
//   },

//   signin: {
//     title: "Регистрация",
//     fields: [
//       {
//         type: "text",
//         id: "name",
//         name: "name",
//         label: "Имя",
//         placeholder: "Ваше имя",
//         required: true,
//       },
//       {
//         type: "email",
//         id: "email",
//         name: "email",
//         label: "Email",
//         placeholder: "example@mail.com",
//         required: true,
//       },
//       {
//         type: "password",
//         id: "password",
//         name: "password",
//         label: "Пароль",
//         placeholder: "Придумайте пароль",
//         required: true,
//       },
//     ],
//     buttons: [
//       { text: "Зарегистрироваться", variant: "primary", type: "submit" },
//       { text: "Назад к входу", variant: "secondary" },
//     ],
//   },
// };
// // Регистрируем компонент кнопки как partial
// Handlebars.registerPartial("button", Components.Button);
// Handlebars.registerPartial("input", Components.Input);
// Handlebars.registerPartial("form", Components.Form);
// const templates = {
//   login: Handlebars.compile(Page.Login),
//   signin: Handlebars.compile(Page.SignIn),
//   navigate: Handlebars.compile(Page.Navigate),
// };

// // Показываем навигацию и начальную страницу
// document.body.innerHTML = `
//     ${templates.navigate({})}
//     <div id="content"></div>
// `;

// // Функция для смены страницы
// function showPage(page: string) {
//   const content = document.getElementById("content");
//   if (content) {
//     if (page === "login") {
//       content.innerHTML = templates.login({});
//     } else if (page === "signin") {
//       content.innerHTML = templates.signin({});
//     }
//   }
// }

// document.addEventListener("DOMContentLoaded", () => {
//   const links = document.querySelectorAll(".nav-link");

//   links.forEach((link) => {
//     link.addEventListener("click", (e) => {
//       e.preventDefault();
//       const href = link.getAttribute("href");

//       if (href === "/login") {
//         showPage("login");
//       } else if (href === "/signin") {
//         showPage("signin");
//       }
//     });
//   });

//   showPage("login");
// });
import Handlebars from "handlebars";
import * as Page from "./pages";
import * as Components from "./components";

// Регистрируем компоненты как partials
Handlebars.registerPartial("button", Components.Button);
Handlebars.registerPartial("input", Components.Input);
Handlebars.registerPartial("form", Components.Form);

// Конфигурация форм
const formConfigs = {
  login: {
    title: "Вход",
    fields: [
      {
        type: "text",
        id: "login",
        name: "login",
        label: "Логин",
        placeholder: "Логин",
        required: true,
      },
      {
        type: "password",
        id: "password",
        name: "password",
        label: "Пароль",
        placeholder: "Пароль",
        required: true,
      },
    ],
    buttons: [
      { text: "Авторизоваться", variant: "primary", type: "submit" },
      { text: "Нет аккаунта?", variant: "secondary" },
    ],
  },

  signin: {
    title: "Регистрация",
    fields: [
      {
        type: "text",
        id: "name",
        name: "name",
        label: "Имя",
        placeholder: "Ваше имя",
        required: true,
      },
      {
        type: "email",
        id: "email",
        name: "email",
        label: "Email",
        placeholder: "example@mail.com",
        required: true,
      },
      {
        type: "password",
        id: "password",
        name: "password",
        label: "Пароль",
        placeholder: "Придумайте пароль",
        required: true,
      },
    ],
    buttons: [
      { text: "Зарегистрироваться", variant: "primary", type: "submit" },
      { text: "Назад к входу", variant: "secondary" },
    ],
  },
};

const templates = {
  login: Handlebars.compile(Page.Login),
  signin: Handlebars.compile(Page.SignIn),
  navigate: Handlebars.compile(Page.Navigate),
};

// Показываем навигацию и начальную страницу
document.body.innerHTML = `
    ${templates.navigate({})}
    <div id="content"></div>
`;

// Функция для смены страницы
function showPage(page: string) {
  const content = document.getElementById("content");
  if (content) {
    const template = templates[page as keyof typeof templates];
    const config = formConfigs[page as keyof typeof formConfigs];

    if (template && config) {
      content.innerHTML = template(config);
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
      }
    });
  });

  // Обработчик для кнопок
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest(".button");

    if (button) {
      e.preventDefault();

      if (button.textContent === "Нет аккаунта?") {
        showPage("signin");
      } else if (button.textContent === "Назад к входу") {
        showPage("login");
      }
    }
  });

  // Предотвращаем отправку форм
  document.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Форма отправлена (перезагрузка предотвращена)");
  });

  showPage("login");
});
