import { SliceMachineInitProcess } from "../../src";
import { PrismicAuthLoginResponse } from "./createPrismicAuthLoginResponse";

export const loginUser = async (
	initProcess: SliceMachineInitProcess,
	response: PrismicAuthLoginResponse,
): Promise<string> => {
	// @ts-expect-error - Accessing protected method
	const manager = initProcess.manager;

	await manager.user.login(response);

	return manager.user.getAuthenticationToken();
};
