export const withErrorHandling =
  <TArgs extends unknown[], TResult>(
    fn: (...args: TArgs) => TResult | Promise<TResult>,
  ) =>
  async (...args: TArgs): Promise<TResult | undefined> => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof Error) {
        console.error(`❗ ${e.message}`);
      } else {
        console.error(e);
      }
    }
  };
