// isEqual.spec.ts
import { expect } from "chai";
import isEqual from "./isEqual.ts";

describe("isEqual", () => {
  it("должен возвращать true для одинаковых объектов", () => {
    expect(isEqual({ a: 1, b: "test" }, { a: 1, b: "test" })).to.be.true;
  });

  it("должен возвращать false для объектов с разными значениями", () => {
    expect(isEqual({ a: 1, b: "test" }, { a: 2, b: "test" })).to.be.false;
  });

  it("должен возвращать false для объектов с разными ключами", () => {
    expect(isEqual({ a: 1, b: "test" }, { a: 1, c: "test" })).to.be.false;
  });

  it("должен возвращать true для пустых объектов", () => {
    expect(isEqual({}, {})).to.be.true;
  });

  it("должен возвращать true для вложенных объектов", () => {
    const obj1 = { user: { name: "John", age: 30 } };
    const obj2 = { user: { name: "John", age: 30 } };
    expect(isEqual(obj1, obj2)).to.be.true;
  });

  it("должен возвращать false для разных вложенных объектов", () => {
    const obj1 = { user: { name: "John", age: 30 } };
    const obj2 = { user: { name: "Jane", age: 30 } };
    expect(isEqual(obj1, obj2)).to.be.false;
  });

  it("должен возвращать true для объектов с массивами", () => {
    const obj1 = { items: [1, 2, 3], name: "test" };
    const obj2 = { items: [1, 2, 3], name: "test" };
    expect(isEqual(obj1, obj2)).to.be.true;
  });

  it("должен возвращать false для объектов с разными массивами", () => {
    const obj1 = { items: [1, 2, 3] };
    const obj2 = { items: [1, 2, 4] };
    expect(isEqual(obj1, obj2)).to.be.false;
  });

  it("должен возвращать true для объектов с null", () => {
    expect(isEqual({ value: null }, { value: null })).to.be.true;
  });

  it("должен возвращать true для объектов с undefined", () => {
    expect(isEqual({ value: undefined }, { value: undefined })).to.be.true;
  });
});
