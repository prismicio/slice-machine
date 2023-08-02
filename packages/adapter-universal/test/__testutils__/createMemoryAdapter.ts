import { Buffer } from "node:buffer";
import {
	CustomType,
	SharedSlice,
} from "@prismicio/types-internal/lib/customtypes";
import {
	defineSliceMachinePlugin,
	SliceMachinePlugin,
} from "@slicemachine/plugin-kit";

type CreateMemoryAdapterArgs = {
	customTypeModels?: CustomType[];
	sliceLibraries?: { id: string; models: SharedSlice[] }[];
};

export function createMemoryAdapter(
	args: CreateMemoryAdapterArgs = {},
): SliceMachinePlugin {
	const customTypeModels: Map<
		string, // Custom type ID
		{
			model: CustomType;
			assets: Map<
				string, // Slice asset ID
				Buffer
			>;
		}
	> = new Map(
		args.customTypeModels?.map((model) => [
			model.id,
			{ model, assets: new Map() },
		]),
	);

	const sliceLibraries: Map<
		string, // Slice library ID
		Map<
			string, // Slice ID
			{
				model: SharedSlice;
				assets: Map<
					string, // Slice asset ID
					Buffer
				>;
			}
		>
	> = new Map(
		args.sliceLibraries?.map((library) => [
			library.id,
			new Map(
				library.models.map((model) => [
					model.id,
					{
						model,
						assets: new Map(),
					},
				]),
			),
		]),
	);

	return defineSliceMachinePlugin({
		meta: {
			name: "slicemachine-adapter-memory",
		},
		setup: ({ hook }) => {
			///////////////////////////////////////////////////////
			// custom-type-library:*
			///////////////////////////////////////////////////////

			hook("custom-type-library:read", () => {
				return { ids: [...customTypeModels.keys()] };
			});

			///////////////////////////////////////////////////////
			// custom-type:*
			///////////////////////////////////////////////////////

			hook("custom-type:create", ({ model }) => {
				customTypeModels.set(model.id, {
					model,
					assets: new Map(),
				});
			});
			hook("custom-type:read", ({ id }) => {
				const model = customTypeModels.get(id);

				if (!model) {
					throw new Error("Not found");
				}

				return { model: model.model };
			});
			hook("custom-type:update", ({ model }) => {
				const customType = customTypeModels.get(model.id);

				if (!customType) {
					throw new Error("Not found");
				}

				customType.model = model;
			});
			hook("custom-type:rename", ({ model }) => {
				const customType = customTypeModels.get(model.id);

				if (!customType) {
					throw new Error("Not found");
				}

				customType.model = model;
			});
			hook("custom-type:delete", ({ model }) => {
				customTypeModels.delete(model.id);
			});
			hook("custom-type:asset:update", ({ customTypeID, asset }) => {
				customTypeModels.get(customTypeID)?.assets.set(asset.id, asset.data);
			});
			hook("custom-type:asset:read", ({ customTypeID, assetID }) => {
				const data = customTypeModels.get(customTypeID)?.assets.get(assetID);

				if (!data) {
					throw new Error("Not found");
				}

				return { data };
			});
			hook("custom-type:asset:delete", ({ customTypeID, assetID }) => {
				customTypeModels.get(customTypeID)?.assets.delete(assetID);
			});

			///////////////////////////////////////////////////////
			// slice-library:*
			///////////////////////////////////////////////////////

			hook("slice-library:read", ({ libraryID }) => {
				return {
					id: libraryID,
					sliceIDs: [...(sliceLibraries.get(libraryID)?.keys() || [])],
				};
			});

			///////////////////////////////////////////////////////
			// slice:*
			///////////////////////////////////////////////////////

			hook("slice:create", ({ libraryID, model }) => {
				if (!sliceLibraries.has(libraryID)) {
					sliceLibraries.set(libraryID, new Map());
				}

				sliceLibraries.get(libraryID)?.set(model.id, {
					model,
					assets: new Map(),
				});
			});
			hook("slice:read", ({ libraryID, sliceID }) => {
				const model = sliceLibraries.get(libraryID)?.get(sliceID);

				if (!model) {
					throw new Error("Not found");
				}

				return { model: model.model };
			});
			hook("slice:update", ({ libraryID, model }) => {
				const slice = sliceLibraries.get(libraryID)?.get(model.id);

				if (!slice) {
					throw new Error("Not found");
				}

				slice.model = model;
			});
			hook("slice:rename", ({ libraryID, model }) => {
				const slice = sliceLibraries.get(libraryID)?.get(model.id);

				if (!slice) {
					throw new Error("Not found");
				}

				slice.model = model;
			});
			hook("slice:delete", ({ libraryID, model }) => {
				sliceLibraries.get(libraryID)?.delete(model.id);
			});
			hook("slice:asset:update", ({ libraryID, sliceID, asset }) => {
				sliceLibraries
					.get(libraryID)
					?.get(sliceID)
					?.assets.set(asset.id, asset.data);
			});
			hook("slice:asset:read", ({ libraryID, sliceID, assetID }) => {
				const data = sliceLibraries
					.get(libraryID)
					?.get(sliceID)
					?.assets.get(assetID);

				if (!data) {
					throw new Error("Not found");
				}

				return { data };
			});
			hook("slice:asset:delete", ({ libraryID, sliceID, assetID }) => {
				sliceLibraries.get(libraryID)?.get(sliceID)?.assets.delete(assetID);
			});
		},
	});
}
