import fs from "node:fs/promises";
import path from "node:path";
import { TestContext } from "vitest";
import { MOCK_BASE_DIRECTORY } from "../__setup__";

export const mockAdapterDirectory = async (args: {
	ctx: TestContext;
	packageJSON?: Record<string, unknown>;
	adapterName: string;
}): Promise<void> => {
	const mockAdapterDirectory = path.dirname(
		`${MOCK_BASE_DIRECTORY}/${args.adapterName}/package.json`,
	);

	await fs.mkdir(mockAdapterDirectory, { recursive: true });
	await fs.writeFile(
		path.posix.join(mockAdapterDirectory, "package.json"),
		JSON.stringify(args.packageJSON ?? {}),
	);
};
