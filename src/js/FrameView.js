import { convertFontSizeToPx } from "./helpers";

export class FrameView {
  #root;
  #canvas;
  #ctx;
  #tiles;
  #sizeRatio;
  #gap;
  #tileStyles;
  #onClickHandler;

  constructor({ rootSelector, sizeRatio = 1, gap = 0, tileStyles, onClick }) {
    this.#root = document.querySelector(rootSelector);
    this.#canvas = this.#init();
    this.#ctx = this.#canvas.getContext("2d");

    this.#sizeRatio = sizeRatio;
    this.#gap = gap;
    this.#tileStyles = tileStyles;

    this.#onClickHandler = onClick;
    this.#canvas.addEventListener("click", (e) => this.#onClick(e));
    window.addEventListener("resize", this.#onResize.bind(this));
    this.#onResize();
  }

  get size() {
    return this.#canvas.width;
  }

  render(tiles) {
    this.#tiles = tiles ?? this.#tiles;
    if (!this.#tiles) {
      return;
    }
    const tilesNum = this.#tilesNum;
    const tileSize = this.#tileSize;
    const padding = this.#padding;

    this.clear();

    this.#tiles.flat().forEach((val, i) => {
      if (!val) {
        return;
      }
      this.#drawTile({
        x: (i % tilesNum) * (tileSize + this.#gap) + padding,
        y: Math.floor(i / tilesNum) * (tileSize + this.#gap) + padding,
        width: tileSize,
        text: val,
        styles: this.#tileStyles,
      });
    });
  }

  clear() {
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  get #padding() {
    return Math.ceil((this.size * (1 - this.#sizeRatio)) / 2);
  }

  get #tilesNum() {
    return this.#tiles.length;
  }

  get #tileSize() {
    const tilesNum = this.#tilesNum;
    return Math.floor(
      (this.size - 2 * this.#padding - this.#gap * (tilesNum - 1)) / tilesNum
    );
  }

  #drawTile({ x, y, width, text }) {
    const {
      font,
      color,
      border: [borderWidth, borderColor],
      borderRadius,
      background,
      boxShadow: [shadowX, shadowY, shadowBlur, shadowColor],
    } = this.#tileStyles;
    const ctx = this.#ctx;
    const size = width - borderWidth;

    ctx.translate(x + borderWidth / 2, y + borderWidth / 2);
    ctx.beginPath();

    ctx.lineWidth = borderWidth;
    ctx.roundRect(0, 0, size, size, borderRadius);

    ctx.shadowOffsetX = shadowX;
    ctx.shadowOffsetY = shadowY;
    ctx.shadowBlur = shadowBlur;
    ctx.shadowColor = shadowColor;

    ctx.fillStyle = background;
    ctx.fill();

    if (borderWidth) {
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";

    ctx.font = convertFontSizeToPx(font, width);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(text, size / 2, size / 2);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  #init() {
    const canvas = document.createElement("canvas");
    this.#root.append(canvas);
    return canvas;
  }

  #getTilePos(x, y) {
    const tileSize = this.#tileSize;
    const tileFraction = tileSize / (tileSize + this.#gap);
    const row = (y - this.#padding) / (tileSize + this.#gap);
    const col = (x - this.#padding) / (tileSize + this.#gap);
    if (row % 1 > tileFraction || col % 1 > tileFraction) {
      return null;
    }
    return {
      row: Math.floor(row),
      col: Math.floor(col),
    };
  }

  #onClick(e) {
    const tilePos = this.#getTilePos(e.offsetX, e.offsetY);
    this.#onClickHandler?.(tilePos);
  }

  #onResize() {
    const size = this.#root.clientWidth;
    this.#canvas.width = size;
    this.#canvas.height = size;
    this.render();
  }
}
