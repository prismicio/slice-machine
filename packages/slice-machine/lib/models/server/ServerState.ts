import AppState from "../common/AppState";
import Warning from "@lib/models/common/Warning";
import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";
import ServerError from "./ServerError";

export interface ConfigErrors {
  [errorKey: string]: ServerError;
}

export default interface ServerState extends AppState {
  clientError?: ErrorWithStatus;
  configErrors: ConfigErrors;
  warnings: ReadonlyArray<Warning>;
}
