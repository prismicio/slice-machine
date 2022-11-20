import { Procedure } from "./types";

export type ProceduresFromInstance<TProceduresClass> = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[P in keyof TProceduresClass]: TProceduresClass[P] extends Procedure<any>
		? TProceduresClass[P]
		: ProceduresFromInstance<TProceduresClass[P]>;
};

export const proceduresFromInstance = <TProceduresInstance>(
	proceduresInstance: TProceduresInstance,
): ProceduresFromInstance<TProceduresInstance> => {
	const res = {} as ProceduresFromInstance<TProceduresInstance>;

	const proto = Object.getPrototypeOf(proceduresInstance);

	for (const key of Object.getOwnPropertyNames(proto)) {
		if (key === "constructor") {
			continue;
		}

		const value = proceduresInstance[key as keyof typeof proceduresInstance];

		if (typeof value === "function") {
			res[key as keyof typeof res] = value.bind(proceduresInstance);
		} else if (typeof value === "object") {
			res[key as keyof typeof res] = proceduresFromInstance(
				value,
			) as typeof res[keyof typeof res];
		}
	}

	return res;
};
