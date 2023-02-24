/**
 * Extends a function arguments with extra ones.
 */
type FnWithExtraArgs<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	F extends (...args: any[]) => any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TExtraArgs extends any[] = any[],
> = (
	...args: [...args: Parameters<F>, ...extraArgs: TExtraArgs]
) => ReturnType<F>;

/**
 * Defines a hook handler.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HookFn<TArgs extends any[] = any[], TReturn = any> = (
	...args: TArgs
) => Promise<TReturn> | TReturn;

/**
 * Generic hook metadata.
 */
type HookMeta = Record<string, unknown>;

/**
 * Defines a hook, including its function handler and optional metadata.
 */
export type Hook<
	THookFn extends HookFn = HookFn,
	THookMeta extends HookMeta = HookMeta,
> = {
	fn: THookFn;
	meta?: THookMeta;
};

/**
 * Represents a map of hook types to hook functions and metas.
 */
type Hooks = Record<string, Hook>;

/**
 * Builds hook meta arguments after hook meta requirements.
 */
type HookMetaArg<THookMeta extends Record<string, unknown> | undefined> =
	THookMeta extends Record<string, unknown>
		? [meta: THookMeta]
		: [meta?: never];

/**
 * Defines the return type of the {@link HookSystem.callHook} functions.
 *
 * @internal
 */
export type CallHookReturnType<THookFn extends HookFn = HookFn> = Promise<{
	data: Awaited<ReturnType<THookFn>>[];
	errors: HookError[];
}>;

/**
 * Defines the return type of the {@link HookSystem.createScope} functions.
 *
 * @internal
 */
export type CreateScopeReturnType<
	THooks extends Hooks = Record<string, { fn: HookFn }>,
	TExtraArgs extends unknown[] = never[],
> = {
	hook: <TType extends keyof THooks>(
		type: TType,
		hookFn: FnWithExtraArgs<THooks[TType]["fn"], TExtraArgs>,
		...[meta]: HookMetaArg<THooks[TType]["meta"]>
	) => void;
	unhook: HookSystem<{
		[P in keyof THooks]: Omit<THooks[P], "fn"> & {
			fn: FnWithExtraArgs<THooks[P]["fn"], TExtraArgs>;
		};
	}>["unhook"];
};

type RegisteredHookMeta = {
	id: string;
	type: string;
	owner: string;
	external?: HookFn;
};

/**
 * Represents a registered hook.
 */
type RegisteredHook<THook extends Hook = Hook> = {
	fn: THook["fn"];
	meta: THook["meta"] extends Record<string, unknown>
		? RegisteredHookMeta & THook["meta"]
		: RegisteredHookMeta;
};

export class HookError<TError = Error | unknown> extends Error {
	type: string;
	owner: string;
	rawMeta: RegisteredHookMeta;
	rawCause: TError;

	constructor(meta: RegisteredHookMeta, cause: TError) {
		super(
			`Error in \`${meta.owner}\` during \`${meta.type}\` hook: ${
				cause instanceof Error ? cause.message : String(cause)
			}`,
		);

		this.type = meta.type;
		this.owner = meta.owner;
		this.rawMeta = meta;
		this.rawCause = cause;
		this.cause = cause instanceof Error ? cause : undefined;
	}
}

const uuid = (): string => {
	return (++uuid.i).toString();
};
uuid.i = 0;

/**
 * @internal
 */
export class HookSystem<THooks extends Hooks = Hooks> {
	private _registeredHooks: {
		[K in keyof THooks]?: RegisteredHook<THooks[K]>[];
	} = {};

	hook<TType extends keyof THooks>(
		owner: string,
		type: TType,
		hookFn: THooks[TType]["fn"],
		...[meta]: HookMetaArg<THooks[TType]["meta"]>
	): void {
		const registeredHook = {
			fn: hookFn,
			meta: {
				...meta,
				owner,
				type,
				id: uuid(),
			},
		} as RegisteredHook<THooks[TType]>;

		const registeredHooksForType = this._registeredHooks[type];

		if (registeredHooksForType) {
			registeredHooksForType.push(registeredHook);
		} else {
			this._registeredHooks[type] = [registeredHook];
		}
	}

