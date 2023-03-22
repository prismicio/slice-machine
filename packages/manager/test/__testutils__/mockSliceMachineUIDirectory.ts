import fs from "node:fs/promises";
import path from "node:path";
import { TestContext } from "vitest";

export const mockSliceMachineUIDirectory = async (args: {
	ctx: TestContext;
	packageJSON?: Record<string, unknown>;
}): Promise<void> => {
	await fs.mkdir(args.ctx.sliceMachineUIDirectory, { recursive: true });
	await fs.writeFile(
		path.posix.join(args.ctx.sliceMachineUIDirectory, "package.json"),
		JSON.stringify(args.packageJSON ?? {}),
	);
};
