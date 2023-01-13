import { SpyInstance, vi } from "vitest";

import type { SliceMachineManager } from "@slicemachine/manager";

import { SliceMachineInitProcess } from "../../src/SliceMachineInitProcess";

type SpiedObject<TObject extends object> = {
	[key in keyof TObject]: TObject[key] extends ((
		...args: infer Args extends unknown[]
	) => infer Returns extends unknown)
		? SpyInstance<Args, Returns>
		: TObject[key];
};

const spyObject = <TObject extends object>(
	object: TObject,
): SpiedObject<TObject> => {
	const spiedObject = {} as SpiedObject<TObject>;

	(
		[
			...Object.getOwnPropertyNames(object),
			...Object.getOwnPropertyNames(Object.getPrototypeOf(object)),
		] as (keyof TObject)[]
	).forEach((key) => {
		const value = object[key];
		// TODO: Took some TypeScript shortcut because getting types fully right was annoying
		if (typeof value === "function") {
			spiedObject[key] = vi.spyOn(
				object,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				key as any,
			) as SpiedObject<TObject>[typeof key];
		} else {
			spiedObject[key] = value as SpiedObject<TObject>[typeof key];
		}
	});

	return spiedObject;
};

export const spyManager = (
	initProcess: SliceMachineInitProcess,
): {
	telemetry: SpiedObject<SliceMachineManager["telemetry"]>;
	user: SpiedObject<SliceMachineManager["user"]>;
	prismicRepository: SpiedObject<SliceMachineManager["prismicRepository"]>;
	slices: SpiedObject<SliceMachineManager["slices"]>;
	customTypes: SpiedObject<SliceMachineManager["customTypes"]>;
} => {
	// @ts-expect-error - Accessing protected method
	const manager = initProcess.manager;

	return {
		telemetry: spyObject(manager.telemetry),
		user: spyObject(manager.user),
		prismicRepository: spyObject(manager.prismicRepository),
		slices: spyObject(manager.slices),
		customTypes: spyObject(manager.customTypes),
	};
};
