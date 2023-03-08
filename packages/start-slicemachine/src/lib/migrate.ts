import { SliceMachineManager } from "@slicemachine/manager";

export const migrate = async (manager: SliceMachineManager) => {
	console.log("\n", "migration started!!\n")


	const res = await manager.project.loadSliceMachineConfig();
	console.log({ res })
}