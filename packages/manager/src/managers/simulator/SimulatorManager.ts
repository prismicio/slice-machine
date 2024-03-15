import fetch from "../../lib/fetch";

import { UnexpectedDataError } from "../../errors";

import { BaseManager } from "../BaseManager";

export class SimulatorManager extends BaseManager {
	async getLocalSliceSimulatorURL(): Promise<string | undefined> {
		const sliceMachineConfig = await this.project.getSliceMachineConfig();

		return sliceMachineConfig.localSliceSimulatorURL;
	}

	/**
	 * @throws {@link UnexpectedDataError} Thrown if the project is not configured
	 *   with a Slice Simulator URL.
	 */
	async checkIsLocalSliceSimulatorURLAccessible(): Promise<boolean> {
		const localSliceSimulatorURL = await this.getLocalSliceSimulatorURL();

		if (!localSliceSimulatorURL) {
			throw new UnexpectedDataError(
				"The project has not been configured with a Slice Simulator URL. Add a `localSliceSimulatorURL` property to your project's configuration to fix this error.",
			);
		}

		const res = await fetch(localSliceSimulatorURL);

		return res.ok;
	}
}
