import { saveToStorage, loadFromStorage } from "./helpers";

const STORAGE_SAVED_KEY = "gem-game-saved";
const STORAGE_RESULTS_KEY = "gem-game-results";

export class GameModel {
  #size;
  #time;
  #moves;
  #onChangeHandler;

  constructor({ onChange }) {
    this.#size = 0;
    this.#time = 0;
    this.#moves = 0;
    this.#onChangeHandler = onChange;
  }

  get size() {
    return this.#size;
  }

  set size(newSize) {
    this.#size = newSize;
    this.#onChange();
  }

  get time() {
    return this.#time;
  }

  set time(newTime) {
    this.#time = newTime;
    this.#onChange();
  }

  get moves() {
    return this.#moves;
  }

  set moves(newValue) {
    this.#moves = newValue;
    this.#onChange();
  }

  addMove() {
    this.#moves += 1;
    this.#onChange();
  }

  reset() {
    this.#moves = 0;
    this.#time = 0;
    this.#onChange();
  }

  saveGame(tiles) {
    saveToStorage(STORAGE_SAVED_KEY, {
      moves: this.#moves,
      time: this.#time,
      tiles,
    });
  }

  loadGame() {
    return loadFromStorage(STORAGE_SAVED_KEY);
  }

  saveResult() {
    const allResults = loadFromStorage(STORAGE_RESULTS_KEY) ?? {};
    const results = allResults[this.#size] ?? [];
    results.push({
      date: Date.now(),
      time: this.#time,
      moves: this.#moves,
    });
    results.sort((a, b) => a.time / a.moves - b.time / b.moves);
    allResults[this.#size] = results.slice(0, 10);
    saveToStorage(STORAGE_RESULTS_KEY, allResults);
  }

  getResults() {
    return loadFromStorage(STORAGE_RESULTS_KEY);
  }

  #onChange() {
    this.#onChangeHandler?.({
      size: this.#size,
      moves: this.#moves,
      time: this.#time,
    });
  }
}
