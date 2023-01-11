import { createSliceMachineManager } from "@slicemachine/manager";
import { SliceMachinePlugin } from "@slicemachine/plugin-kit";

import { SliceMachineInitProcess } from "../../src";

export const injectTestAdapter = (args: {
	initProcess: SliceMachineInitProcess;
	adapter: SliceMachinePlugin;
}): void => {
	// @ts-expect-error - Accessing protected properties
	args.initProcess.manager = createSliceMachineManager({
		nativePlugins: {
			[args.adapter.meta.name]: args.adapter,
		},
		// @ts-expect-error - Accessing protected properties
		cwd: args.initProcess.options.cwd,
	});

	// @ts-expect-error - Accessing protected properties
	args.initProcess.context.framework.adapterName ||= {};
	// @ts-expect-error - Accessing protected properties
	args.initProcess.context.framework.adapterName = args.adapter.meta.name;
};
