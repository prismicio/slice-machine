import {
	SliceMachineConfig,
	SliceMachineProject,
} from "@slicemachine/plugin-kit";
import { TestContext } from "vitest";

export const createSliceMachineProject = (
	ctx: TestContext,
	config: SliceMachineConfig,
): SliceMachineProject => {
	return {
		root: ctx.project.root,
		config: {
			...config,
			repositoryName: config.repositoryName || "qwerty",
			apiEndpoint: config.apiEndpoint || "https://qwerty.cdn.prismic.io/api/v2",
		},
	};
};
