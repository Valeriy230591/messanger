// import EventBus from "./eventBus";
// import { nanoid } from "nanoid";
// import Handlebars from "handlebars";

// interface BlockProps {
//   [key: string]: any;
//   events?: Record<string, (event: Event) => void>;
//   attrs?: Record<string, string>;
//   className?: string;
// }

// interface BlockMeta {
//   tagName: string;
//   props: BlockProps;
// }

// type Children = Record<string, Block | Block[]>;

// export default class Block {
//   static EVENTS = {
//     INIT: "init",
//     FLOW_CDM: "flow:component-did-mount",
//     FLOW_CDU: "flow:component-did-update",
//     FLOW_RENDER: "flow:render",
//   } as const;

//   protected _element: HTMLElement | null = null;
//   protected _meta: BlockMeta | null = null;
//   protected _id: string = nanoid(6);
//   protected eventBus: () => EventBus<string>;
//   public children: Children = {};
//   public props: BlockProps;

//   constructor(tagName: string = "div", propsWithChildren: BlockProps = {}) {
//     const eventBus = new EventBus();
//     this.eventBus = () => eventBus;

//     const { props, children } = this._getChildrenAndProps(propsWithChildren);
//     this.children = children;

//     this._meta = {
//       tagName,
//       props,
//     };

//     this.props = this._makePropsProxy(props);

//     this._registerEvents(eventBus);
//     eventBus.emit(Block.EVENTS.INIT);
//   }

//   private _registerEvents(eventBus: EventBus<string>): void {
//     eventBus.on(Block.EVENTS.INIT, this.init.bind(this));
//     eventBus.on(Block.EVENTS.FLOW_CDM, this._componentDidMount.bind(this));
//     eventBus.on(Block.EVENTS.FLOW_CDU, this._componentDidUpdate.bind(this));
//     eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this));
//   }

//   private _createResources(): void {
//     if (!this._meta) return;

//     const { tagName, props } = this._meta;
//     const element = this._createDocumentElement(tagName);
//     this._element = element;

//     if (!element) {
//       throw new Error(`Не удалось создать элемент с тегом ${tagName}`);
//     }

//     if (typeof props.className === "string") {
//       const classes = props.className.split(" ");
//       element.classList.add(...classes);
//     }

//     if (typeof props.attrs === "object") {
//       Object.entries(props.attrs).forEach(([attrName, attrValue]) => {
//         element.setAttribute(attrName, attrValue);
//       });
//     }
//   }

//   private init(): void {
//     this._createResources();
//     this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
//   }

//   private _getChildrenAndProps(propsAndChildren: BlockProps): {
//     children: Children;
//     props: BlockProps;
//   } {
//     const children: Children = {};
//     const props: BlockProps = {};

//     Object.entries(propsAndChildren).forEach(([key, value]) => {
//       if (Array.isArray(value)) {
//         const isBlocksArray = value.every((item) => item instanceof Block);
//         if (isBlocksArray) {
//           children[key] = value;
//         } else {
//           props[key] = value;
//         }
//       } else if (value instanceof Block) {
//         children[key] = value;
//       } else {
//         props[key] = value;
//       }
//     });

//     return { children, props };
//   }

//   private _componentDidMount(): void {
//     this.componentDidMount();
//   }

//   public componentDidMount(oldProps?: BlockProps): void {}

//   public dispatchComponentDidMount(): void {
//     this.eventBus().emit(Block.EVENTS.FLOW_CDM);
//   }

//   private _componentDidUpdate(
//     oldProps: BlockProps,
//     newProps: BlockProps
//   ): void {
//     const response = this.componentDidUpdate(oldProps, newProps);
//     if (!response) {
//       return;
//     }
//     this._render();
//   }

//   public componentDidUpdate(
//     oldProps: BlockProps,
//     newProps: BlockProps
//   ): boolean {
//     return true;
//   }

//   public setProps = (nextProps: BlockProps): void => {
//     if (!nextProps) {
//       return;
//     }

//     Object.assign(this.props, nextProps);
//   };

//   get element(): HTMLElement | null {
//     return this._element;
//   }

//   protected _addEvents(): void {
//     const { events = {} } = this.props;

//     Object.keys(events).forEach((eventName) => {
//       if (this._element) {
//         this._element.addEventListener(eventName, events[eventName]);
//       }
//     });
//   }

//   protected _removeEvents(): void {
//     const { events = {} } = this.props;

//     Object.keys(events).forEach((eventName) => {
//       if (this._element) {
//         this._element.removeEventListener(eventName, events[eventName]);
//       }
//     });
//   }

//   protected _compile(): DocumentFragment {
//     const propsAndStubs: BlockProps = { ...this.props };

//     Object.entries(this.children).forEach(([key, child]) => {
//       if (Array.isArray(child)) {
//         propsAndStubs[key] = child.map(
//           (component) => `<div data-id="${component._id}"></div>`
//         );
//       } else {
//         propsAndStubs[key] = `<div data-id="${child._id}"></div>`;
//       }
//     });

