import { expect } from "chai";
import Router from "./Router.ts";

class MockBlock {
  private element: HTMLElement;

  constructor() {
    this.element = document.createElement("div");
  }

  getContent(): HTMLElement {
    return this.element;
  }

  componentDidMount(): void {}
}

const resetRouterSingleton = (): void => {
  const routerClass = Router as unknown as { __instance?: Router };
  delete routerClass.__instance;
};

describe("Router", () => {
  beforeEach(() => {
    const rootElement = document.createElement("div");
    rootElement.id = "root";
    document.body.appendChild(rootElement);

    resetRouterSingleton();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    window.onpopstate = null;
  });

  describe("Конструктор и синглтон", () => {
    it("должен создавать роутер с указанным селектором", () => {
      const router = new Router("#root");
      expect(router).to.be.instanceOf(Router);
    });

    it("должен возвращать один и тот же инстанс при повторном создании", () => {
      const router1 = new Router("#root");
      const router2 = new Router("#app");
      expect(router1).to.equal(router2);
    });

    it("должен бросать ошибку при получении неинициализированного инстанса", () => {
      resetRouterSingleton();
      expect(() => Router.getInstance()).to.throw("Router not initialized");
    });

    it("должен возвращать инстанс после инициализации", () => {
      const router = new Router("#root");
      const instance = Router.getInstance();
      expect(router).to.equal(instance);
    });
  });

  describe("Метод use", () => {
    beforeEach(() => {
      resetRouterSingleton();
    });

    it("должен добавлять новый роут", () => {
      const router = new Router("#root");
      router.routes = [];
      router.use("/home", MockBlock);
      expect(router.routes.length).to.equal(1);
    });

    it("должен позволять цепочку вызовов", () => {
      const router = new Router("#root");
      router.routes = [];
      const result = router.use("/home", MockBlock);
      expect(result).to.equal(router);
    });

    it("должен добавлять несколько роутов", () => {
      const router = new Router("#root");
      router.routes = [];

      router
        .use("/home", MockBlock)
        .use("/about", MockBlock)
        .use("/contact", MockBlock);

      expect(router.routes.length).to.equal(3);
    });
  });

  describe("Метод go", () => {
    let router: Router;

    beforeEach(() => {
      resetRouterSingleton();
      router = new Router("#root");
      router.routes = [];
      router.use("/test", MockBlock);
    });

    it("должен вызывать history.pushState", () => {
      let pushStateCalled = false;

      const originalPushState = window.history.pushState;

      window.history.pushState = (): void => {
        pushStateCalled = true;
      };

      router.go("/test");
      expect(pushStateCalled).to.be.true;

      window.history.pushState = originalPushState;
    });
  });

  describe("Методы back и forward", () => {
    let router: Router;

    beforeEach(() => {
      resetRouterSingleton();
      router = new Router("#root");
    });

    it("должен вызывать history.back", () => {
      let backCalled = false;

      const originalBack = window.history.back;
      window.history.back = (): void => {
        backCalled = true;
      };

      router.back();
      expect(backCalled).to.be.true;

      window.history.back = originalBack;
    });

    it("должен вызывать history.forward", () => {
      let forwardCalled = false;

      const originalForward = window.history.forward;
      window.history.forward = (): void => {
        forwardCalled = true;
      };

      router.forward();
      expect(forwardCalled).to.be.true;

      window.history.forward = originalForward;
    });
  });

  describe("Метод getRoute", () => {
    let router: Router;

    beforeEach(() => {
      resetRouterSingleton();
      router = new Router("#root");
      router.routes = [];
    });

    it("должен находить существующий роут", () => {
      router.use("/home", MockBlock);
      router.use("*", MockBlock);

      const route = router.getRoute("/home");
      expect(route).to.exist;
    });

    it("должен возвращать дефолтный роут для несуществующего пути", () => {
      router.use("/home", MockBlock);
      router.use("*", MockBlock);

      const route = router.getRoute("/not-found");
      expect(route).to.exist;
    });

    it("должен возвращать undefined если роут не найден и нет дефолтного", () => {
      router.use("/home", MockBlock);

      const route = router.getRoute("/not-found");
      expect(route).to.be.undefined;
    });
  });

  describe("Обработка кликов", () => {
    let router: Router;

    beforeEach(() => {
      resetRouterSingleton();
      router = new Router("#root");
      router.routes = [];
    });

    afterEach(() => {
      window.onpopstate = null;
    });

    it("должен предотвращать переход по внутренней ссылке", () => {
      router.use("/page", MockBlock);

      let goCalledWith: string | null = null;
      const originalGo = router.go;
      router.go = function (pathname: string): void {
        goCalledWith = pathname;
      };

      router.start();

      const link = document.createElement("a");
      link.href = "/page";
      document.body.appendChild(link);

      let preventDefaultCalled = false;
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });

      // Мокаем preventDefault
      Object.defineProperty(event, "preventDefault", {
        value: function (): void {
          preventDefaultCalled = true;
        },
        writable: true,
      });

      link.dispatchEvent(event);

      expect(preventDefaultCalled).to.be.true;
      expect(goCalledWith).to.equal("/page");

      // Восстанавливаем
      router.go = originalGo;
    });

    it("не должен предотвращать переход по внешней ссылке", () => {
      router.use("/", MockBlock);
      router.start();

      const link = document.createElement("a");
      link.href = "https://example.com";
      document.body.appendChild(link);

      let preventDefaultCalled = false;
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });

      Object.defineProperty(event, "preventDefault", {
        value: function (): void {
          preventDefaultCalled = true;
        },
        writable: true,
      });

      link.dispatchEvent(event);

      expect(preventDefaultCalled).to.be.false;
    });
  });

  describe("Начало работы роутера", () => {
    beforeEach(() => {
      resetRouterSingleton();
    });

    it("должен устанавливать обработчик popstate при старте", () => {
      const router = new Router("#root");
      router.routes = [];
      router.use("/", MockBlock);

      router.start();

      expect(window.onpopstate).to.be.a("function");
    });
  });
});
