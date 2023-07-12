export class Timer {
  #period;
  #startTime;
  #stopTime;
  #timerId;
  #onTickHandler;

  constructor({ period = 1000, onTick }) {
    this.#period = period;
    this.#startTime = 0;
    this.#stopTime = 0;
    this.#timerId = null;
    this.#onTickHandler = onTick;
  }

  get time() {
    return (this.#stopTime ?? Date.now()) - this.#startTime;
  }

  start(startTime = 0) {
    this.#timerId = setInterval(() => this.#onTick(), this.#period);
    this.#startTime = Date.now() - startTime;
    this.#stopTime = null;
  }

  stop() {
    clearInterval(this.#timerId);
    this.#timerId = null;
    this.#stopTime = Date.now();
    this.#onTick();
    return this.time;
  }

  #onTick() {
    this.#onTickHandler?.(this.time);
  }
}
