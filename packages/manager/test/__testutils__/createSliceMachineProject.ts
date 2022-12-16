import {
	SliceMachinePlugin,
	SliceMachineProject,
} from "@slicemachine/plugin-kit";

export const createSliceMachineProject = (
	adapter: string | SliceMachinePlugin,
	plugins?: (string | SliceMachinePlugin)[],
): SliceMachineProject => {
	return {
		root: "/tmp/slicemachine-test",
		config: {
			_latest: "0.0.0",
			repositoryName: "qwerty",
			adapter,
			plugins,
		},
	};
};
