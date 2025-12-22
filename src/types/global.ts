import { Store } from "../core/Store";
import Router from "../core/Router";

declare global {
  interface Window {
    store: Store;
    router: Router;
  }
}

export {};
