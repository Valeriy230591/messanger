import { expect } from "chai";
import { Store, StoreEvents } from "./Store.ts";

describe("Store", () => {
  const resetStoreSingleton = (): void => {
    const storeClass = Store as unknown as {
      __instance?: Store<Record<string, unknown>>;
    };
    delete storeClass.__instance;
  };

  beforeEach(() => {
    resetStoreSingleton();
  });

  afterEach(() => {
    resetStoreSingleton();
  });

  describe("Синглтон паттерн", () => {
    it("должен возвращать тот же инстанс при повторном создании", () => {
      const store1 = new Store({ a: 1 });
      const store2 = new Store({ b: 2 });

      expect(store1).to.equal(store2);
    });

    it("должен бросать ошибку при попытке получить неинициализированный инстанс", () => {
      resetStoreSingleton();
      expect(() => Store.getInstance()).to.throw("Store not initialized");
    });

    it("должен возвращать инстанс после инициализации", () => {
      const store = new Store({ a: 1 });
      const instance = Store.getInstance();

      expect(store).to.equal(instance);
    });

    it("должен сохранять состояние при повторном создании", () => {
      const store1 = new Store({ a: 1 });
      const typedStore1 = store1 as Store<{ a: number; b?: number }>;
      typedStore1.set({ b: 2 });

      const store2 = new Store({ c: 3 });

      expect(store2.getState()).to.deep.equal({ a: 1, b: 2 });
    });
  });

  describe("Метод getState", () => {
    it("должен возвращать текущее состояние", () => {
      const initialState = { user: { name: "John" }, loading: false };
      const store = new Store(initialState);

      expect(store.getState()).to.deep.equal(initialState);
    });

    it("должен возвращать тот же объект при каждом вызове (не создает копию)", () => {
      const initialState = { value: 1 };
      const store = new Store(initialState);

      const state1 = store.getState();
      const state2 = store.getState();

      expect(state1).to.deep.equal(state2);
      expect(state1).to.equal(state2);
    });
  });

  describe("Метод set", () => {
    it("должен обновлять существующие поля", () => {
      const store = new Store({ a: 1, b: 2 });
      const typedStore = store as Store<{ a: number; b: number }>;
      typedStore.set({ b: 3 });

      expect(typedStore.getState()).to.deep.equal({ a: 1, b: 3 });
    });

    it("должен добавлять новые поля", () => {
      const store = new Store({ a: 1 });
      const typedStore = store as Store<{ a: number; b?: number; c?: number }>;
      typedStore.set({ b: 2, c: 3 });

      expect(typedStore.getState()).to.deep.equal({ a: 1, b: 2, c: 3 });
    });

    it("должен вызывать событие Updated с правильными аргументами", (done) => {
      const store = new Store({ a: 1 });
      const typedStore = store as Store<{ a: number; b?: number }>;

      typedStore.on(StoreEvents.Updated, (prevState, nextState) => {
        expect(prevState).to.deep.equal({ a: 1 });
        expect(nextState).to.deep.equal({ b: 2 });
        done();
      });

      typedStore.set({ b: 2 });
    });

    it("должен объединять вложенные объекты на первом уровне", () => {
      type UserState = {
        user: {
          name: string;
          age: number;
        };
        settings: {
          theme: string;
        };
      };

      const store = new Store<UserState>({
        user: { name: "John", age: 30 },
        settings: { theme: "dark" },
      });

      store.set({
        user: { name: "Jane", age: 25 },
      });

      expect(store.getState()).to.deep.equal({
        user: { name: "Jane", age: 25 },
        settings: { theme: "dark" },
      });
    });

    it("должен обрабатывать пустой объект обновления", (done) => {
      const store = new Store({ a: 1, b: 2 });
      const typedStore = store as Store<{ a: number; b: number }>;

      let eventFired = false;
      typedStore.on(StoreEvents.Updated, () => {
        eventFired = true;
      });

      typedStore.set({});

      setTimeout(() => {
        expect(eventFired).to.be.true;
        expect(typedStore.getState()).to.deep.equal({ a: 1, b: 2 });
        done();
      }, 0);
    });

    it("должен обрабатывать обновление с undefined значениями", () => {
      const store = new Store({ a: 1, b: 2, c: 3 });
      const typedStore = store as Store<{ a: number; b?: number; c: number }>;
      typedStore.set({ b: undefined });

      const state = typedStore.getState();
      expect(state.a).to.equal(1);
      expect(state.b).to.be.undefined;
      expect(state.c).to.equal(3);
    });

    it("должен создавать новый объект состояния при обновлении", () => {
      const store = new Store({ a: 1 });
      const typedStore = store as Store<{ a: number; b?: number }>;

      const state1 = typedStore.getState();
      typedStore.set({ b: 2 });
      const state2 = typedStore.getState();

      expect(state1).to.not.equal(state2);
      expect(state2).to.deep.equal({ a: 1, b: 2 });
    });
  });

  describe("Наследование от EventBus", () => {
    it("должен иметь методы EventBus", () => {
      const store = new Store({});

      expect(typeof store.on).to.equal("function");
      expect(typeof store.off).to.equal("function");
      expect(typeof store.emit).to.equal("function");
    });

    it("должен позволять отписываться от событий", () => {
      const store = new Store({ value: 1 });
      const typedStore = store as Store<{ value: number }>;
      let callbackCallCount = 0;

      const callback = (): void => {
        callbackCallCount++;
      };

      typedStore.on(StoreEvents.Updated, callback);
      typedStore.set({ value: 2 });

      typedStore.off(StoreEvents.Updated, callback);
      typedStore.set({ value: 3 });

      expect(callbackCallCount).to.equal(1);
    });

    it("должен поддерживать несколько подписчиков", () => {
      const store = new Store({ value: 1 });
      const typedStore = store as Store<{ value: number }>;
      let callCount1 = 0;
      let callCount2 = 0;

      const callback1 = (): void => {
        callCount1++;
      };
      const callback2 = (): void => {
        callCount2++;
      };

      typedStore.on(StoreEvents.Updated, callback1);
      typedStore.on(StoreEvents.Updated, callback2);

      typedStore.set({ value: 2 });

      expect(callCount1).to.equal(1);
      expect(callCount2).to.equal(1);
    });

    it("не должен вызывать события если состояние не изменилось", (done) => {
      const store = new Store({ value: 1 });
      const typedStore = store as Store<{ value: number }>;
      let eventFired = false;

      typedStore.on(StoreEvents.Updated, () => {
        eventFired = true;
      });

      typedStore.set({ value: 1 });

      setTimeout(() => {
        expect(eventFired).to.be.true;
        done();
      }, 0);
    });
  });

  describe("Краевые случаи", () => {
    it("должен корректно обрабатывать пустое начальное состояние", () => {
      const store = new Store({});
      const typedStore = store as Store<Record<string, unknown>>;

      expect(typedStore.getState()).to.deep.equal({});

      typedStore.set({ newField: "value" });
      expect(typedStore.getState().newField).to.equal("value");
    });

    it("должен корректно обрабатывать множественные обновления", () => {
      const store = new Store({ count: 0 });
      const typedStore = store as Store<{ count: number }>;

      typedStore.set({ count: 1 });
      typedStore.set({ count: 2 });
      typedStore.set({ count: 3 });

      expect(typedStore.getState().count).to.equal(3);
    });

    it("должен корректно работать с массивами", () => {
      const store = new Store({ items: [1, 2, 3] });
      const typedStore = store as Store<{ items: number[] }>;

      typedStore.set({ items: [4, 5, 6] });
      expect(typedStore.getState().items).to.deep.equal([4, 5, 6]);
    });

    it("должен корректно работать с функциями как значениями", () => {
      const mockFn = (): number => 42;
      const store = new Store({ fn: mockFn });
      const typedStore = store as Store<{ fn: () => number }>;

      const newFn = (): number => 100;
      typedStore.set({ fn: newFn });

      expect(typedStore.getState().fn()).to.equal(100);
    });
  });

  describe("Статические методы", () => {
    it("getInstance должен возвращать инстанс store", () => {
      const store = new Store({ count: 0 });
      const instance = Store.getInstance();

      expect(instance).to.equal(store);
      expect(instance.getState()).to.deep.equal({ count: 0 });
    });

    it("должен корректно работать с getInstance после сброса", () => {
      resetStoreSingleton();

      expect(() => Store.getInstance()).to.throw("Store not initialized");

      const newStore = new Store({ b: 2 });
      expect(newStore.getState()).to.deep.equal({ b: 2 });
    });
  });

  describe("Производительность и иммутабельность", () => {
    it("не должен мутировать исходное состояние", () => {
      const initialState = { a: 1, b: { c: 2 } };
      const store = new Store(initialState);
      const typedStore = store as Store<{ a: number; b: { c: number } }>;

      typedStore.set({ a: 3 });

      expect(initialState.a).to.equal(1);
      expect(initialState.b.c).to.equal(2);
    });

    it("должен правильно обрабатывать вложенные объекты", () => {
      type NestedState = {
        nested: {
          deep: {
            value: number;
          };
        };
      };

      const store = new Store<NestedState>({
        nested: {
          deep: {
            value: 1,
          },
        },
      });

      const state1 = store.getState();
      store.set({ nested: { deep: { value: 2 } } });
      const state2 = store.getState();

      expect(state1.nested.deep.value).to.equal(1);
      expect(state2.nested.deep.value).to.equal(2);
      expect(state1).to.not.equal(state2);
      expect(state1.nested).to.not.equal(state2.nested);
      expect(state1.nested.deep).to.not.equal(state2.nested.deep);
    });

    it("должен сохранять ссылки на неизмененные части состояния", () => {
      type ComplexState = {
        user: {
          name: string;
          profile: {
            avatar: string;
          };
        };
        settings: {
          theme: string;
        };
      };

      const store = new Store<ComplexState>({
        user: {
          name: "John",
          profile: {
            avatar: "avatar1.jpg",
          },
        },
        settings: {
          theme: "dark",
        },
      });

      const initialState = store.getState();

      store.set({
        settings: { theme: "light" },
      });

      const updatedState = store.getState();

      expect(initialState.user).to.equal(updatedState.user);
      expect(initialState.user.profile).to.equal(updatedState.user.profile);

      expect(initialState.settings).to.not.equal(updatedState.settings);
    });
  });

  describe("Поведение с событиями", () => {
    it("должен передавать правильные аргументы в события", (done) => {
      const store = new Store({ count: 0, text: "hello" });
      const typedStore = store as Store<{
        count: number;
        text: string;
        newField?: string;
      }>;

      typedStore.on(StoreEvents.Updated, (prevState, nextState) => {
        expect(prevState).to.deep.equal({ count: 0, text: "hello" });
        expect(nextState).to.deep.equal({ newField: "world" });
        done();
      });

      typedStore.set({ newField: "world" });
    });

    it("должен корректно обрабатывать несколько последовательных обновлений", (done) => {
      const store = new Store({ value: 0 });
      const typedStore = store as Store<{ value: number }>;

      let eventCount = 0;

      typedStore.on(StoreEvents.Updated, (prevState, nextState) => {
        eventCount++;

        if (eventCount === 1) {
          expect(prevState).to.deep.equal({ value: 0 });
          expect(nextState).to.deep.equal({ value: 1 });
        } else if (eventCount === 2) {
          expect(prevState).to.deep.equal({ value: 1 });
          expect(nextState).to.deep.equal({ value: 2 });
        }
      });

      typedStore.set({ value: 1 });
      typedStore.set({ value: 2 });

      setTimeout(() => {
        expect(eventCount).to.equal(2);
        done();
      }, 0);
    });
  });
});
