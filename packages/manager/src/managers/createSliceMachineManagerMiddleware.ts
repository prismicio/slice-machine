import {
	ExtractProcedures,
	OmittableProcedures,
	ProceduresFromInstance,
	RPCMiddleware,
	createRPCMiddleware,
	proceduresFromInstance,
	OnErrorEventHandler,
} from "r19";

import { SliceMachineManager } from "./SliceMachineManager";

const defineOmits = <TObj>() => {
	// TODO: Change this to a nicer API. Maybe return an object with a named method (e.g. `compute`)

	return <TOmitPaths extends string>(
		omit: readonly TOmitPaths[] | readonly OmittableProcedures<TObj>[],
	): readonly Extract<TOmitPaths, OmittableProcedures<TObj>>[] => {
		return omit as readonly Extract<TOmitPaths, OmittableProcedures<TObj>>[];
	};
};

// TODO: Support wildcard omits that support "*._sliceMachineManager"
const omitProcedures = defineOmits<SliceMachineManager>()([
	"_sliceMachinePluginRunner",
	"_prismicAuthManager",

	"customTypes._sliceMachineManager",
	"plugins._sliceMachineManager",
	"prismicRepository._sliceMachineManager",
	"project._sliceMachineManager",
	"screenshots._sliceMachineManager",
	"simulator._sliceMachineManager",
	"slices._sliceMachineManager",
	"snippets._sliceMachineManager",
	"telemetry._sliceMachineManager",
	"user._sliceMachineManager",
	"versions._sliceMachineManager",
	"documentation._sliceMachineManager",
	"sliceTemplateLibrary._sliceMachineManager",
	"getSliceMachinePluginRunner",
	"getPrismicAuthManager",
	"screenshots.browserContext",
]);

export type SliceMachineManagerMiddleware = RPCMiddleware<
	ProceduresFromInstance<SliceMachineManager, (typeof omitProcedures)[number]>
>;

export type SliceMachineManagerProcedures =
	ExtractProcedures<SliceMachineManagerMiddleware>;

type GetSliceMachineManagerProceduresArgs = {
	sliceMachineManager: SliceMachineManager;
};

export const getSliceMachineManagerProcedures = (
	args: GetSliceMachineManagerProceduresArgs,
): SliceMachineManagerProcedures => {
	return proceduresFromInstance(args.sliceMachineManager, {
		omit: omitProcedures,
	});
};

export type CreateSliceMachineManagerMiddlewareArgs = {
	sliceMachineManager: SliceMachineManager;
	onError?: OnErrorEventHandler;
};

export const createSliceMachineManagerMiddleware = (
	args: CreateSliceMachineManagerMiddlewareArgs,
): SliceMachineManagerMiddleware => {
	return createRPCMiddleware({
		procedures: getSliceMachineManagerProcedures({
			sliceMachineManager: args.sliceMachineManager,
		}),
		onError: args.onError,
	});
};
