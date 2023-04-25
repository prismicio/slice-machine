import { expect } from "vitest";
import { SliceMachineConfig } from "@slicemachine/manager";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";
import type { SliceMachinePlugin } from "@slicemachine/plugin-kit";

const sha1 = (data: crypto.BinaryLike): string => {
  return crypto.createHash("sha1").update(data).digest("hex");
};

export const createTestProject = async (
  sliceMachineConfig: Omit<
    Partial<SliceMachineConfig>,
    "adapter" | "plugins"
  > & {
    adapter?: string | SliceMachinePlugin;
    plugins?: (string | SliceMachinePlugin)[];
  } = {}
): Promise<string> => {
  const state = expect.getState();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const testNameDigest = sha1(state.currentTestName!);

  await fs.mkdir(os.tmpdir(), { recursive: true });

  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), `project-${testNameDigest}-`)
  );

  await fs.writeFile(path.join(root, "package.json"), JSON.stringify({}));

  const adapterName =
    typeof sliceMachineConfig.adapter === "string"
      ? sliceMachineConfig.adapter
      : sliceMachineConfig.adapter?.meta.name;

  const plugins = (sliceMachineConfig.plugins || []).map((plugin) => {
    return typeof plugin === "string" ? plugin : plugin.meta.name;
  });

  await fs.writeFile(
    path.join(root, "slicemachine.config.json"),
    JSON.stringify({
      repositoryName: `test-repo-${testNameDigest}`,
      ...sliceMachineConfig,
      adapter: adapterName,
      plugins,
    })
  );

  return root;
};
