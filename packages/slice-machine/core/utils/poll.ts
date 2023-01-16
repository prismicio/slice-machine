export async function startPolling<
  Result,
  ValidatedResult extends Result = Result
>(
  fn: () => Promise<Result>,
  validate: (result: Result) => result is ValidatedResult,
  interval: number,
  maxAttempts: number
): Promise<ValidatedResult> {
  let attempts = 0;
  const checkCondition = (
    resolve: (value: ValidatedResult | PromiseLike<ValidatedResult>) => void,
    reject: (reason?: Error) => void
  ): void => {
    Promise.resolve(fn())
      .then((result) => {
        if (validate(result)) {
          resolve(result);
        } else if (attempts < maxAttempts) {
          attempts += 1;
          setTimeout(checkCondition, interval, resolve, reject);
        } else {
          reject(new Error("AsyncPoller: reached timeout"));
        }
      })
      .catch((error: Error) => {
        reject(error);
      });
  };

  return new Promise<ValidatedResult>(checkCondition);
}
