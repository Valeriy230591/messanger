import { StoreEvents } from "../core/Store";
import isEqual from "./isEqual";
import type { ConnectableConstructor } from "../types/block";

type MapStateToProps<T> = (state: Record<string, unknown>) => T;

export function connect<T extends Record<string, unknown>>(
  mapStateToProps: MapStateToProps<T>
) {
  return function (Component: ConnectableConstructor): ConnectableConstructor {
    return class ConnectedComponent extends Component {
      private onChangeStoreCallback: (() => void) | undefined;
      private currentState: T;

      constructor(props: Record<string, unknown>) {
        const store = window.store;

        if (!store) {
          throw new Error("Store not found in window object");
        }

        const initialState = mapStateToProps(store.getState());
        const mergedProps = { ...props, ...initialState };

        super(mergedProps);

        this.currentState = initialState;

        const callback = (): void => {
          const newState = mapStateToProps(store.getState());

          if (!isEqual(this.currentState, newState)) {
            this.setProps(newState);
          }

          this.currentState = newState;
        };

        this.onChangeStoreCallback = callback;
        store.on(StoreEvents.Updated, callback);
      }

      public componentWillUnmount = (): void => {
        if (window.store && this.onChangeStoreCallback) {
          window.store.off(StoreEvents.Updated, this.onChangeStoreCallback);
        }

        if (super.componentWillUnmount) {
          super.componentWillUnmount();
        }
      };
    };
  };
}
