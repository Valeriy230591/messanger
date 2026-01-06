import { expect } from "chai";
import Block from "./block.ts";

describe("Block", () => {
  describe("Public methods", () => {
    describe("constructor", () => {
      it("должен создавать элемент с тегом div по умолчанию", () => {
        const block = new Block();
        const content = block.getContent();
        expect(content?.tagName).to.equal("DIV");
      });

      it("должен создавать элемент с кастомным тегом", () => {
        const block = new Block("span");
        const content = block.getContent();
        expect(content?.tagName).to.equal("SPAN");
      });

      it("должен устанавливать className из props", () => {
        const block = new Block("div", { className: "test-class" });
        const content = block.getContent();
        expect(content?.classList.contains("test-class")).to.be.true;
      });

      it("должен устанавливать атрибуты из props", () => {
        const block = new Block("div", {
          attrs: { id: "test-id", "data-test": "value" },
        });
        const content = block.getContent();
        expect(content?.getAttribute("id")).to.equal("test-id");
        expect(content?.getAttribute("data-test")).to.equal("value");
      });
    });

    describe("componentDidMount", () => {
      it("должен вызываться без ошибок", () => {
        const block = new Block();
        expect(() => block.componentDidMount()).to.not.throw();
      });

      it("должен принимать параметр oldProps", () => {
        const block = new Block();
        const oldProps = { test: "value" };
        expect(() => block.componentDidMount(oldProps)).to.not.throw();
      });
    });

    describe("dispatchComponentDidMount", () => {
      it("должен вызываться без ошибок", () => {
        const block = new Block();
        expect(() => block.dispatchComponentDidMount()).to.not.throw();
      });
    });

    describe("componentDidUpdate", () => {
      it("должен возвращать true по умолчанию", () => {
        const block = new Block();
        const result = block.componentDidUpdate({}, {});
        expect(result).to.be.true;
      });

      it("должен получать параметры oldProps и newProps", () => {
        class TestBlock extends Block {
          public receivedOldProps: unknown = null;
          public receivedNewProps: unknown = null;

          public componentDidUpdate(
            oldProps: unknown,
            newProps: unknown
          ): boolean {
            this.receivedOldProps = oldProps;
            this.receivedNewProps = newProps;
            return true;
          }
        }

        const block = new TestBlock();
        const oldProps = { a: 1 };
        const newProps = { b: 2 };

        block.componentDidUpdate(oldProps, newProps);

        expect(block.receivedOldProps).to.deep.equal(oldProps);
        expect(block.receivedNewProps).to.deep.equal(newProps);
      });
    });

    describe("setProps", () => {
      it("должен обновлять существующие props", () => {
        const block = new Block("div", { test: "old" });
        block.setProps({ test: "new" });
        expect(block.props.test).to.equal("new");
      });

      it("должен добавлять новые props", () => {
        const block = new Block("div", { a: 1 });
        block.setProps({ b: 2 });
        expect(block.props.a).to.equal(1);
        expect(block.props.b).to.equal(2);
      });

      it("не должен вызывать ошибок при вызове с пустым объектом", () => {
        const block = new Block();
        expect(() => block.setProps({})).to.not.throw();
      });

      it("должен обрабатывать множественные обновления свойств", () => {
        const block = new Block();
        block.setProps({ a: 1, b: 2, c: 3 });
        expect(block.props.a).to.equal(1);
        expect(block.props.b).to.equal(2);
        expect(block.props.c).to.equal(3);
      });
    });

    describe("getContent", () => {
      it("должен возвращать HTMLElement", () => {
        const block = new Block();
        const content = block.getContent();
        expect(content).to.be.instanceOf(HTMLElement);
      });

      it("должен возвращать один и тот же элемент при множественных вызовах", () => {
        const block = new Block();
        const content1 = block.getContent();
        const content2 = block.getContent();
        expect(content1).to.equal(content2);
      });

      it("должен возвращать элемент с правильным тегом", () => {
        const block = new Block("button");
        const content = block.getContent();
        expect(content?.tagName).to.equal("BUTTON");
      });
    });

    describe("render", () => {
      it("должен возвращать строку", () => {
        const block = new Block();
        const result = block.render();
        expect(result).to.be.a("string");
      });

      it("должен возвращать пустую строку по умолчанию", () => {
        const block = new Block();
        expect(block.render()).to.equal("");
      });

      it("должен переопределяться в дочернем классе", () => {
        class TestBlock extends Block {
          public render(): string {
            return "<div>Custom Template</div>";
          }
        }

        const block = new TestBlock();
        expect(block.render()).to.equal("<div>Custom Template</div>");
      });
    });

    describe("show", () => {
      it("должен устанавливать display в block", () => {
        const block = new Block();
        const content = block.getContent();

        if (content) {
          content.style.display = "none";
          block.show();
          expect(content.style.display).to.equal("block");
        }
      });

      it("не должен вызывать ошибок при множественных вызовах", () => {
        const block = new Block();
        expect(() => {
          block.show();
          block.show();
          block.show();
        }).to.not.throw();
      });
    });

    describe("hide", () => {
      it("должен устанавливать display в none", () => {
        const block = new Block();
        const content = block.getContent();

        if (content) {
          content.style.display = "block";
          block.hide();
          expect(content.style.display).to.equal("none");
        }
      });

      it("не должен вызывать ошибок при множественных вызовах", () => {
        const block = new Block();
        expect(() => {
          block.hide();
          block.hide();
          block.hide();
        }).to.not.throw();
      });
    });

    describe("Children handling", () => {
      it("должен корректно отделять children от props", () => {
        const childBlock1 = new Block();
        const childBlock2 = new Block();

        const parentBlock = new Block("div", {
          text: "Hello",
          count: 42,
          child1: childBlock1,
          child2: childBlock2,
        });

        expect(parentBlock.props.text).to.equal("Hello");
        expect(parentBlock.props.count).to.equal(42);
        expect(parentBlock.children.child1).to.equal(childBlock1);
        expect(parentBlock.children.child2).to.equal(childBlock2);
      });

      it("должен обрабатывать массив children", () => {
        const childBlocks = [new Block(), new Block(), new Block()];

        const parentBlock = new Block("div", {
          items: childBlocks,
          title: "List",
        });

        expect(parentBlock.children.items).to.deep.equal(childBlocks);
        expect(parentBlock.props.title).to.equal("List");
      });

      it("должен обрабатывать смешанный массив (не-Block элементы остаются в props)", () => {
        const parentBlock = new Block("div", {
          items: [1, 2, 3],
          blocks: [new Block(), new Block()],
        });

        expect(parentBlock.props.items).to.deep.equal([1, 2, 3]);
        expect(parentBlock.children.blocks).to.be.an("array").with.length(2);
      });
    });

    describe("Props proxy behavior", () => {
      it("должен позволять привязку функций в props", () => {
        const myFunction = function (this: { value: string }) {
          return this.value;
        };

        const block = new Block("div", {
          value: "test",
          myFunction: myFunction,
        });

        expect(block.props.myFunction).to.be.a("function");
      });

      it("должен позволять чтение вложенных props", () => {
        const block = new Block("div", {
          user: { name: "John", age: 30 },
        });

        expect(block.props.user).to.deep.equal({ name: "John", age: 30 });
      });
    });
  });
});
