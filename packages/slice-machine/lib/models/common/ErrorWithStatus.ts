export default class ErrorWithStatus extends Error {
  constructor(readonly reason: string, readonly status: number) {
    super(reason);
  }
}
