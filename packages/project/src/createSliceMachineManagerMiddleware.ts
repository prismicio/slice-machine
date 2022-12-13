import {
	ProceduresFromInstance,
	RPCMiddleware,
	proceduresFromInstance,
	createRPCMiddleware,
	OmittableProcedures,
} from "@slicemachine/rpc";

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

	"project._sliceMachineManager",
	"plugins._sliceMachineManager",
	"slices._sliceMachineManager",
	"customTypes._sliceMachineManager",
	"snippets._sliceMachineManager",
	"screenshots._sliceMachineManager",
	"simulator._sliceMachineManager",
	"user._sliceMachineManager",
	"versions._sliceMachineManager",

	"getSliceMachinePluginRunner",
	"getPrismicAuthManager",
	"screenshots.browserContext",
]);

export type SliceMachineManagerMiddleware = RPCMiddleware<
	ProceduresFromInstance<SliceMachineManager, typeof omitProcedures[number]>
>;

export type CreateSliceMachineManagerMiddlewareArgs = {
	sliceMachineManager: SliceMachineManager;
};

export const createSliceMachineManagerMiddleware = (
	args: CreateSliceMachineManagerMiddlewareArgs,
): SliceMachineManagerMiddleware => {
	return createRPCMiddleware({
		procedures: proceduresFromInstance(args.sliceMachineManager, {
			omit: omitProcedures,
		}),
	});
};
