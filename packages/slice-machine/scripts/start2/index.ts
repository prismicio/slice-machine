import { createSliceMachineManager } from "@slicemachine/core2";

async function run(): Promise<void> {
  const manager = createSliceMachineManager();

  const projectRoot = await manager.getProjectRoot();

  console.log({ projectRoot });
}

export default async function start(): Promise<void> {
  try {
    await run();
  } catch (error) {
    console.error(`[slice-machine] An unexpected error occurred. Exiting...`);
    console.error("Full error: ", error);
  }
}
