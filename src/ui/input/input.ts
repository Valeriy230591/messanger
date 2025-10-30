import Block from "../../core/block";
import { validators, type ValidationResult } from "./validators";
import "./input.scss";

export interface InputProps {
  type?: "text" | "password" | "email" | "tel" | "search" | "number";
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  inline?: boolean;
  search?: boolean;
  events?: {
    focus?: (event: Event) => void;
    blur?: (event: Event) => void;
    input?: (event: Event) => void;
    change?: (event: Event) => void;
    keydown?: (event: Event) => void;
    keyup?: (event: Event) => void;
  };
  className?: string;
}

export default class Input extends Block {
  private currentValue: string = "";

  constructor(props: InputProps) {
    const defaultEvents = {
      blur: (event: Event) => {
        this.validate();
        props.events?.blur?.(event);
      },
      input: (event: Event) => {
        this.currentValue = (event.target as HTMLInputElement).value;
        props.events?.input?.(event);
      },
      ...props.events,
    };

    super("div", {
      ...props,
      events: defaultEvents,
      className: "inp-wrapper",
    });

    this.currentValue = props.value || "";
  }

  private getValidationRules(): ((value: string) => ValidationResult)[] {
    const { type, required, name } = this.props;
    const rules = [];

    if (required) {
      rules.push(validators.required);
    }

    switch (type) {
    case "email":
      rules.push(validators.email);
      break;
    case "password":
      rules.push(validators.password);
      break;
    case "tel":
      rules.push(validators.phone);
      break;
    case "text":
      if (name && validators[name as keyof typeof validators]) {
        rules.push(validators[name as keyof typeof validators]);
      }
      break;
    }

    return rules;
  }

  private validate(): boolean {
    const value = this.getValue();
    const rules = this.getValidationRules();

    if (rules.length === 0) {
      this.clearError();
      return true;
    }

    for (const rule of rules) {
      const result = rule(value);
      if (!result.isValid) {
        this.setError(result.error || "");
        return false;
      }
    }

    this.clearError();
    return true;
  }

  public isValid(): boolean {
    return this.validate();
  }

  protected _addEvents(): void {
    const { events = {} } = this.props;
    const input = this.element?.querySelector("input");

    if (input && events) {
      Object.entries(events).forEach(([eventName, callback]) => {
        if (callback) {
          input.addEventListener(eventName, callback);
        }
      });
    }
  }

  protected _removeEvents(): void {
    const { events = {} } = this.props;
    const input = this.element?.querySelector("input");

    if (input && events) {
      Object.entries(events).forEach(([eventName, callback]) => {
        if (callback) {
          input.removeEventListener(eventName, callback);
        }
      });
    }
  }

  render(): string {
    const {
      type = "text",
      id,
      name,
      value = "",
      placeholder,
      label,
      required,
      disabled,
      error,
      inline,
      search,
      className = "",
    } = this.props;

    const inputValue = this.currentValue || value;

    return `
      <div class="input-field ${inline ? "input-field--inline" : ""} ${
  search ? "input-field--search" : ""
} ${className}">
        ${
  label ? `<label for="${id}" class="input-label">${label}</label>` : ""
}
        
        <input 
          type="${type}" 
          ${id ? `id="${id}"` : ""}
          ${name ? `name="${name}"` : ""}
          class="input ${error ? "input--error" : ""} ${
  search ? "input--search" : ""
}"
          ${placeholder ? `placeholder="${placeholder}"` : ""}
          value="${inputValue}"
          ${required ? "required" : ""}
          ${disabled ? "disabled" : ""}
        >
      </div>
      ${error ? `<span class="input-error">${error}</span>` : ""}
    `;
  }

  public getValue(): string {
    const input = this.element?.querySelector("input");
    const domValue = (input as HTMLInputElement)?.value;
    return domValue !== undefined ? domValue : this.currentValue;
  }

  public setValue(value: string): void {
    this.currentValue = value;
    const input = this.element?.querySelector("input");
    if (input) {
      (input as HTMLInputElement).value = value;
    }
  }

  public setError(error: string): void {
    const currentValue = this.getValue();
    this.setProps({
      ...this.props,
      error,
      value: currentValue,
    });
  }

  public clearError(): void {
    const currentValue = this.getValue();
    this.setProps({
      ...this.props,
      error: "",
      value: currentValue,
    });
  }

  componentDidUpdate(oldProps: InputProps, newProps: InputProps): boolean {
    if (oldProps.value !== newProps.value && newProps.value !== undefined) {
      this.currentValue = newProps.value;
    }
    return true;
  }
}
