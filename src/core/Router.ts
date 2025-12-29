import Route from "./Route";

export interface RouteInterface {
  render: () => void;
  match: (path: string) => boolean;
  leave: () => void;
}

interface BlockConstructable {
  new (props: Record<string, unknown>): {
    getContent: () => HTMLElement | null;
    componentDidMount: (props?: Record<string, unknown>) => void;
  };
}

class Router {
  private static __instance: Router;
  private history: History = window.history;
  private _currentRoute: RouteInterface | null = null;
  private _rootQuery: string = "";
  public routes: RouteInterface[] = [];

  constructor(rootQuery: string) {
    if (Router.__instance) {
      return Router.__instance;
    }

    this.routes = [];
    this._rootQuery = rootQuery;

    Router.__instance = this;
  }

  use(pathname: string, block: BlockConstructable): this {
    const route = new Route(pathname, block, { rootQuery: this._rootQuery });
    this.routes.push(route);
    return this;
  }

  start(): void {
    window.onpopstate = (() => {
      this._onRoute(window.location.pathname);
    }).bind(this);

    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest("a");

      if (link && link.getAttribute("href")?.startsWith("/")) {
        event.preventDefault();
        const pathname = link.getAttribute("href");
        if (pathname) {
          this.go(pathname);
        }
      }
    });

    this._onRoute(window.location.pathname);
  }

  _onRoute(pathname: string): void {
    const route = this.getRoute(pathname);

    if (!route) {
      return;
    }

    if (this._currentRoute && this._currentRoute !== route) {
      this._currentRoute.leave();
    }

    this._currentRoute = route;
    route.render();
  }

  go(pathname: string): void {
    this.history.pushState({}, "", pathname);
    this._onRoute(pathname);
  }

  back(): void {
    this.history.back();
  }

  forward(): void {
    this.history.forward();
  }

  getRoute(pathname: string): RouteInterface | undefined {
    const route = this.routes.find((route) => route.match(pathname));
    if (!route) {
      return this.routes.find((route) => route.match("*"));
    }
    return route;
  }

  static getInstance(): Router {
    if (!Router.__instance) {
      throw new Error("Router not initialized");
    }
    return Router.__instance;
  }
}

export default Router;
