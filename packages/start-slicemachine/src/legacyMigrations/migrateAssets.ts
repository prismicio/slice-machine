import * as path from "node:path";
import * as fsSync from "node:fs";
import { SliceMachineManager } from "@slicemachine/manager";
import {
	SharedSliceContent,
	Document,
} from "@prismicio/types-internal/lib/content";
import { DocumentMock, SharedSliceMock } from "@prismicio/mocks";

const MOCKS_FILE_NAME = "mocks.json";
const MOCK_CONFIG_FILE_NAME = "mock-config.json";

const createPathToDeprecatedLibrary = (cwd: string) =>
	path.join(cwd, ".slicemachine");
const createPathToCustomTypesAssets = (cwd: string) =>
	path.join(createPathToDeprecatedLibrary(cwd), "assets", "customtypes");

const safeUnlink = (pathToUnlink: string, type: "file" | "folder") => {
	try {
		if (type === "file") {
			fsSync.unlinkSync(pathToUnlink);
		} else {
			fsSync.rmSync(pathToUnlink, { recursive: true });
		}
	} catch (_) {}
};

const ensureOrGenerateSliceScreenshot = (
	variationsIDs: string[],
	targetPathToSliceFolder: string,
	deprecatedPathToSliceAssets: string,
) => {
	variationsIDs.forEach((variationID) => {
		const targetPathToVariationScreenshot = path.join(
			targetPathToSliceFolder,
			`screenshot-${variationID}.png`,
		);
		if (!fsSync.existsSync(targetPathToVariationScreenshot)) {
			const deprecatedPathToVariationScreenshot = path.join(
				deprecatedPathToSliceAssets,
				variationID,
				"preview.png",
			);
			if (fsSync.existsSync(deprecatedPathToVariationScreenshot)) {
				fsSync.renameSync(
					deprecatedPathToVariationScreenshot,
					targetPathToVariationScreenshot,
				);
			}
		}
	});
};

const ensureOrGenerateMockFile = (
	targetPathToMocks: string,
	deprecatedPathToMocks: string,
	validator: (str: string) => boolean,
	generate: () => Record<string, unknown>,
) => {
	try {
		const rawMockContent = (() => {
			if (fsSync.existsSync(targetPathToMocks)) {
				return fsSync.readFileSync(targetPathToMocks, "utf-8");
			}
			if (fsSync.existsSync(deprecatedPathToMocks)) {
				return fsSync.readFileSync(deprecatedPathToMocks, "utf-8");
			}

			return null;
		})();

		const regeneratedMocksString = JSON.stringify(generate(), null, 2);
		const isValidMock = (() => {
			try {
				return rawMockContent !== null && validator(rawMockContent);
			} catch {
				return false;
			}
		})();

		if (!isValidMock) {
			fsSync.writeFileSync(targetPathToMocks, regeneratedMocksString);
		} else if (rawMockContent) {
			fsSync.writeFileSync(targetPathToMocks, rawMockContent);
		} else {
			fsSync.writeFileSync(targetPathToMocks, regeneratedMocksString);
		}
	} catch (error) {}
};

// TODO: MIGRATION - Move this to the Migration Manager
export const migrateAssets = async (
	manager: SliceMachineManager,
): Promise<void> => {
	try {
		const allSlices = await manager.slices.readAllSlices();
		const sharedSlices = allSlices.models.reduce(
			(o, slice) => ({ ...o, [slice.model.id]: slice.model }),
			{},
		);

		allSlices.models.forEach((c) => {
			const targetPathToSliceFolder = path.join(
				manager.cwd,
				c.libraryID,
				c.model.name,
			);
			const targetPathToMocks = path.join(
				targetPathToSliceFolder,
				MOCKS_FILE_NAME,
			);
			const deprecatedPathToSliceAssets = path.join(
				createPathToDeprecatedLibrary(manager.cwd),
				"assets",
				c.libraryID,
				c.model.name,
			);
			const deprecatedPathToMocks = path.join(
				deprecatedPathToSliceAssets,
				MOCKS_FILE_NAME,
			);

			ensureOrGenerateMockFile(
				targetPathToMocks,
				deprecatedPathToMocks,
				(str: string) =>
					SharedSliceContent.decode(JSON.parse(str))._tag === "Right",
				() => SharedSliceMock.generate(c.model),
			);

			const variationsIDs = c.model.variations.map((v) => v.id);
			ensureOrGenerateSliceScreenshot(
				variationsIDs,
				targetPathToSliceFolder,
				deprecatedPathToSliceAssets,
			);
			safeUnlink(deprecatedPathToMocks, "file");
		});

		const allCustomTypes = await manager.customTypes.readAllCustomTypes();
		allCustomTypes.models.forEach((c) => {
			const targetPathToMocks = path.join(
				manager.cwd,
				"customtypes",
				c.model.id,
				MOCKS_FILE_NAME,
			);
			const deprecatedPathToMocks = path.join(
				createPathToCustomTypesAssets(manager.cwd),
				c.model.id,
				MOCKS_FILE_NAME,
			);
			ensureOrGenerateMockFile(
				targetPathToMocks,
				deprecatedPathToMocks,
				(str: string) => Document.decode(JSON.parse(str))._tag === "Right",
				() => DocumentMock.generate(c.model, sharedSlices),
			);
		});
	} catch (error) {
	} finally {
		safeUnlink(
			path.join(
				createPathToDeprecatedLibrary(manager.cwd),
				MOCK_CONFIG_FILE_NAME,
			),
			"file",
		);
		safeUnlink(
			path.join(createPathToDeprecatedLibrary(manager.cwd), "assets"),
			"folder",
		);
	}
};
