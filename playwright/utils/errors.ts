export class SliceMachineError extends Error {
  override name = "SMSliceMachineError";
}

export class UnauthenticatedError extends SliceMachineError {
  override name = "SMUnauthenticatedError";
}

export class UnauthorizedError extends SliceMachineError {
  override name = "SMUnauthorizedError";
}
