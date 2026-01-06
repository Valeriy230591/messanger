import EventBus from "./eventBus.ts";

export const StoreEvents = {
  Updated: "Updated",
} as const;

export type StoreEvents = (typeof StoreEvents)[keyof typeof StoreEvents];

export class Store<
  S extends Record<string, unknown> = Record<string, unknown>
> extends EventBus<
  StoreEvents,
  [Record<string, unknown>, Record<string, unknown>]
> {
  private static __instance: Store<Record<string, unknown>>;
  private state!: S;

  constructor(defaultState: S) {
    if (Store.__instance) {
      return Store.__instance as Store<S>;
    }

    super();

    this.state = defaultState;
    Store.__instance = this as Store<Record<string, unknown>>;
  }

  public getState(): S {
    return this.state;
  }

  public set(nextState: Partial<S>): void {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...nextState };
    this.emit(StoreEvents.Updated, prevState, nextState);
  }

  static getInstance<S extends Record<string, unknown>>(): Store<S> {
    if (!Store.__instance) {
      throw new Error("Store not initialized");
    }
    return Store.__instance as Store<S>;
  }
}
