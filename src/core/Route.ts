import type { RouteInterface } from "./Router";
import type { BlockConstructable } from "../types/block";

interface RouteProps {
  rootQuery: string;
}

class Route implements RouteInterface {
  private _blockClass: BlockConstructable;
  private _block: InstanceType<BlockConstructable> | null;
  private _pathname: string;
  private _props: RouteProps;

  constructor(pathname: string, view: BlockConstructable, props: RouteProps) {
    this._pathname = pathname;
    this._blockClass = view;
    this._block = null;
    this._props = props;
  }

  navigate(pathname: string): void {
    if (this.match(pathname)) {
      this._pathname = pathname;
      this.render();
    }
  }

  leave(): void {
    if (this._block) {
      // this._block.hide();
    }
  }

  match(pathname: string): boolean {
    if (this._pathname === "*") {
      return true;
    }
    return pathname === this._pathname;
  }

  _renderDom(query: string, block: InstanceType<BlockConstructable>): void {
    const root = document.querySelector(query);
    const content = block.getContent();

    if (root && content) {
      root.innerHTML = "";
      root.append(content);
    }
  }

  render(): void {
    if (!this._block) {
      this._block = new this._blockClass({});
    }

    this._renderDom(this._props.rootQuery, this._block);
    this._block.componentDidMount({});
  }
}

export default Route;
