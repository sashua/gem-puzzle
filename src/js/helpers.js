// === Canvas helpers ===
export function convertFontSizeToPx(font, base) {
  const matches = font.match(/\d*%/g);
  if (!matches) {
    return font;
  }
  const size = matches[0];
  return font.replace(size, `${(Number.parseFloat(size) * base) / 100}px`);
}

// === Storage helpers ===
export function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadFromStorage(key) {
  let savedValue = localStorage.getItem(key);
  if (!savedValue) {
    return null;
  }
  try {
    savedValue = JSON.parse(savedValue);
  } catch {
    localStorage.removeItem(key);
    return null;
  }
  return savedValue;
}

// === Time helpers ===
export function formatDate(ms) {
  return new Date(ms).toLocaleDateString("en-GB", { dateStyle: "medium" });
}

export function formatTime(ms) {
  const { minutes, seconds } = convertMs(ms);
  return [minutes, seconds].map((n) => n.toString().padStart(2, "0")).join(":");
}

function convertMs(ms) {
  const second = 1000;
  const minute = second * 60;

  const minutes = Math.floor(ms / minute);
  const seconds = Math.floor((ms % minute) / second);

  return { minutes, seconds };
}
