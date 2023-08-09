import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

import { SliceMachineConfig, SliceMachineProject } from "../../src";

export const createSliceMachineProject = async (
	config: Pick<SliceMachineConfig, "adapter"> & Partial<SliceMachineConfig>,
): Promise<SliceMachineProject> => {
	await fs.mkdir(os.tmpdir(), { recursive: true });

	const root = await fs.mkdtemp(path.join(os.tmpdir()));

	await fs.writeFile(path.join(root, "package.json"), JSON.stringify({}));

	return {
		root,
		config: {
			repositoryName: "qwerty",
			apiEndpoint: "https://qwerty.cdn.prismic.io/api/v2",
			...config,
		},
	};
};
