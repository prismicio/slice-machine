import { SliceMachinePlugin, SliceMachineProject } from "../../src";

export const createSliceMachineProject = (
	adapter: string | SliceMachinePlugin,
	plugins?: (string | SliceMachinePlugin)[],
): SliceMachineProject => {
	return {
		root: "/tmp/slicemachine-test",
		config: {
			_latest: "0.0.0",
			apiEndpoint: "https://qwerty.cdn.prismic.io/api/v2",
			adapter,
			plugins,
		},
	};
};
