// This file defines the `@slicemachine/core/client` export.
// All exports must be designed for non-Node.js usage.

export {
	CreateSliceMachineManagerClientArgs,
	SliceMachineManagerClient,
	createSliceMachineManagerClient,
} from "./managers/createSliceMachineManagerClient";

export {
	SimulatorManagerReadSliceSimulatorSetupStep,
	SimulatorManagerReadSliceSimulatorSetupStepsReturnType,
} from "./managers/_SimulatorManager";

export { SliceMachineManagerPushSliceReturnType } from "./managers/_SlicesManager";

export {
	InternalError,
	NotFoundError,
	SliceMachineError,
	UnauthenticatedError,
	UnauthorizedError,
	UnexpectedDataError,
	isInternalError,
	isNotFoundError,
	isSliceMachineError,
	isUnauthenticatedError,
	isUnauthorizedError,
	isUnexpectedDataError,
} from "./errors";