//     const fragment = this._createDocumentElement(
//       "template"
//     ) as HTMLTemplateElement;
//     const template = Handlebars.compile(this.render());
//     fragment.innerHTML = template(propsAndStubs);

//     Object.entries(this.children).forEach(([key, child]) => {
//       if (Array.isArray(child)) {
//         child.forEach((component) => {
//           const stub = fragment.content.querySelector(
//             `[data-id="${component._id}"]`
//           );
//           if (stub && component.getContent) {
//             stub.replaceWith(component.getContent()!);
//           }
//         });
//       } else {
//         const stub = fragment.content.querySelector(`[data-id="${child._id}"]`);
//         if (stub && child.getContent) {
//           stub.replaceWith(child.getContent()!);
//         }
//       }
//     });

//     return fragment.content;
//   }

//   protected _render(): void {
//     if (!this._element) return;

//     this._removeEvents();
//     const block = this._compile();

//     if (this._element.children.length === 0) {
//       this._element.appendChild(block);
//     } else {
//       this._element.replaceChildren(block);
//     }

//     this._addEvents();
//   }

//   public render(): string {
//     return "";
//   }

//   public getContent(): HTMLElement | null {
//     return this._element;
//   }

//   private _makePropsProxy(props: BlockProps): BlockProps {
//     const eventBus = this.eventBus();
//     const emitBind = eventBus.emit.bind(eventBus);

//     return new Proxy(props, {
//       get(target: BlockProps, prop: string) {
//         const value = target[prop];
//         return typeof value === "function" ? value.bind(target) : value;
//       },
//       set: (target: BlockProps, prop: string, value: any) => {
//         const oldTarget = { ...target };
//         target[prop] = value;

//         emitBind(Block.EVENTS.FLOW_CDU, oldTarget, target);
//         return true;
//       },
//       deleteProperty() {
//         throw new Error("Нет доступа");
//       },
//     });
//   }

//   private _createDocumentElement(tagName: string): HTMLElement {
//     return document.createElement(tagName);
//   }

//   public show(): void {
//     const content = this.getContent();
//     if (content) {
//       content.style.display = "block";
//     }
//   }

//   public hide(): void {
//     const content = this.getContent();
//     if (content) {
//       content.style.display = "none";
//     }
//   }
// }
import EventBus from "./eventBus";
import { nanoid } from "nanoid";
import Handlebars from "handlebars";

// Базовые типы
type EventHandler = (event: Event) => void;
type Events = Record<string, EventHandler>;
type Attrs = Record<string, string>;

// Основной интерфейс пропсов
interface BlockProps {
  events?: Events;
  attrs?: Attrs;
  className?: string;
  [key: string]: unknown;
}

// Мета-информация о блоке
interface BlockMeta {
  tagName: string;
  props: BlockProps;
}

// Дочерние элементы
type Children = Record<string, Block | Block[]>;

// События жизненного цикла
const BlockEvents = {
  INIT: "init",
  FLOW_CDM: "flow:component-did-mount",
  FLOW_CDU: "flow:component-did-update",
  FLOW_RENDER: "flow:render",
} as const;

type BlockEvent = (typeof BlockEvents)[keyof typeof BlockEvents];

// Типы аргументов для событий
type EventArgs = {
  [BlockEvents.INIT]: [];
  [BlockEvents.FLOW_CDM]: [];
  [BlockEvents.FLOW_CDU]: [BlockProps, BlockProps];
  [BlockEvents.FLOW_RENDER]: [];
};

export default class Block {
  static EVENTS = BlockEvents;

  protected _element: HTMLElement | null = null;
  protected _meta: BlockMeta | null = null;
  protected _id: string = nanoid(6);
  protected eventBus: () => EventBus<BlockEvent, unknown[]>;
  public children: Children = {};
  public props: BlockProps;

  constructor(tagName: string = "div", propsWithChildren: BlockProps = {}) {
    const eventBus = new EventBus<BlockEvent, unknown[]>();
    this.eventBus = () => eventBus;

    const { props, children } = this._getChildrenAndProps(propsWithChildren);
    this.children = children;

    this._meta = {
      tagName,
      props,
    };

    this.props = this._makePropsProxy(props);

    this._registerEvents(eventBus);
    eventBus.emit(Block.EVENTS.INIT);
  }

