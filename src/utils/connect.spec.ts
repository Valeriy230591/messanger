import { expect } from "chai";
import sinon from "sinon";
import { connect } from "./connect.ts";
import { StoreEvents } from "../core/Store.ts";
import type { ConnectableConstructor } from "../types/block.ts";

class MockBlockInstance {
  public props: Record<string, unknown> = {};
  private element: HTMLElement;
  private setPropsCalled = false;
  private setPropsArgs: Record<string, unknown> | null = null;
  private componentWillUnmountCalled = false;

  constructor(props: Record<string, unknown>) {
    this.props = { ...props };
    this.element = document.createElement("div");
  }

  public getContent(): HTMLElement {
    return this.element;
  }

  public componentDidMount(): void {}

  public setProps(newProps: Record<string, unknown>): void {
    this.setPropsCalled = true;
    this.setPropsArgs = { ...newProps };
    this.props = { ...this.props, ...newProps };
  }

  public componentWillUnmount(): void {
    this.componentWillUnmountCalled = true;
  }

  public wasSetPropsCalled(): boolean {
    return this.setPropsCalled;
  }

  public getLastSetPropsArgs(): Record<string, unknown> | null {
    return this.setPropsArgs;
  }

  public wasComponentWillUnmountCalled(): boolean {
    return this.componentWillUnmountCalled;
  }

  public resetTestState(): void {
    this.setPropsCalled = false;
    this.setPropsArgs = null;
    this.componentWillUnmountCalled = false;
  }
}

interface MockStore {
  getState: () => Record<string, unknown>;
  on: (event: StoreEvents, callback: () => void) => void;
  off: (event: StoreEvents, callback: () => void) => void;
}

function getWindowStore(): unknown {
  return (global.window as { store?: unknown }).store;
}

function setWindowStore(store: MockStore | undefined): void {
  (global.window as { store?: MockStore }).store = store;
}

