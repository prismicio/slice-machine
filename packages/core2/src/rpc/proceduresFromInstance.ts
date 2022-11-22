import { Procedure } from "./types";

// TODO: Omitted property names are not omitted from types, only the runtime
// implementation.
export type ProceduresFromInstance<TProceduresInstance> = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[P in keyof TProceduresInstance]: TProceduresInstance[P] extends Procedure<any>
		? TProceduresInstance[P]
		: ProceduresFromInstance<TProceduresInstance[P]>;
};

type ProceduresFromInstanceConfig = {
	omit?: unknown[];
};

export const proceduresFromInstance = <TProceduresInstance>(
	proceduresInstance: TProceduresInstance,
	config: ProceduresFromInstanceConfig = {},
): ProceduresFromInstance<TProceduresInstance> => {
	const res = {} as ProceduresFromInstance<TProceduresInstance>;

	const proto = Object.getPrototypeOf(proceduresInstance);

	const properties = [
		...Object.getOwnPropertyNames(proceduresInstance),
		...Object.getOwnPropertyNames(proto),
	];

	for (const key of properties) {
		const value = proceduresInstance[key as keyof typeof proceduresInstance];

		if (key === "constructor" || config.omit?.includes(value)) {
			continue;
		}

		if (typeof value === "function") {
			res[key as keyof typeof res] = value.bind(proceduresInstance);
		} else if (typeof value === "object") {
			res[key as keyof typeof res] = proceduresFromInstance(
				value,
				config,
			) as typeof res[keyof typeof res];
		}
	}

	return res;
};
