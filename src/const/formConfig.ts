import { fieldsForProfile } from "./fieldsForProfile";
import { fieldsForEditPassword } from "./fieldsForEditPassword";
export const formConfigs = {
  chat: {
    chats: [
      {
        name: "Иван Иванов",
        text: "Привет! Как дела?",
        time: "12:30",
        count: 3,
        active: true,
      },
      {
        name: "Мария Петрова",
        text: "Завтра встреча в 15:00",
        time: "11:15",
        count: 0,
      },
    ],
    messages: [
      {
        text: "Привет! Смотри, тут всплыл интересный кусок лунной космической истории — НАСА в какой-то момент попросила Хассельблад адаптировать модель SWC для полетов на Луну. Сейчас мы все знаем что астронавты летали с моделью 500 EL — и к слову говоря, все тушки этих камер все еще находятся на поверхности Луны, так как астронавты с собой забрали только кассеты с пленкой.Хассельблад в итоге адаптировал SWC для космоса, но что-то пошло не так и на ракету они так никогда и не попали. Всего их было произведено 25 штук, одну из них недавно продали на аукционе за 45000 евро.",
        time: "11:30",
        isRead: false,
        isOutgoing: false,
      },
      {
        text: "Круто",
        time: "11:40",
        isRead: true,
        isOutgoing: true,
      },
    ],
    isModalOpen: false,
  },
  editPassword: {
    avatarPath: "/noAvatar.svg",
    name: "Иван",
    fields: fieldsForEditPassword,
    buttons: [{ text: "Сохранить", variant: "primary" }],
  },
  editProfile: {
    avatarPath: "/noAvatar.svg",
    name: "Иван",
    fields: fieldsForProfile.map((item) => {
      return { ...item, disabled: false };
    }),
    buttons: [{ text: "Сохранить", variant: "primary" }],
  },
  profile: {
    avatarPath: "/noAvatar.svg",
    name: "Иван",
    fields: fieldsForProfile,
    buttons: [
      { text: "Изменить данные", variant: "secondary" },
      { text: "Изменить пароль", variant: "secondary" },
      { text: "Выйти", variant: "secondary" },
    ],
  },
  error: {},
  notFound: {},
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
        type: "email",
        id: "email",
        name: "email",
        label: "Почта",
        placeholder: "example@mail.com",
        required: true,
      },
      {
        type: "text",
        id: "login",
        name: "login",
        label: "Логин",
        placeholder: "Логин",
        required: true,
      },
      {
        type: "text",
        id: "name",
        name: "name",
        label: "Имя",
        placeholder: "Ваше имя",
        required: true,
      },
      {
        type: "text",
        id: "secondname",
        name: "secondname",
        label: "Фамилия",
        placeholder: "Фамилия",
      },
      {
        type: "phone",
        id: "phone",
        name: "phone",
        label: "Телефон",
        placeholder: "Телефон",
      },
      {
        type: "password",
        id: "password",
        name: "password",
        label: "Пароль",
        placeholder: "Пароль",
      },
      {
        type: "password",
        id: "password-2",
        name: "password-2",
        label: "Пароль(еще раз)",
        placeholder: "Пароль(еще раз)",
        value: "feneqn",
        error: "Error",
      },
    ],
    buttons: [
      { text: "Зарегистрироваться", variant: "primary", type: "submit" },
      { text: "Войти", variant: "secondary" },
    ],
  },
};
