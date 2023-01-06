// This file defines the root `@slicemachine/core` export.
// Non-Node.js-compatible exports should be defined in `./client.ts`.

export type { PrismicRepository } from "./managers/prismicRepository/types";

export { SliceMachineManager } from "./managers/SliceMachineManager";
export { createSliceMachineManager } from "./managers/createSliceMachineManager";
export {
	CreateSliceMachineManagerMiddlewareArgs,
	createSliceMachineManagerMiddleware,
} from "./managers/createSliceMachineManagerMiddleware";

export {
	PrismicAuthManager,
	PrismicUserProfile,
	PrismicAuthState,
} from "./auth/PrismicAuthManager";
export { createPrismicAuthManager } from "./auth/createPrismicAuthManager";
export {
	CreatePrismicAuthManagerMiddlewareArgs,
	PrismicAuthCheckStatusResponse,
	createPrismicAuthManagerMiddleware,
} from "./auth/createPrismicAuthManagerMiddleware";

export { DecodeError } from "./lib/DecodeError";

export type { SliceMachineConfig } from "./types";
