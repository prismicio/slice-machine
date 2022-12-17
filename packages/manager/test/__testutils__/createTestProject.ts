import * as path from "node:path";
import * as os from "node:os";

import type { SliceMachinePlugin } from "@slicemachine/plugin-kit";
import * as memfs from "memfs";

import { SliceMachineConfig } from "../../src/types";

const fs = memfs.fs.promises;

export const createTestProject = async (
	sliceMachineConfig: Omit<Partial<SliceMachineConfig>, "adapter"> & {
		adapter?: string | SliceMachinePlugin;
	} = {},
): Promise<string> => {
	await fs.mkdir(os.tmpdir(), { recursive: true });

	const root = (await fs.mkdtemp(path.join(os.tmpdir(), "project-"))) as string;

	await fs.writeFile(path.join(root, "package.json"), JSON.stringify({}));

	const adapterName =
		typeof sliceMachineConfig.adapter === "string"
			? sliceMachineConfig.adapter
			: sliceMachineConfig.adapter?.meta.name;

	await fs.writeFile(
		path.join(root, "slicemachine.config.json"),
		JSON.stringify({
			_latest: "0.0.0",
			repositoryName: "qwerty",
			...sliceMachineConfig,
			adapter: adapterName,
		}),
	);

	return root;
};
