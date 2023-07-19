import {
	CustomType,
	SharedSlice,
} from "@prismicio/types-internal/lib/customtypes";
import { SliceLibrary, SliceMachinePlugin } from "@slicemachine/plugin-kit";

import { createTestAdapter } from "./createTestAdapter";

type CreateMemoryAdapterArgs = {
	customTypeModels?: CustomType[];
	sliceLibraries?: (SliceLibrary & { models: SharedSlice[] })[];
};

export function createMemoryAdapter(
	args: CreateMemoryAdapterArgs = {},
): SliceMachinePlugin {
	const customTypeModels: Map<string, CustomType> = new Map(
		args.customTypeModels?.map((model) => [model.id, model]),
	);
	const sliceLibraries: Map<string, Map<string, SharedSlice>> = new Map(
		args.sliceLibraries?.map((library) => [
			library.id,
			new Map(library.models.map((model) => [model.id, model])),
		]),
	);

	return createTestAdapter({
		name: "memory-adapter",
		setup: ({ hook }) => {
			hook("custom-type-library:read", () => {
				return { ids: [...customTypeModels.keys()] };
			});

			hook("custom-type:create", ({ model }) => {
				customTypeModels.set(model.id, model);
			});

			hook("custom-type:read", ({ id }) => {
				const model = customTypeModels.get(id);

				if (!model) {
					throw new Error("Not found");
				}

				return { model };
			});

			hook("custom-type:delete", ({ model }) => {
				customTypeModels.delete(model.id);
			});

			hook("slice-library:read", ({ libraryID }) => {
				return {
					id: libraryID,
					sliceIDs: [...(sliceLibraries.get(libraryID)?.keys() || [])],
				};
			});

			hook("slice:create", ({ libraryID, model }) => {
				if (!sliceLibraries.has(libraryID)) {
					sliceLibraries.set(libraryID, new Map());
				}

				sliceLibraries.get(libraryID)?.set(model.id, model);
			});

			hook("slice:read", ({ libraryID, sliceID }) => {
				const model = sliceLibraries.get(libraryID)?.get(sliceID);

				if (!model) {
					throw new Error("Not found");
				}

				return { model };
			});

			hook("slice:delete", ({ libraryID, model }) => {
				sliceLibraries.get(libraryID)?.delete(model.id);
			});
		},
	});
}
