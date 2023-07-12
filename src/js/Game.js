import { GameModel } from "./GameModel";
import { FrameModel } from "./FrameModel";
import { GameView } from "./GameView";
import { FrameView } from "./FrameView";
import { Timer } from "./Timer";
import { formatTime } from "./helpers";

const MESSAGE_TIMEOUT = 1000;

const DEFAULT_SIZE = 4;

const FRAME_SIZES = [3, 4, 5, 6, 7, 8];

const FRAME_PARAMS = {
  sizeRatio: 0.9,
  gap: 4,
};

const TILE_STYLES = {
  font: "400 40% sans-serif",
  color: "#fff",
  border: [0, "#fff"],
  borderRadius: 8,
  background: "#8d99ae",
  boxShadow: [1, 1, 2, "#293241"],
};

export class Game {
  #gameModel;
  #frameModel;
  #gameView;
  #frameView;
  #timer;

  constructor() {
    this.#gameModel = new GameModel({
      onChange: this.#onGameChange.bind(this),
    });

    this.#frameModel = new FrameModel({
      onChange: this.#onFrameChange.bind(this),
    });

    this.#gameView = new GameView({
      sizes: FRAME_SIZES,
      onNewGame: this.#onNewGame.bind(this),
      onSaveGame: this.#onSaveGame.bind(this),
      onLoadGame: this.#onLoadGame.bind(this),
      onShowResults: this.#onShowResults.bind(this),
    });

    this.#frameView = new FrameView({
      rootSelector: ".js-frame",
      ...FRAME_PARAMS,
      tileStyles: TILE_STYLES,
      onClick: this.#onTileClick.bind(this),
    });

    this.#timer = new Timer({
      onTick: (time) => (this.#gameModel.time = time),
    });

    this.#onNewGame(DEFAULT_SIZE);
  }

  #onNewGame(size) {
    if (size === this.#frameModel.size) {
      return;
    }
    this.#gameView.hideModal();
    this.#frameModel.shuffleTiles(size);
    this.#gameModel.size = size ?? this.#frameModel.size;
    this.#gameModel.reset();
    this.#timer.start();
  }

  #onSaveGame() {
    if (this.#frameModel.solved) {
      return;
    }
    this.#gameView.hideModal();
    this.#gameModel.saveGame(this.#frameModel.tiles);
    this.#gameView.showModal("Game saved", MESSAGE_TIMEOUT);
  }

  #onLoadGame() {
    const savedState = this.#gameModel.loadGame();
    if (!savedState) {
      return;
    }
    this.#gameView.hideModal();
    this.#timer.start(savedState.time);
    this.#frameModel.tiles = savedState.tiles;
    this.#gameModel.size = this.#frameModel.size;
    this.#gameModel.time = savedState.time;
    this.#gameModel.moves = savedState.moves;
    this.#gameView.showModal("Game loaded", MESSAGE_TIMEOUT);
  }

  #onShowResults() {
    const size = this.#frameModel.size;
    const allResults = this.#gameModel.getResults();
    let results = allResults?.[size] ?? [];
    results = results.map((val, i) => ({ ...val, place: i + 1 }));
    this.#gameView.hideModal();
    this.#gameView.showResults({ size, results });
  }

  #onTileClick(pos) {
    if (this.#frameModel.solved) {
      return;
    }
    const isMoved = this.#frameModel.slidePos(pos);
    if (!isMoved) {
      return;
    }
    this.#gameView.playSound("slide");
    this.#gameModel.addMove();
    if (this.#frameModel.solved) {
      this.#timer.stop();
      this.#gameModel.saveResult();
      this.#gameView.showModal(
        `Hooray!<br />You solved the puzzle in ${formatTime(
          this.#gameModel.time
        )} and ${this.#gameModel.moves} moves!`
      );
    }
  }

  #onGameChange(state) {
    this.#gameView.render(state);
  }

  #onFrameChange(tiles) {
    this.#frameView.render(tiles);
  }
}
