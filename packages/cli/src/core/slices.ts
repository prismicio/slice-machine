import type { PrismicManager } from "@prismicio/manager";

import { listrRun } from "../utils/listr";

type SaveSlicesArgs = {
	manager: PrismicManager;
};

export async function saveSlices(args: SaveSlicesArgs): Promise<void> {
	const { manager } = args;

	// Save slices to local directory
	await listrRun([
		{
			title: "Fetching Prismic slices...",
			task: async (_, parentTask) => {
				const slices = await manager.slices.fetchRemoteSlices();

				parentTask.title = "Saving Prismic slices changes...";

				const localSlices = await manager.slices.readAllSlices();

				// Handle slices update
				for (const remoteSlice of slices) {
					const localSlice = localSlices.models.find(
						(local) => local.model.id === remoteSlice.id,
					);
					if (localSlice) {
						await manager.slices.updateSlice({
							libraryID: localSlice.libraryID,
							model: remoteSlice,
						});
					}
				}

				// Handle slices deletion
				for (const localSlice of localSlices.models) {
					const existsRemotely = slices.some(
						(slice) => slice.id === localSlice.model.id,
					);
					if (!existsRemotely) {
						await manager.slices.deleteSlice({
							libraryID: localSlice.libraryID,
							sliceID: localSlice.model.id,
						});
					}
				}

				// Handle slices creation
				const defaultLibraryID = await manager.slices.getDefaultLibraryID();
				for (const remoteSlice of slices) {
					const existsLocally = localSlices.models.some(
						(localSlice) => localSlice.model.id === remoteSlice.id,
					);
					if (!existsLocally) {
						await manager.slices.createSlice({
							libraryID: defaultLibraryID,
							model: remoteSlice,
						});
					}
				}

				parentTask.title = "Prismic slices changes saved";
			},
		},
	]);
}
