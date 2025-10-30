import type { InputProps } from "../../ui/input/input";

export const configSignIn: InputProps[] = [
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
    name: "first_name",
    label: "Имя",
    placeholder: "Ваше имя",
    required: true,
  },
  {
    type: "text",
    id: "second_name",
    name: "second_name",
    label: "Фамилия",
    placeholder: "Фамилия",
  },
  {
    type: "tel",
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
    id: "password_repeat",
    name: "newPassword",
    label: "Пароль(еще раз)",
    placeholder: "Пароль(еще раз)",
  },
];
