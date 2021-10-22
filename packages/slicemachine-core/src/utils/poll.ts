export default async function poll<Result>(
  fn: () => Promise<Result>,
  validate: (result: Result) => boolean,
  interval: number,
  maxAttempts: number
): Promise<void> {
  let attempts = 0;

  const executePoll = async (resolve: Function, reject: Function) => {
    const result = await fn();
    attempts++;

    if (validate(result)) {
      return resolve(result);
    } else if (maxAttempts && attempts === maxAttempts) {
      return reject(new Error("Exceeded max attempts"));
    } else {
      setTimeout(executePoll, interval, resolve, reject);
    }
  };

  return new Promise(executePoll);
}
