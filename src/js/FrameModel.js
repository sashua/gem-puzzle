const SHUFFLE_STEPS_RATIO_MIN = 3;
const SHUFFLE_STEPS_RATIO_MAX = 4;

export class FrameModel {
  #tiles;
  #onChangeHandler;

  constructor({ onChange }) {
    this.#tiles = [[]];
    this.#onChangeHandler = onChange;
  }

  get tiles() {
    return this.#tiles;
  }

  set tiles(newTiles) {
    this.#tiles = newTiles;
    this.#onChange();
  }

  get size() {
    return this.#tiles.length;
  }

  set size(newSize) {
    this.shuffleTiles(newSize ?? this.size);
  }

  get solved() {
    return this.#tiles
      .flat()
      .every((val, i) => val === i + 1 || i === this.size ** 2 - 1);
  }

  get solvable() {
    // TODO:
    return true;
  }

  get slidingTiles() {
    return this.getAdjacentTiles(0);
  }

  isSlidingTile(tile) {
    return this.slidingTiles.includes(tile);
  }

  isSlidingPos(pos) {
    return this.isSlidingTile(this.getTileAt(pos));
  }

  getTilePos(tile) {
    const index = this.#tiles.flat().indexOf(tile);
    return {
      row: Math.floor(index / this.size),
      col: index % this.size,
    };
  }

  getTileAt({ row, col }) {
    return this.#tiles[row] ? this.#tiles[row][col] : null;
  }

  getAdjacentTiles(tile) {
    return this.getAdjacentPos(this.getTilePos(tile)).map((pos) =>
      this.getTileAt(pos)
    );
  }

  getAdjacentPos({ row, col }) {
    return [
      { row, col: col - 1 },
      { row, col: col + 1 },
      { row: row - 1, col },
      { row: row + 1, col },
    ].filter(
      ({ row, col }) =>
        row >= 0 && col >= 0 && row < this.size && col < this.size
    );
  }

  slideTile(tile) {
    if (!this.isSlidingTile(tile)) {
      return false;
    }

    const tilePos = this.getTilePos(tile);
    const openPos = this.getTilePos(0);

    this.#tiles[tilePos.row][tilePos.col] = 0;
    this.#tiles[openPos.row][openPos.col] = tile;

    this.#onChange();
    return true;
  }

  slidePos(pos) {
    return this.slideTile(this.getTileAt(pos));
  }

  shuffleTiles(newSize) {
    newSize = newSize ?? this.size;
    if (!newSize) {
      return;
    }

    // disable onChange event
    const onChangeHandler = this.#onChangeHandler;
    this.#onChangeHandler = null;

    // move tiles randomly
    this.tiles = createSortedMatrix(newSize);
    const shuffleSteps = getRandom(
      newSize ** SHUFFLE_STEPS_RATIO_MIN,
      newSize ** SHUFFLE_STEPS_RATIO_MAX
    );
    for (let i = 0; i < shuffleSteps; i += 1) {
      const slidingTiles = this.slidingTiles;
      this.slideTile(this.slidingTiles[getRandom(0, slidingTiles.length)]);
    }

    // enable onChange event
    this.#onChangeHandler = onChangeHandler;
    this.#onChange();
  }

  toString() {
    return this.#tiles.flat().reduce((acc, val, i) => {
      acc += val ? val : "--";
      acc += (i + 1) % this.size ? "\t" : "\n";
      return acc;
    }, "");
  }

  #onChange() {
    this.#onChangeHandler?.(this.tiles);
  }
}

// === Helpers ===
function getRandom(min, max) {
  return min + Math.floor(Math.random() * max);
}

function createSortedMatrix(size) {
  const values = [...Array(size ** 2).keys()].map((v) => v + 1);
  values[size ** 2 - 1] = 0;

  return values.reduce((acc, val, i) => {
    if (i % size) {
      acc.at(-1).push(val);
    } else {
      acc.push([val]);
    }
    return acc;
  }, []);
}
