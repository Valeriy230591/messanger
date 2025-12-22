export const StoreEvents = {
  Updated: "Updated",
} as const;

export type StoreEvents = (typeof StoreEvents)[keyof typeof StoreEvents];

export interface IStore<S = Record<string, unknown>> {
  getState(): S;
  set(nextState: Partial<S>): void;
  on(event: StoreEvents, callback: (...args: unknown[]) => void): void;
  off(event: StoreEvents, callback: (...args: unknown[]) => void): void;
}
