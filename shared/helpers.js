export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}
