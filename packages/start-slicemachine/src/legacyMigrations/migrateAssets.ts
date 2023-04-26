import * as t from "io-ts";
import * as path from "node:path";
import * as fsSync from "node:fs";

import { SliceMachineManager } from "@slicemachine/manager";
import {
	SharedSliceContent,
	Document,
} from "@prismicio/types-internal/lib/content";

import { DocumentMock, SharedSliceMock } from "@prismicio/mocks";

import * as sentryErrorHandlers from "../lib/sentryErrorHandlers";

const MOCKS_FILE_NAME = "mocks.json";

const SharedSliceContentArray = t.array(SharedSliceContent);
const DocumentArray = t.array(Document);

const createPathToDeprecatedLibrary = (cwd: string) =>
	path.join(cwd, ".slicemachine");
const createPathToCustomTypesAssets = (cwd: string) =>
	path.join(createPathToDeprecatedLibrary(cwd), "assets", "customtypes");

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
			const deprecatedPathToCustomVariation = path.join(
				targetPathToSliceFolder,
				variationID,
			);
			const deprecatedPathToCustomVariationScreenshot = path.join(
				deprecatedPathToCustomVariation,
				"preview.png",
			);
			if (fsSync.existsSync(deprecatedPathToCustomVariationScreenshot)) {
				fsSync.renameSync(
					deprecatedPathToCustomVariationScreenshot,
					targetPathToVariationScreenshot,
				);
				try {
					if (
						fsSync.readdirSync(deprecatedPathToCustomVariation).length === 0
					) {
						fsSync.rmSync(deprecatedPathToCustomVariation, { recursive: true });
					}
				} catch {}
			} else {
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
		}
	});
};

const ensureOrGenerateMockFile = (
	targetPathToMocks: string,
	deprecatedPathToMocks: string,
	validator: (str: string) => boolean,
	generate: () => Record<string, unknown>[],
	isTelemetryEnabled: boolean,
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
	} catch (error) {
		if (isTelemetryEnabled) {
			sentryErrorHandlers.node("migrateAssets.ensureOrGenerateMockFile", error);
		}
	}
};

// TODO: MIGRATION - Move this to the Migration Manager
export const migrateAssets = async (
	manager: SliceMachineManager,
): Promise<void> => {
	const isTelemetryEnabled = await manager.telemetry.checkIsTelemetryEnabled();

	try {
		// Exit early if migration is already performed
		if (
			!fsSync.existsSync(
				path.join(createPathToDeprecatedLibrary(manager.cwd), "assets"),
			)
		) {
			return;
		}

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

			const reGeneratedMocks = c.model.variations.map((variation) => {
				return SharedSliceMock.generate(c.model, {
					variation: variation.id,
					type: "SharedSlice",
				});
			});

			ensureOrGenerateMockFile(
				targetPathToMocks,
				deprecatedPathToMocks,
				(str: string) =>
					SharedSliceContentArray.decode(JSON.parse(str))._tag === "Right",
				() => reGeneratedMocks,
				isTelemetryEnabled,
			);

			const variationsIDs = c.model.variations.map((v) => v.id);
			ensureOrGenerateSliceScreenshot(
				variationsIDs,
				targetPathToSliceFolder,
				deprecatedPathToSliceAssets,
			);
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
				(str: string) => DocumentArray.decode(JSON.parse(str))._tag === "Right",
				() => [DocumentMock.generate(c.model, sharedSlices)],
				isTelemetryEnabled,
			);
		});
	} catch (error) {
		if (isTelemetryEnabled) {
			sentryErrorHandlers.node("migrateAssets", error);
		}
	} finally {
		const dotSlicemachine = createPathToDeprecatedLibrary(manager.cwd);
		const prismicioTypesDTS = path.join(manager.cwd, "prismicio-types.d.ts");
		if (!fsSync.existsSync(prismicioTypesDTS)) {
			const sliceMachinePrismicioDTS = path.join(
				dotSlicemachine,
				"prismicio.d.ts",
			);
			const prismicioDTS = path.join(manager.cwd, "prismicio.d.ts");
			if (fsSync.existsSync(sliceMachinePrismicioDTS)) {
				fsSync.renameSync(sliceMachinePrismicioDTS, prismicioTypesDTS);
			} else if (fsSync.existsSync(prismicioDTS)) {
				fsSync.renameSync(prismicioDTS, prismicioTypesDTS);
			}
		}

		if (fsSync.existsSync(dotSlicemachine)) {
			fsSync.rmSync(dotSlicemachine, { recursive: true });
		}
	}
};
