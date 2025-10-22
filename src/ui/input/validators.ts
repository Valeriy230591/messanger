export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validators = {
  required: (value: string): ValidationResult => {
    if (!value.trim()) {
      return { isValid: false, error: "Это поле обязательно для заполнения" };
    }
    return { isValid: true };
  },

  email: (value: string): ValidationResult => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(value)) {
      return { isValid: false, error: "Введите корректный email адрес" };
    }

    const atIndex = value.indexOf("@");
    const dotIndex = value.lastIndexOf(".");

    if (dotIndex <= atIndex + 1) {
      return { isValid: false, error: "Некорректный формат email" };
    }

    const domainPart = value.substring(atIndex + 1, dotIndex);
    if (!/[a-zA-Z]/.test(domainPart)) {
      return {
        isValid: false,
        error: "Доменная часть email должна содержать буквы",
      };
    }

    return { isValid: true };
  },

  password: (value: string): ValidationResult => {
    if (value.length < 8 || value.length > 40) {
      return {
        isValid: false,
        error: "Пароль должен содержать от 8 до 40 символов",
      };
    }

    const hasUpperCase = /[A-ZА-Я]/.test(value);
    const hasNumber = /\d/.test(value);

    if (!hasUpperCase) {
      return {
        isValid: false,
        error: "Пароль должен содержать хотя бы одну заглавную букву",
      };
    }

    if (!hasNumber) {
      return {
        isValid: false,
        error: "Пароль должен содержать хотя бы одну цифру",
      };
    }

    return { isValid: true };
  },

  phone: (value: string): ValidationResult => {
    const cleanPhone = value.replace(/[\s-]/g, "");
    const phoneRegex = /^\+?\d+$/;

    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return {
        isValid: false,
        error: "Номер телефона должен содержать от 10 до 15 цифр",
      };
    }

    if (!phoneRegex.test(cleanPhone)) {
      return {
        isValid: false,
        error:
          "Номер телефона должен содержать только цифры и может начинаться с +",
      };
    }

    return { isValid: true };
  },

  login: (value: string): ValidationResult => {
    const loginRegex = /^[a-zA-Z0-9_-]+$/;
    const onlyNumbersRegex = /^\d+$/;

    if (value.length < 3 || value.length > 20) {
      return {
        isValid: false,
        error: "Логин должен содержать от 3 до 20 символов",
      };
    }

    if (!loginRegex.test(value)) {
      return {
        isValid: false,
        error:
          "Логин может содержать только латинские буквы, цифры, дефисы и нижние подчеркивания",
      };
    }

    if (onlyNumbersRegex.test(value)) {
      return {
        isValid: false,
        error: "Логин не может состоять только из цифр",
      };
    }

    return { isValid: true };
  },

  name: (value: string): ValidationResult => {
    const nameRegex = /^[A-ZА-Я][a-zа-я-]*$/;

    if (!nameRegex.test(value)) {
      return {
        isValid: false,
        error:
          "Должно начинаться с заглавной буквы, содержать только буквы и дефисы",
      };
    }

    if (value.includes("--")) {
      return {
        isValid: false,
        error: "Не должно быть двух дефисов подряд",
      };
    }

    if (value.startsWith("-") || value.endsWith("-")) {
      return {
        isValid: false,
        error: "Дефис не может быть в начале или конце",
      };
    }

    return { isValid: true };
  },

  first_name: (value: string): ValidationResult => {
    return validators.name(value);
  },

  second_name: (value: string): ValidationResult => {
    return validators.name(value);
  },

  message: (value: string): ValidationResult => {
    if (!value.trim()) {
      return { isValid: false, error: "Сообщение не может быть пустым" };
    }
    return { isValid: true };
  },
};
