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
