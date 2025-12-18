import { readFile, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

export interface SliceMachineConfig {
  repositoryName: string;
  adapter: string;
  libraries: string[];
  localSliceSimulatorURL?: string;
  agentInitialized?: boolean;
}

export async function checkProjectInitialized(cwd: string): Promise<boolean> {
  try {
    const config = await readSliceMachineConfig(cwd);
    return config.agentInitialized === true;
  } catch {
    return false;
  }
}

export async function readSliceMachineConfig(
  cwd: string,
): Promise<SliceMachineConfig> {
  const configPath = join(cwd, "slicemachine.config.json");
  const contents = await readFile(configPath, "utf8");
  return JSON.parse(contents);
}

export async function writeSliceMachineConfig(
  cwd: string,
  config: SliceMachineConfig,
): Promise<void> {
  const configPath = join(cwd, "slicemachine.config.json");
  await writeFile(configPath, JSON.stringify(config, null, 2) + "\n", "utf8");
}

export async function configExists(cwd: string): Promise<boolean> {
  try {
    const configPath = join(cwd, "slicemachine.config.json");
    await access(configPath);
    return true;
  } catch {
    return false;
  }
}
