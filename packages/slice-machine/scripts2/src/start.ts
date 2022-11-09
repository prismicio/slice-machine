import { createSliceMachineManager } from "@slicemachine/core2";

async function run(): Promise<void> {
  const manager = createSliceMachineManager();

  const sliceMachineConfig = await manager.getSliceMachineConfig();

  console.log({ sliceMachineConfig });
}

export default async function start(): Promise<void> {
  try {
    await run();
  } catch (error) {
    console.error(`[slice-machine] An unexpected error occurred. Exiting...`);
    console.error("Full error: ", error);
  }
}
