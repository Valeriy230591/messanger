// utils/withAuth.ts
import Block from "../core/block";
import type { BlockProps } from "../core/block";

export function withAuth(Component: typeof Block) {
  return class WithAuth extends Component {
    constructor(props: BlockProps = {}) {
      super("div", props);
    }

    componentDidMount(): void {
      const state = window.store.getState();
      const user = state.user as { id?: number } | null;

      if (!user || !user.id) {
        window.router.go("/");
        return;
      }

      super.componentDidMount();
    }
  };
}
