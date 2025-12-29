import Router from "../core/Router";
import type { ConnectableConstructor } from "../types/block";

export interface WithRouterProps {
  router: Router;
}

export function withRouter(
  WrappedBlock: ConnectableConstructor
): ConnectableConstructor {
  return class extends WrappedBlock {
    constructor(props: Record<string, unknown>) {
      if (!window.router) {
        throw new Error("Router not found in window object");
      }

      const propsWithRouter = {
        ...props,
        router: window.router,
      };

      super(propsWithRouter);
    }
  };
}
