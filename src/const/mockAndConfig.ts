import { fieldsForProfile } from "./fieldsForProfile";
import { fieldsForEditPassword } from "./fieldsForEditPassword";
import { fieldsSignIn } from "./fieldsSignIn";
import { fieldsLogin } from "./fieldsLogin";
import { chatsMock, messageMock } from "./chatsMock";
export const mockAndConfigs = {
  chat: {
    chats: chatsMock,
    messages: messageMock,
    isModalOpen: false,
    isAddUserModalOpen: false,
    isRemoveUserModalOpen: false,
    isCreateChatModalOpen: false,
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
    fields: fieldsLogin,
    buttons: [
      { text: "Авторизоваться", variant: "primary", type: "submit" },
      { text: "Нет аккаунта?", variant: "secondary" },
    ],
  },

  signin: {
    title: "Регистрация",
    fields: fieldsSignIn,
    buttons: [
      { text: "Зарегистрироваться", variant: "primary", type: "submit" },
      { text: "Войти", variant: "secondary" },
    ],
  },
};
