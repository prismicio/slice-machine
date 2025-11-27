import {
	ExtractProcedures,
	OmittableProcedures,
	ProceduresFromInstance,
	RPCMiddleware,
	createRPCMiddleware,
	proceduresFromInstance,
	OnErrorEventHandler,
} from "r19";

import { PrismicManager } from "./PrismicManager";

const defineOmits = <TObj>() => {
	// TODO: Change this to a nicer API. Maybe return an object with a named method (e.g. `compute`)

	return <TOmitPaths extends string>(
		omit: readonly TOmitPaths[] | readonly OmittableProcedures<TObj>[],
	): readonly Extract<TOmitPaths, OmittableProcedures<TObj>>[] => {
		return omit as readonly Extract<TOmitPaths, OmittableProcedures<TObj>>[];
	};
};

// TODO: Support wildcard omits that support "*._prismicManager"
const omitProcedures = defineOmits<PrismicManager>()([
	"_pluginSystemRunner",
	"_prismicAuthManager",

	"customTypes._prismicManager",
	"plugins._prismicManager",
	"prismicRepository._prismicManager",
	"project._prismicManager",
	"screenshots._prismicManager",
	"slices._prismicManager",
	"snippets._prismicManager",
	"telemetry._prismicManager",
	"user._prismicManager",
	"versions._prismicManager",
	"getPluginSystemRunner",
	"getPrismicAuthManager",
]);

export type PrismicManagerMiddleware = RPCMiddleware<
	ProceduresFromInstance<PrismicManager, (typeof omitProcedures)[number]>
>;

export type PrismicManagerProcedures =
	ExtractProcedures<PrismicManagerMiddleware>;

type GetPrismicManagerProceduresArgs = {
	prismicManager: PrismicManager;
};

export const getPrismicManagerProcedures = (
	args: GetPrismicManagerProceduresArgs,
): PrismicManagerProcedures => {
	return proceduresFromInstance(args.prismicManager, {
		omit: omitProcedures,
	});
};

export type CreatePrismicManagerMiddlewareArgs = {
	prismicManager: PrismicManager;
	onError?: OnErrorEventHandler;
};

export const createPrismicManagerMiddleware = (
	args: CreatePrismicManagerMiddlewareArgs,
): PrismicManagerMiddleware => {
	return createRPCMiddleware({
		procedures: getPrismicManagerProcedures({
			prismicManager: args.prismicManager,
		}),
		onError: args.onError,
	});
};
