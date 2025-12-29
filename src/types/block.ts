export interface BlockInstance {
  getContent: () => HTMLElement | null;
  componentDidMount: (props?: Record<string, unknown>) => void;
  setProps: (props: Record<string, unknown>) => void;
  props: Record<string, unknown>;
  children: Record<string, unknown>;
  componentWillUnmount?: () => void;
}

export type BlockConstructable = new (props: Record<string, unknown>) => Pick<
  BlockInstance,
  "getContent" | "componentDidMount"
>;

export type ConnectableConstructor = new (
  props: Record<string, unknown>
) => BlockInstance;