	unhook<TType extends keyof THooks>(
		type: TType,
		hookFn: THooks[TType]["fn"],
	): void {
		this._registeredHooks[type] = this._registeredHooks[type]?.filter(
			(registeredHook) => registeredHook.fn !== hookFn,
		);
	}

	async callHook<TType extends Extract<keyof THooks, string>>(
		typeOrTypeAndHookID: TType | { type: TType; hookID: string },
		...args: Parameters<THooks[TType]["fn"]>
	): CallHookReturnType<THooks[TType]["fn"]> {
		let hooks: RegisteredHook<THooks[TType]>[];

		if (typeof typeOrTypeAndHookID === "string") {
			hooks = this._registeredHooks[typeOrTypeAndHookID] ?? [];
		} else {
			const hookForID = this._registeredHooks[typeOrTypeAndHookID.type]?.find(
				(hook) => hook.meta.id === typeOrTypeAndHookID.hookID,
			);

			if (hookForID) {
				hooks = [hookForID];
			} else {
				throw new Error(
					`Hook of type \`${typeOrTypeAndHookID.type}\` with ID \`${typeOrTypeAndHookID.hookID}\` not found.`,
				);
			}
		}

		const promises = hooks.map(async (hook) => {
			try {
				return await hook.fn(...args);
			} catch (error) {
				throw new HookError(hook.meta, error);
			}
		});

		const settledPromises = await Promise.allSettled(promises);

		return settledPromises.reduce<{
			data: Awaited<ReturnType<THooks[TType]["fn"]>>[];
			errors: HookError[];
		}>(
			(acc, settledPromise) => {
				if (settledPromise.status === "fulfilled") {
					acc.data.push(settledPromise.value);
				} else {
					acc.errors.push(settledPromise.reason);
				}

				return acc;
			},
			{ data: [], errors: [] },
		);
	}

	/**
	 * Returns list of hooks for a given owner
	 */
	hooksForOwner(owner: string): RegisteredHook<THooks[string]>[] {
		const hooks: RegisteredHook<THooks[string]>[] = [];

		for (const hookType in this._registeredHooks) {
			const registeredHooks = this._registeredHooks[hookType];

			if (Array.isArray(registeredHooks)) {
				for (const registeredHook of registeredHooks) {
					if (registeredHook.meta.owner === owner) {
						hooks.push(registeredHook);
					}
				}
			}
		}

		return hooks;
	}

	/**
	 * Returns list of hooks for a given type
	 */
	hooksForType<TType extends keyof THooks>(
		type: TType,
	): RegisteredHook<THooks[TType]>[] {
		return this._registeredHooks[type] ?? [];
	}

	createScope<TExtraArgs extends unknown[] = never[]>(
		owner: string,
		extraArgs: [...TExtraArgs],
	): CreateScopeReturnType<THooks, TExtraArgs> {
		return {
			hook: (type, hookFn, ...[meta]) => {
				const internalHook = ((
					...args: Parameters<THooks[typeof type]["fn"]>
				) => {
					return hookFn(...args, ...extraArgs);
				}) as THooks[typeof type]["fn"];

				const resolvedMeta = {
					...meta,
					external: hookFn,
				} as HookMetaArg<THooks[typeof type]["meta"]>[0];

				return this.hook(
					owner,
					type,
					internalHook,
					// @ts-expect-error - TypeScript fails to assert rest argument.
					resolvedMeta,
				);
			},
			unhook: (type, hookFn) => {
				this._registeredHooks[type] = this._registeredHooks[type]?.filter(
					(registeredHook) => registeredHook.meta.external !== hookFn,
				);
			},
		};
	}
}
