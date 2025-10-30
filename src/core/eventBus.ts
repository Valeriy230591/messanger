export default class EventBus<
  E extends string,
  T extends unknown[] = unknown[]
> {
  private listeners: Record<string, ((...args: T) => void)[]> = {};

  constructor() {
    this.listeners = {};
  }

  on(event: E, callback: (...args: T) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: E, callback: (...args: T) => void): void {
    if (!this.listeners[event]) {
      throw new Error(`Нет события: ${event}`);
    }
    this.listeners[event] = this.listeners[event].filter(
      (listener) => listener !== callback
    );
  }

  emit(event: E, ...args: T): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event].forEach(function (listener) {
      listener(...args);
    });
  }
}
