import { createSliceMachineManager } from "@slicemachine/core2";

async function run(): Promise<void> {
  console.time("createSliceMachineManager");
  const manager = createSliceMachineManager();
  console.timeEnd("createSliceMachineManager");

  console.time("initPlugins");
  await manager.initPlugins();
  console.timeEnd("initPlugins");

  // const library = await manager.readSliceLibrary({ libraryID: "./slices" });
  console.time("readAllSlices");
  const allSlices = await manager.readAllSlices();
  console.timeEnd("readAllSlices");

  console.log({ allSlices });
}

export default async function start(): Promise<void> {
  try {
    await run();
  } catch (error) {
    console.error(`[slice-machine] An unexpected error occurred. Exiting...`);
    console.error("Full error: ", error);
  }
}