describe("connect", () => {
  let mockStore: MockStore;
  let originalStore: MockStore | undefined;
  let storeOnSpy: sinon.SinonSpy;
  let storeOffSpy: sinon.SinonSpy;
  let storeGetStateStub: sinon.SinonStub;

  beforeEach(() => {
    originalStore = getWindowStore() as MockStore | undefined;

    storeGetStateStub = sinon.stub();
    storeOnSpy = sinon.spy();
    storeOffSpy = sinon.spy();

    mockStore = {
      getState: storeGetStateStub,
      on: storeOnSpy,
      off: storeOffSpy,
    };

    setWindowStore(mockStore);
  });

  afterEach(() => {
    setWindowStore(originalStore);
    sinon.restore();
  });

  describe("Создание подключенного компонента", () => {
    it("должен создавать компонент с начальными props из store", () => {
      const mockState = { user: { name: "John" }, isLoading: false };
      storeGetStateStub.returns(mockState);

      const mapStateToProps = (state: Record<string, unknown>) => ({
        userName: (state.user as Record<string, unknown>).name as string,
        loading: state.isLoading,
      });

      const ConnectedComponent = connect(mapStateToProps)(
        MockBlockInstance as unknown as ConnectableConstructor
      );
      const component = new ConnectedComponent({ extraProp: "value" });

      expect(component.props).to.deep.equal({
        extraProp: "value",
        userName: "John",
        loading: false,
      });
    });

    it("должен подписываться на обновления store при создании", () => {
      storeGetStateStub.returns({});
      const mapStateToProps = () => ({});
      const ConnectedComponent = connect(mapStateToProps)(
        MockBlockInstance as unknown as ConnectableConstructor
      );

      new ConnectedComponent({});

      expect(storeOnSpy.calledOnce).to.be.true;
      expect(storeOnSpy.calledWith(StoreEvents.Updated)).to.be.true;
      expect(storeOnSpy.args[0][1]).to.be.a("function");
    });

    it("должен выбрасывать ошибку если store не найден в window", () => {
      setWindowStore(undefined);

      const mapStateToProps = () => ({});
      const ConnectedComponent = connect(mapStateToProps)(
        MockBlockInstance as unknown as ConnectableConstructor
      );

      expect(() => new ConnectedComponent({})).to.throw(
        "Store not found in window object"
      );
    });
  });

  describe("Реакция на обновления store", () => {
    it("должен вызывать setProps при изменении состояния store", () => {
      const initialState = { counter: 0 };
      const updatedState = { counter: 1 };
      storeGetStateStub.returns(initialState);

      const mapStateToProps = (state: Record<string, unknown>) => ({
        count: state.counter,
      });

      const ConnectedComponent = connect(mapStateToProps)(
        MockBlockInstance as unknown as ConnectableConstructor
      );
      const component = new ConnectedComponent(
        {}
      ) as unknown as MockBlockInstance;

      const storeCallback = storeOnSpy.args[0][1] as () => void;

      storeGetStateStub.returns(updatedState);
      storeCallback();

      expect(component.wasSetPropsCalled()).to.be.true;
      expect(component.getLastSetPropsArgs()).to.deep.equal({
        count: 1,
      });
    });

    it("не должен вызывать setProps если состояние store не изменилось", () => {
      const state = { value: "test" };
      storeGetStateStub.returns(state);

      const mapStateToProps = (state: Record<string, unknown>) => ({
        value: state.value,
      });

      const ConnectedComponent = connect(mapStateToProps)(
        MockBlockInstance as unknown as ConnectableConstructor
      );
      const component = new ConnectedComponent(
        {}
      ) as unknown as MockBlockInstance;

      const storeCallback = storeOnSpy.args[0][1] as () => void;
      storeCallback();

      expect(component.wasSetPropsCalled()).to.be.false;
    });

    it("должен обновлять currentState после изменения store", () => {
      const states = [{ data: "old" }, { data: "new" }];
      let callCount = 0;
      storeGetStateStub.callsFake(() => states[callCount]);

      const mapStateToProps = (state: Record<string, unknown>) => ({
        data: state.data,
      });

      const ConnectedComponent = connect(mapStateToProps)(
        MockBlockInstance as unknown as ConnectableConstructor
      );
      const component = new ConnectedComponent(
        {}
      ) as unknown as MockBlockInstance;

      const storeCallback = storeOnSpy.args[0][1] as () => void;

      callCount = 1;
      storeCallback();
      storeCallback();
      expect(storeGetStateStub.callCount).to.equal(3);
      expect(component.wasSetPropsCalled()).to.be.true;
    });
  });

  describe("Отписка от store", () => {
    it("должен отписываться от store при вызове componentWillUnmount", () => {
      storeGetStateStub.returns({});
      const mapStateToProps = () => ({});
      const ConnectedComponent = connect(mapStateToProps)(
        MockBlockInstance as unknown as ConnectableConstructor
      );
      const component = new ConnectedComponent(
        {}
      ) as unknown as MockBlockInstance;

      const storeCallback = storeOnSpy.args[0][1] as () => void;

      component.componentWillUnmount();

      expect(storeOffSpy.calledOnce).to.be.true;
      expect(storeOffSpy.calledWith(StoreEvents.Updated, storeCallback)).to.be
        .true;
      expect(component.wasComponentWillUnmountCalled()).to.be.true;
    });

    it("должен вызывать componentWillUnmount родительского компонента", () => {
      storeGetStateStub.returns({});

      class ParentMockBlockInstance extends MockBlockInstance {
        public parentUnmountCalled = false;

        public componentWillUnmount(): void {
          this.parentUnmountCalled = true;
          super.componentWillUnmount();
        }

        public wasParentUnmountCalled(): boolean {
          return this.parentUnmountCalled;
        }
      }

      const mapStateToProps = () => ({});
      const ConnectedComponent = connect(mapStateToProps)(
        ParentMockBlockInstance as unknown as ConnectableConstructor
      );
      const component = new ConnectedComponent(
        {}
      ) as unknown as ParentMockBlockInstance;

      component.componentWillUnmount();

      expect(component.wasParentUnmountCalled()).to.be.true;
      expect(component.wasComponentWillUnmountCalled()).to.be.true;
    });

    it("не должен вызывать off если store не существует при unmount", () => {
      storeGetStateStub.returns({});
      const mapStateToProps = () => ({});
      const ConnectedComponent = connect(mapStateToProps)(
        MockBlockInstance as unknown as ConnectableConstructor
      );
      const component = new ConnectedComponent(
        {}
      ) as unknown as MockBlockInstance;

      setWindowStore(undefined);

      component.componentWillUnmount();

      expect(storeOffSpy.called).to.be.false;
      expect(component.wasComponentWillUnmountCalled()).to.be.true;
    });
  });

  describe("Поведение с различными mapStateToProps", () => {
    it("должен корректно обрабатывать пустой объект из mapStateToProps", () => {
      storeGetStateStub.returns({ user: "test" });

      const mapStateToProps = () => ({});
      const ConnectedComponent = connect(mapStateToProps)(
        MockBlockInstance as unknown as ConnectableConstructor
      );
      const component = new ConnectedComponent({ prop: "value" });

      expect(component.props).to.deep.equal({ prop: "value" });
    });

    it("должен корректно обрабатывать вложенные объекты в mapStateToProps", () => {
      const state = {
        user: {
          profile: {
            firstName: "John",
            lastName: "Doe",
          },
        },
      };
      storeGetStateStub.returns(state);

      const mapStateToProps = (state: Record<string, unknown>) => {
        const user = state.user as Record<string, unknown>;
        const profile = user.profile as Record<string, unknown>;
        return {
          fullName: `${profile.firstName as string} ${
            profile.lastName as string
          }`,
        };
      };

      const ConnectedComponent = connect(mapStateToProps)(
        MockBlockInstance as unknown as ConnectableConstructor
      );
      const component = new ConnectedComponent({});

      expect(component.props).to.have.property("fullName", "John Doe");
    });

    it("должен заменять props при конфликте имен с mapStateToProps", () => {
      storeGetStateStub.returns({ value: "from store" });

      const mapStateToProps = (state: Record<string, unknown>) => ({
        value: state.value,
      });

      const ConnectedComponent = connect(mapStateToProps)(
        MockBlockInstance as unknown as ConnectableConstructor
      );
      const component = new ConnectedComponent({ value: "from props" });

      expect(component.props).to.have.property("value", "from store");
    });
  });

  describe("Интеграционное поведение", () => {
    it("должен поддерживать несколько обновлений store с разными данными", () => {
      const states = [{ count: 0 }, { count: 1 }, { count: 2 }, { count: 2 }];

      let currentStateIndex = 0;
      storeGetStateStub.callsFake(() => states[currentStateIndex]);

      const mapStateToProps = (state: Record<string, unknown>) => ({
        currentCount: state.count,
      });

      const ConnectedComponent = connect(mapStateToProps)(
        MockBlockInstance as unknown as ConnectableConstructor
      );
      const component = new ConnectedComponent(
        {}
      ) as unknown as MockBlockInstance;

      const storeCallback = storeOnSpy.args[0][1] as () => void;

      currentStateIndex = 1;
      storeCallback();
      expect(component.getLastSetPropsArgs()).to.deep.equal({
        currentCount: 1,
      });

      currentStateIndex = 2;
      component.resetTestState();
      storeCallback();
      expect(component.getLastSetPropsArgs()).to.deep.equal({
        currentCount: 2,
      });

      currentStateIndex = 3;
      component.resetTestState();
      storeCallback();
      expect(component.getLastSetPropsArgs()).to.be.null;
    });

    it("должен корректно обрабатывать null и undefined значения из store", () => {
      const state = {
        nullValue: null,
        undefinedValue: undefined,
        regularValue: "test",
      };
      storeGetStateStub.returns(state);

      const mapStateToProps = (state: Record<string, unknown>) => ({
        nullProp: state.nullValue,
        undefinedProp: state.undefinedValue,
        regularProp: state.regularValue,
      });

      const ConnectedComponent = connect(mapStateToProps)(
        MockBlockInstance as unknown as ConnectableConstructor
      );
      const component = new ConnectedComponent({});

      expect(component.props).to.deep.equal({
        nullProp: null,
        undefinedProp: undefined,
        regularProp: "test",
      });
    });
  });
});
