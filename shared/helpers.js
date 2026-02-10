export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function debounce(func, delay) {
  let timeoutId;

  function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  }

  debounced.cancel = function () {
    clearTimeout(timeoutId);
    timeoutId = null;
  };

  return debounced;
}

export function debounceAsync(func, delay) {
  let timeoutId;
  let pendingRejects = [];

  return function (...args) {
    return new Promise((resolve, reject) => {
      pendingRejects.forEach((rejectFn) =>
        rejectFn(new Error("Request cancelled by debounce"))
      );
      pendingRejects = [];

      clearTimeout(timeoutId);

      pendingRejects.push(reject);

      timeoutId = setTimeout(async () => {
        pendingRejects = [];

        try {
          const result = await func.apply(this, args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
}

/**
 * Deep equality comparison for JSON-serializable values.
 * Handles: primitives, plain objects, arrays, and null.
 */
export function deepEqual(a, b) {
  if (a === b) return true;

  if (a === null || b === null || typeof a !== "object" || typeof b !== "object")
    return false;

  const aIsArray = Array.isArray(a);
  const bIsArray = Array.isArray(b);
  if (aIsArray !== bIsArray) return false;

  if (aIsArray) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (!Object.prototype.hasOwnProperty.call(b, key) || !deepEqual(a[key], b[key]))
      return false;
  }

  return true;
}
