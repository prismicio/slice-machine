export default async function poll<Result>(
  fn: () => Promise<Result>,
  validate: (result: Result) => boolean,
  interval: number,
  maxAttempts: number
): Promise<void> {
  let attempts = 0;
  const checkCondition = (
    resolve: (value: void | PromiseLike<void>) => void,
    reject: (reason?: Error) => void
  ): void => {
    Promise.resolve(fn())
      .then((result) => {
        if (validate(result)) {
          resolve();
        } else if (attempts < maxAttempts) {
          attempts += 1;
          setTimeout(checkCondition, interval, resolve, reject);
        } else {
          reject(new Error("AsyncPoller: reached timeout"));
        }
      })
      .catch((err) => {
        reject(err);
      });
  };

  return new Promise<void>(checkCondition);
}
