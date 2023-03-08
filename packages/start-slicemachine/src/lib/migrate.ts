import * as t from "io-ts";
import * as path from "node:path";
import * as fsSync from "node:fs";
import { SliceMachineManager } from "@slicemachine/manager";
import { SharedSliceContent, Document } from "@prismicio/types-internal/lib/content";
import {
	SharedSliceMock,
  } from "@prismicio/mocks";

const MOCKS_FILE_NAME = "mocks.json";
const MOCK_CONFIG_FILE_NAME = "mock-config.json";

const ComponentMocks = t.array(SharedSliceContent);

const createPathToDeprecatedLibrary = (cwd: string) => path.join(cwd, '.slicemachine');
const createPathToSlicesAssets = (cwd: string) => path.join(createPathToDeprecatedLibrary(cwd), 'assets', 'slices');
const createPathToCustomTypesAssets = (cwd: string) => path.join(createPathToDeprecatedLibrary(cwd), 'assets', 'customtypes');

const safeUnlink = (pathToUnlink: string) => {
	try {
		fsSync.unlinkSync(pathToUnlink)
	}
	catch(_) {

	}
}

// const migrateJSONFile = (targetPath, deprecatedPath, decoder) => {

// }

export const migrate = async (manager: SliceMachineManager) => {
	console.log("\n", "migration started!!\n")

	try {
		const allSlices = await manager.slices.readAllSlices(); 
		allSlices.models.forEach((c) => {
			const targetPathToMocks = path.join(manager.cwd, c.libraryID, c.model.name, MOCKS_FILE_NAME);
			const deprecatedPathToMocks = path.join(createPathToSlicesAssets(manager.cwd), c.libraryID, c.model.name, MOCKS_FILE_NAME);
			try {
				const rawMockContent = (() => {
					if (fsSync.existsSync(targetPathToMocks)) {
						return fsSync.readFileSync(targetPathToMocks, 'utf-8');
					}
					if (fsSync.existsSync(deprecatedPathToMocks)) {
						const rawMockContent = fsSync.readFileSync(deprecatedPathToMocks, 'utf-8');
						return rawMockContent;
					}
					return null;
				})();
		
				if (rawMockContent === null || ComponentMocks.decode(rawMockContent)._tag === "Left") {
					const regeneratedMocks = SharedSliceMock.generate(c.model);
					fsSync.writeFileSync(targetPathToMocks, JSON.stringify(regeneratedMocks, null, 2));
				} else {
					fsSync.writeFileSync(targetPathToMocks, rawMockContent);
				}
			} catch(error) {

			}
		});

		const allCustomTypes = await manager.customTypes.readAllCustomTypes();
		console.log({ allCustomTypes })

		// USE Document.decode(...) with same logic
	} catch(error) {

	} finally {
		safeUnlink(path.join(createPathToDeprecatedLibrary(manager.cwd), 'assets'));
		safeUnlink(path.join(createPathToDeprecatedLibrary(manager.cwd), MOCK_CONFIG_FILE_NAME));
	}

	
}

/**
const pathToDeprecatedMocksConfig = path.join(createPathToDeprecatedLibrary(manager.cwd), MOCK_CONFIG_FILE_NAME);
const pathToSliceMockConfig = path.join(manager.cwd, c.libraryID, c.model.name, MOCK_CONFIG_FILE_NAME);
if (fsSync.existsSync(pathToDeprecatedMocksConfig)) {
	fsSync.unlinkSync(pathToDeprecatedMocksConfig)
}
if (fsSync.existsSync(pathToSliceMockConfig)) {
	fsSync.unlinkSync(pathToSliceMockConfig)
}
 */