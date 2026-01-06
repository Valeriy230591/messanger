import { expect } from "chai";
import EventBus from "./eventBus.ts";

describe("EventBus", () => {
  let eventBus: EventBus<string, unknown[]>;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe("Конструктор", () => {
    it("должен создавать инстанс EventBus", () => {
      expect(eventBus).to.be.instanceOf(EventBus);
    });
  });

  describe("Метод on", () => {
    it("должен добавлять обработчик для события", () => {
      let called = false;
      const callback = (): void => {
        called = true;
      };

      eventBus.on("test-event", callback);
      eventBus.emit("test-event");

      expect(called).to.be.true;
    });

    it("должен добавлять несколько обработчиков для одного события", () => {
      let callCount = 0;
      const callback1 = (): void => {
        callCount++;
      };
      const callback2 = (): void => {
        callCount++;
      };
      const callback3 = (): void => {
        callCount++;
      };

      eventBus.on("test", callback1);
      eventBus.on("test", callback2);
      eventBus.on("test", callback3);

      eventBus.emit("test");

      expect(callCount).to.equal(3);
    });

    it("должен добавлять обработчики для разных событий", () => {
      let event1Called = false;
      let event2Called = false;

      eventBus.on("event1", () => {
        event1Called = true;
      });
      eventBus.on("event2", () => {
        event2Called = true;
      });

      eventBus.emit("event1");
      eventBus.emit("event2");

      expect(event1Called).to.be.true;
      expect(event2Called).to.be.true;
    });
  });

  describe("Метод off", () => {
    it("должен удалять обработчик события", () => {
      let callback1Called = false;
      let callback2Called = false;

      const callback1 = (): void => {
        callback1Called = true;
      };
      const callback2 = (): void => {
        callback2Called = true;
      };

      eventBus.on("test", callback1);
      eventBus.on("test", callback2);

      eventBus.off("test", callback1);
      eventBus.emit("test");

      expect(callback1Called).to.be.false;
      expect(callback2Called).to.be.true;
    });

    it("должен выбрасывать ошибку при попытке удалить обработчик несуществующего события", () => {
      const callback = (): void => {};

      expect(() => {
        eventBus.off("non-existent-event", callback);
      }).to.throw("Нет события: non-existent-event");
    });

    it("должен корректно работать с удалением обработчика, который не был добавлен", () => {
      let callbackCalled = false;
      const callback1 = (): void => {
        callbackCalled = true;
      };
      const callback2 = (): void => {};

      eventBus.on("test", callback1);
      eventBus.off("test", callback2);
      eventBus.emit("test");

      expect(callbackCalled).to.be.true;
    });
  });

  describe("Метод emit", () => {
    it("должен вызывать все обработчики события", () => {
      let callCount = 0;

      eventBus.on("test", () => {
        callCount++;
      });
      eventBus.on("test", () => {
        callCount++;
      });
      eventBus.on("test", () => {
        callCount++;
      });

      eventBus.emit("test");

      expect(callCount).to.equal(3);
    });

    it("не должен вызывать обработчики других событий", () => {
      let event1Called = false;
      let event2Called = false;

      eventBus.on("event1", () => {
        event1Called = true;
      });
      eventBus.on("event2", () => {
        event2Called = true;
      });

      eventBus.emit("event1");

      expect(event1Called).to.be.true;
      expect(event2Called).to.be.false;
    });

    it("не должен делать ничего если нет обработчиков события", () => {
      expect(() => {
        eventBus.emit("non-existent-event");
      }).to.not.throw();
    });

    it("должен вызывать обработчики в порядке их добавления", () => {
      const callOrder: number[] = [];

      eventBus.on("test", () => {
        callOrder.push(1);
      });
      eventBus.on("test", () => {
        callOrder.push(2);
      });
      eventBus.on("test", () => {
        callOrder.push(3);
      });

      eventBus.emit("test");

      expect(callOrder).to.deep.equal([1, 2, 3]);
    });

    it("должен передавать аргументы обработчикам", () => {
      let receivedArgs: unknown[] = [];

      eventBus.on("test", (...args: unknown[]) => {
        receivedArgs = args;
      });

      eventBus.emit("test", "hello", 42, true);

      expect(receivedArgs).to.deep.equal(["hello", 42, true]);
    });
  });

  describe("Интеграционные тесты", () => {
    it("должен корректно работать с цепочкой событий", () => {
      const results: string[] = [];

      eventBus.on("first-event", (...args: unknown[]) => {
        const msg = args[0] as string;
        results.push(`first: ${msg}`);
      });

      eventBus.on("first-event", (...args: unknown[]) => {
        const msg = args[0] as string;
        results.push(`second: ${msg}`);
        eventBus.emit("second-event", "from second");
      });

      eventBus.on("second-event", (...args: unknown[]) => {
        const msg = args[0] as string;
        results.push(`third: ${msg}`);
      });

      eventBus.emit("first-event", "start");

      expect(results).to.deep.equal([
        "first: start",
        "second: start",
        "third: from second",
      ]);
    });

    it("должен корректно обрабатывать удаление обработчика во время вызова", () => {
      let callCount = 0;

      const callbackToRemove = (): void => {
        callCount++;
        eventBus.off("test", callbackToRemove);
      };

      const persistentCallback = (): void => {
        callCount++;
      };

      eventBus.on("test", callbackToRemove);
      eventBus.on("test", persistentCallback);

      eventBus.emit("test");
      eventBus.emit("test");

      expect(callCount).to.equal(3);
    });
  });

  describe("Типизация с дженериками", () => {
    it("должен поддерживать типизированные события и аргументы", () => {
      const loginEventBus = new EventBus<"login", [string, number]>();
      const logoutEventBus = new EventBus<"logout", [string]>();

      let loginMessage = "";
      let userId = 0;
      let logoutMessage = "";

      loginEventBus.on("login", (message: string, id: number) => {
        loginMessage = message;
        userId = id;
      });

      logoutEventBus.on("logout", (message: string) => {
        logoutMessage = message;
      });

      loginEventBus.emit("login", "User logged in", 123);
      logoutEventBus.emit("logout", "User logged out");

      expect(loginMessage).to.equal("User logged in");
      expect(userId).to.equal(123);
      expect(logoutMessage).to.equal("User logged out");
    });

    it("должен работать с разными типами аргументов", () => {
      const stringEventBus = new EventBus<"test", [string]>();
      const numberEventBus = new EventBus<"test", [number]>();
      const objectEventBus = new EventBus<
        "test",
        [{ id: number; name: string }]
      >();

      let stringResult = "";
      let numberResult = 0;
      let objectResult = { id: 0, name: "" };

      stringEventBus.on("test", (str: string) => {
        stringResult = str;
      });

      numberEventBus.on("test", (num: number) => {
        numberResult = num;
      });

      objectEventBus.on("test", (obj: { id: number; name: string }) => {
        objectResult = obj;
      });

      stringEventBus.emit("test", "test");
      numberEventBus.emit("test", 42);
      objectEventBus.emit("test", { id: 1, name: "John" });

      expect(stringResult).to.equal("test");
      expect(numberResult).to.equal(42);
      expect(objectResult).to.deep.equal({ id: 1, name: "John" });
    });
  });

  describe("Краевые случаи", () => {
    it("должен корректно обрабатывать многократное добавление одного обработчика", () => {
      let callCount = 0;
      const callback = (): void => {
        callCount++;
      };

      eventBus.on("test", callback);
      eventBus.on("test", callback);
      eventBus.on("test", callback);

      eventBus.emit("test");

      expect(callCount).to.equal(3);
    });

    it("должен работать с пустыми аргументами", () => {
      let called = false;

      eventBus.on("empty-event", () => {
        called = true;
      });

      eventBus.emit("empty-event");

      expect(called).to.be.true;
    });

    it("должен корректно работать с большим количеством обработчиков", () => {
      let totalCalls = 0;

      for (let i = 0; i < 100; i++) {
        eventBus.on("mass-event", () => {
          totalCalls++;
        });
      }

      eventBus.emit("mass-event");

      expect(totalCalls).to.equal(100);
    });

    it("должен сохранять обработчики после удаления других", () => {
      let callback1Called = false;
      let callback2Called = false;

      const callback1 = (): void => {
        callback1Called = true;
      };
      const callback2 = (): void => {
        callback2Called = true;
      };

      eventBus.on("test", callback1);
      eventBus.on("test", callback2);

      eventBus.off("test", callback1);
      eventBus.emit("test");

      expect(callback1Called).to.be.false;
      expect(callback2Called).to.be.true;
    });
  });

  describe("Поведение при ошибках", () => {
    it("должен прерывать выполнение если обработчик выбрасывает ошибку", () => {
      let errorHandlerCalled = false;
      let otherCallbackCalled = false;

      const errorCallback = (): void => {
        errorHandlerCalled = true;
        throw new Error("Ошибка в обработчике");
      };

      const normalCallback = (): void => {
        otherCallbackCalled = true;
      };

      eventBus.on("test", errorCallback);
      eventBus.on("test", normalCallback);

      expect(() => {
        eventBus.emit("test");
      }).to.throw("Ошибка в обработчике");

      expect(errorHandlerCalled).to.be.true;
      expect(otherCallbackCalled).to.be.false;
    });

    it("должен корректно обрабатывать null и undefined как аргументы", () => {
      let receivedArgs: unknown[] = [];

      eventBus.on("test", (...args: unknown[]) => {
        receivedArgs = args;
      });

      eventBus.emit("test", null, undefined);

      expect(receivedArgs).to.deep.equal([null, undefined]);
    });
  });

  describe("Сложные сценарии", () => {
    it("должен поддерживать вложенные события", () => {
      const callOrder: string[] = [];

      eventBus.on("outer", () => {
        callOrder.push("outer-start");
        eventBus.emit("inner");
        callOrder.push("outer-end");
      });

      eventBus.on("inner", () => {
        callOrder.push("inner");
      });

      eventBus.emit("outer");

      expect(callOrder).to.deep.equal(["outer-start", "inner", "outer-end"]);
    });

    it("должен корректно работать с асинхронными обработчиками", (done) => {
      let asyncCompleted = false;

      eventBus.on("async-event", async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        asyncCompleted = true;
      });

      eventBus.emit("async-event");

      setTimeout(() => {
        expect(asyncCompleted).to.be.true;
        done();
      }, 20);
    });

    it("должен позволять добавлять обработчики во время выполнения других обработчиков", () => {
      let lateCallbackCalled = false;

      eventBus.on("setup", () => {
        eventBus.on("late-event", () => {
          lateCallbackCalled = true;
        });
      });

      eventBus.emit("setup");
      eventBus.emit("late-event");

      expect(lateCallbackCalled).to.be.true;
    });

    it("должен корректно работать с обработчиками, которые удаляют сами себя", () => {
      let callCount = 0;

      const selfRemovingCallback = (): void => {
        callCount++;
        if (callCount === 1) {
          eventBus.off("test", selfRemovingCallback);
        }
      };

      const persistentCallback = (): void => {
        callCount++;
      };

      eventBus.on("test", selfRemovingCallback);
      eventBus.on("test", persistentCallback);

      eventBus.emit("test");
      eventBus.emit("test");

      expect(callCount).to.equal(3);
    });
  });
});