  private _registerEvents(eventBus: EventBus<BlockEvent, unknown[]>): void {
    eventBus.on(Block.EVENTS.INIT, this.init.bind(this));
    eventBus.on(Block.EVENTS.FLOW_CDM, this._componentDidMount.bind(this));
    eventBus.on(
      Block.EVENTS.FLOW_CDU,
      this._componentDidUpdate.bind(this) as (...args: unknown[]) => void
    );
    eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this));
  }

  private _createResources(): void {
    if (!this._meta) return;

    const { tagName, props } = this._meta;
    const element = this._createDocumentElement(tagName);
    this._element = element;

    if (!element) {
      throw new Error(`Не удалось создать элемент с тегом ${tagName}`);
    }

    if (typeof props.className === "string") {
      const classes = props.className.split(" ");
      element.classList.add(...classes);
    }

    if (props.attrs && typeof props.attrs === "object") {
      Object.entries(props.attrs).forEach(([attrName, attrValue]) => {
        if (typeof attrValue === "string") {
          element.setAttribute(attrName, attrValue);
        }
      });
    }
  }

  private init(): void {
    this._createResources();
    this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
  }

  private _getChildrenAndProps(propsAndChildren: BlockProps): {
    children: Children;
    props: BlockProps;
  } {
    const children: Children = {};
    const props: BlockProps = {};

    Object.entries(propsAndChildren).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        const isBlocksArray = value.every((item) => item instanceof Block);
        if (isBlocksArray) {
          children[key] = value;
        } else {
          props[key] = value;
        }
      } else if (value instanceof Block) {
        children[key] = value;
      } else {
        props[key] = value;
      }
    });

    return { children, props };
  }

  private _componentDidMount(): void {
    this.componentDidMount();
  }

  public componentDidMount(_oldProps?: BlockProps): void {}

  public dispatchComponentDidMount(): void {
    this.eventBus().emit(Block.EVENTS.FLOW_CDM);
  }

  private _componentDidUpdate(
    oldProps: BlockProps,
    newProps: BlockProps
  ): void {
    const response = this.componentDidUpdate(oldProps, newProps);
    if (!response) {
      return;
    }
    this._render();
  }

  public componentDidUpdate(
    _oldProps: BlockProps,
    _newProps: BlockProps
  ): boolean {
    return true;
  }

  public setProps = (nextProps: Partial<BlockProps>): void => {
    if (!nextProps) {
      return;
    }

    Object.assign(this.props, nextProps);
  };

  get element(): HTMLElement | null {
    return this._element;
  }

  protected _addEvents(): void {
    const { events } = this.props;

    if (events && typeof events === "object") {
      Object.entries(events).forEach(([eventName, handler]) => {
        if (this._element && typeof handler === "function") {
          this._element.addEventListener(eventName, handler);
        }
      });
    }
  }

  protected _removeEvents(): void {
    const { events } = this.props;

    if (events && typeof events === "object") {
      Object.entries(events).forEach(([eventName, handler]) => {
        if (this._element && typeof handler === "function") {
          this._element.removeEventListener(eventName, handler);
        }
      });
    }
  }

  protected _compile(): DocumentFragment {
    const propsAndStubs: BlockProps = { ...this.props };

    Object.entries(this.children).forEach(([key, child]) => {
      if (Array.isArray(child)) {
        propsAndStubs[key] = child.map(
          (component) => `<div data-id="${component._id}"></div>`
        );
      } else {
        propsAndStubs[key] = `<div data-id="${child._id}"></div>`;
      }
    });

    const fragment = this._createDocumentElement(
      "template"
    ) as HTMLTemplateElement;
    const template = Handlebars.compile(this.render());
    fragment.innerHTML = template(propsAndStubs);

    Object.entries(this.children).forEach(([key, child]) => {
      if (Array.isArray(child)) {
        child.forEach((component) => {
          const stub = fragment.content.querySelector(
            `[data-id="${component._id}"]`
          );
          if (stub && component.getContent) {
            stub.replaceWith(component.getContent()!);
          }
        });
      } else {
        const stub = fragment.content.querySelector(`[data-id="${child._id}"]`);
        if (stub && child.getContent) {
          stub.replaceWith(child.getContent()!);
        }
      }
    });

    return fragment.content;
  }

  protected _render(): void {
    if (!this._element) return;

    this._removeEvents();
    const block = this._compile();

    if (this._element.children.length === 0) {
      this._element.appendChild(block);
    } else {
      this._element.replaceChildren(block);
    }

    this._addEvents();
  }

  public render(): string {
    return "";
  }

  public getContent(): HTMLElement | null {
    return this._element;
  }

  private _makePropsProxy(props: BlockProps): BlockProps {
    const eventBus = this.eventBus();
    const emitBind = eventBus.emit.bind(eventBus);

    return new Proxy(props, {
      get(target: BlockProps, prop: string) {
        const value = target[prop];
        return typeof value === "function" ? value.bind(target) : value;
      },
      set: (target: BlockProps, prop: string, value: unknown) => {
        const oldTarget = { ...target };
        target[prop] = value;

        emitBind(Block.EVENTS.FLOW_CDU, oldTarget, target);
        return true;
      },
      deleteProperty() {
        throw new Error("Нет доступа");
      },
    });
  }

  private _createDocumentElement(tagName: string): HTMLElement {
    return document.createElement(tagName);
  }

  public show(): void {
    const content = this.getContent();
    if (content) {
      content.style.display = "block";
    }
  }

  public hide(): void {
    const content = this.getContent();
    if (content) {
      content.style.display = "none";
    }
  }
}
