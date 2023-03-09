import * as t from "io-ts";
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

const ComponentMocks = t.array(SharedSliceContent);

const createPathToDeprecatedLibrary = (cwd: string) =>
	path.join(cwd, ".slicemachine");
const createPathToSlicesAssets = (cwd: string) =>
	path.join(createPathToDeprecatedLibrary(cwd), "assets", "slices");
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

const migrateMockFile = (
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

		if (rawMockContent === null || !validator(rawMockContent)) {
			const regeneratedMocks = generate();
			fsSync.writeFileSync(
				targetPathToMocks,
				JSON.stringify(regeneratedMocks, null, 2),
			);
		} else {
			fsSync.writeFileSync(targetPathToMocks, rawMockContent);
		}
	} catch (error) {}
};

export const migrate = async (manager: SliceMachineManager) => {
	try {
		const allSlices = await manager.slices.readAllSlices();
		const sharedSlices = allSlices.models.reduce(
			(o, slice) => ({ ...o, [slice.model.id]: slice.model }),
			{},
		);
		allSlices.models.forEach((c) => {
			const targetPathToMocks = path.join(
				manager.cwd,
				c.libraryID,
				c.model.name,
				MOCKS_FILE_NAME,
			);
			const deprecatedPathToMocks = path.join(
				createPathToSlicesAssets(manager.cwd),
				c.libraryID,
				c.model.name,
				MOCKS_FILE_NAME,
			);
			migrateMockFile(
				targetPathToMocks,
				deprecatedPathToMocks,
				(str: string) => ComponentMocks.decode(str)._tag === "Right",
				() => SharedSliceMock.generate(c.model),
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
			migrateMockFile(
				targetPathToMocks,
				deprecatedPathToMocks,
				(str: string) => Document.decode(str)._tag === "Right",
				() => DocumentMock.generate(c.model, sharedSlices),
			);
		});
	} catch (error) {
	} finally {
		safeUnlink(
			path.join(createPathToDeprecatedLibrary(manager.cwd), "assets"),
			"folder",
		);
		safeUnlink(
			path.join(
				createPathToDeprecatedLibrary(manager.cwd),
				MOCK_CONFIG_FILE_NAME,
			),
			"file",
		);
	}
};
