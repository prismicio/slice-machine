type AppendDotPathSegment<
	TDotPath extends string,
	TSegment extends string,
> = TDotPath extends "" ? TSegment : `${TDotPath}.${TSegment}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;
type Primitives =
	| null
	| undefined
	| string
	| number
	| boolean
	| symbol
	| bigint
	| AnyFunction;

type AllObjDotPaths<TObj, TDotPath extends string = ""> = TObj extends
	| Primitives
	| unknown[]
	? TDotPath
	: {
			[P in keyof TObj]: P extends string
				?
						| AppendDotPathSegment<TDotPath, P>
						| AllObjDotPaths<TObj[P], AppendDotPathSegment<TDotPath, P>>
				: TDotPath;
	  }[keyof TObj];

type RecursiveOmitNested<
	TObj,
	TOmitPath extends string,
	TDotPath extends string = "",
> = TObj extends Primitives | unknown[]
	? TObj
	: {
			[P in keyof TObj as P extends string
				? AppendDotPathSegment<TDotPath, P> extends TOmitPath
					? never
					: P
				: never]: P extends string
				? RecursiveOmitNested<
						TObj[P],
						TOmitPath,
						AppendDotPathSegment<TDotPath, P>
				  >
				: TObj[P];
	  };

type OnlyProcedures<TProceduresInstance> =
	TProceduresInstance extends AnyFunction
		? TProceduresInstance
		: {
				[P in keyof TProceduresInstance as OnlyProcedures<
					TProceduresInstance[P]
				> extends Exclude<Primitives, AnyFunction> | Record<PropertyKey, never>
					? never
					: P]: OnlyProcedures<TProceduresInstance[P]>;
		  };

type _ProceduresFromInstanceConfig = {
	omit?: readonly string[];
};

const _proceduresFromInstance = <TProceduresInstance>(
	proceduresInstance: TProceduresInstance,
	config: _ProceduresFromInstanceConfig = {},
	path: string[] = [],
): OnlyProcedures<TProceduresInstance> => {
	const omit: readonly string[] = config.omit ?? [];

	const res = {} as OnlyProcedures<TProceduresInstance>;

	if (proceduresInstance) {
		const proto = Object.getPrototypeOf(proceduresInstance);

		const properties = [
			...Object.getOwnPropertyNames(proceduresInstance),
			...(proto ? Object.getOwnPropertyNames(proto) : []),
		];

		for (const key of properties) {
			const value = proceduresInstance[key as keyof typeof proceduresInstance];

			if (key === "constructor" || omit.includes([...path, key].join("."))) {
				continue;
			}

			if (typeof value === "function") {
				res[key as keyof typeof res] = value.bind(proceduresInstance);
			} else if (typeof value === "object") {
				res[key as keyof typeof res] = _proceduresFromInstance(value, config, [
					...path,
					key,
				]) as typeof res[keyof typeof res];
			}
		}
	}

	return res;
};

export type OmittableProcedures<TProceduresInstance> = AllObjDotPaths<
	OnlyProcedures<TProceduresInstance>
>;

export type ProceduresFromInstance<
	TProceduresInstance,
	TOmitPaths extends string,
> = RecursiveOmitNested<OnlyProcedures<TProceduresInstance>, TOmitPaths>;

type ProceduresFromInstanceConfig<
	TProceduresInstance,
	TUnknownOmitPaths extends string,
> = {
	omit?: readonly (
		| TUnknownOmitPaths
		| OmittableProcedures<TProceduresInstance>
	)[];
};

export const proceduresFromInstance = <
	TProceduresInstance,
	TUnknownOmitPaths extends string = never,
>(
	proceduresInstance: TProceduresInstance,
	config: ProceduresFromInstanceConfig<
		TProceduresInstance,
		TUnknownOmitPaths
	> = {},
): ProceduresFromInstance<TProceduresInstance, TUnknownOmitPaths> => {
	return _proceduresFromInstance(
		proceduresInstance,
		config,
	) as ProceduresFromInstance<TProceduresInstance, TUnknownOmitPaths>;
};
