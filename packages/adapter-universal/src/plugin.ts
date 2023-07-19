import { defineSliceMachinePlugin } from "@slicemachine/plugin-kit";

import { name as pkgName } from "../package.json";
import { PluginOptions } from "./types";

export const plugin = defineSliceMachinePlugin<PluginOptions>({
	meta: {
		name: pkgName,
	},
	setup() {
		throw new Error(
			`${pkgName} cannot be used as an adapter at this time. It is used as a base for other adapters. Please replace it with another adapter.`,
		);
	},
});
