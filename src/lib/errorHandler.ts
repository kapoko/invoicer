export const withErrorHandling =
  <T>(fn: Function) =>
  async (...args: T[]) => {
    try {
      const res = await fn(...args);
      return res;
    } catch (e) {
      if (e instanceof Error) {
        console.error(`❗ ${e.message}`);
      } else {
        console.error(e);
      }
    }
  };
