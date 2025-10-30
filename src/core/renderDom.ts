import Block from "./block";

export default function renderDOM(block: Block): void {
  const root = document.querySelector("#app");

  root!.innerHTML = "";
  root!.appendChild(block.getContent()!);
}

export function render(query: string, block: Block): Element {
  const root = document.querySelector(query)!;

  root.appendChild(block.getContent()!);

  block.dispatchComponentDidMount();

  return root;
}
