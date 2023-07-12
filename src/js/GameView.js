import { formatDate, formatTime } from "./helpers";
import gameTemplate from "../templates/game.hbs";
import resultsTemplate from "../templates/results.hbs";
import messageTemplate from "../templates/message.hbs";
import icons from "../assets/icons.svg";
import clickSound from "../assets/click.mp3";
import slideSound from "../assets/slide.mp3";

const AUDIO = {
  click: new Audio(clickSound),
  slide: new Audio(slideSound),
};

export class GameView {
  #refs;
  #audio;
  #buttonHandlers;

  constructor({ sizes, onNewGame, onSaveGame, onLoadGame, onShowResults }) {
    document.body.innerHTML = gameTemplate({ sizes, icons });
    this.#refs = this.#getRefs();
    this.#buttonHandlers = {
      newGame: onNewGame,
      saveGame: onSaveGame,
      loadGame: onLoadGame,
      showResults: onShowResults,
    };
    this.#audio = AUDIO;
    this.#bindEvents();
  }

  render({ size, moves, time }) {
    this.#refs.sizes.querySelector(`[value="${size}"]`).checked = true;
    this.#refs.moves.textContent = moves;
    this.#refs.time.textContent = formatTime(time);
  }

  showResults({ size, results }) {
    const formattedResults = results.map((v) => ({
      ...v,
      date: formatDate(v.date),
      time: formatTime(v.time),
    }));
    this.showModal(resultsTemplate({ size, results: formattedResults }));
  }

  showModal(message, timeout) {
    this.#refs.modal.innerHTML = messageTemplate(message);
    this.#refs.modal.classList.remove("is-hidden");
    if (timeout) {
      setTimeout(() => this.hideModal(), timeout);
    }
  }

  hideModal() {
    this.#refs.modal.classList.add("is-hidden");
  }

  playSound(name) {
    if (this.#refs.mute.checked || !this.#audio[name]) {
      return;
    }
    this.#audio[name].currentTime = 0;
    this.#audio[name].play();
  }

  #bindEvents() {
    this.#refs.buttons.addEventListener(
      "click",
      this.#onButtonsClick.bind(this)
    );
    this.#refs.sizes.addEventListener("click", this.#onSizesClick.bind(this));
    this.#refs.mute.addEventListener("click", () => this.playSound("click"));
    this.#refs.modal.addEventListener("click", this.hideModal.bind(this));
  }

  #getRefs() {
    return {
      buttons: document.querySelector(".js-buttons"),
      sizes: document.querySelector(".js-sizes"),
      moves: document.querySelector(".js-moves"),
      time: document.querySelector(".js-time"),
      modal: document.querySelector(".js-modal"),
      mute: document.querySelector(".js-mute"),
    };
  }

  #onButtonsClick(e) {
    const button = e.target.closest(".button");
    if (!button) {
      return;
    }
    this.playSound("click");
    this.#buttonHandlers[button.dataset.action]?.();
  }

  #onSizesClick(e) {
    if (e.target.name !== "size") {
      return;
    }
    this.playSound("click");
    const size = Number(e.target.value);
    this.#buttonHandlers.newGame?.(size);
  }
}
