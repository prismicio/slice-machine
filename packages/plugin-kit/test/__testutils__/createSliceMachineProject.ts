import { SliceMachinePlugin, SliceMachineProject } from "../../src";

export const createSliceMachineProject = (
	adapter: string | SliceMachinePlugin,
	plugins?: (string | SliceMachinePlugin)[],
): SliceMachineProject => {
	return {
		root: "/tmp/slicemachine-test",
		config: {
			repositoryName: "qwerty",
			apiEndpoint: "https://qwerty.cdn.prismic.io/api/v2",
			adapter,
			plugins,
		},
	};
};
