// components/nodes/ImageNode.tsx
import {
  LexicalNode,
  NodeKey,
  Spread,
  ElementNode,
  SerializedElementNode,
} from "lexical";

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    width?: string;
    type: "image";
    version: 1;
  },
  SerializedElementNode
>;

export class ImageNode extends ElementNode {
  __src: string;
  __altText: string;
  __width: string;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__width, node.__key);
  }

  constructor(src: string, altText: string, width?: string, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width || "auto";
  }

  createDOM(): HTMLElement {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.style.margin = "8px 0";

    const img = document.createElement("img");
    img.src = this.__src;
    img.alt = this.__altText;
    img.style.maxWidth = this.__width;
    img.style.maxHeight = "200px"; // Limit image height to 200px
    img.style.height = "auto";
    img.style.objectFit = "contain";

    container.appendChild(img);
    return container;
  }

  updateDOM(): boolean {
    // Return false as we don't need to update the DOM
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      type: "image",
      version: 1,
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
    };
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText, width } = serializedNode;
    const node = new ImageNode(src, altText, width);
    return node;
  }
}

export function $createImageNode(
  src: string,
  altText: string,
  width?: string
): ImageNode {
  return new ImageNode(src, altText, width);
}

export function $isImageNode(
  node: LexicalNode | null | undefined
): node is ImageNode {
  return node instanceof ImageNode;
}
