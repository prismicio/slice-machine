import { Environment } from "../managers/prismicRepository/types";

export const findEnvironment = (
	environmentDomain: string | undefined,
	environments: Environment[],
): Environment | undefined => {
	return environments?.find((environment) => {
		if (environmentDomain === undefined) {
			return environment.kind === "prod";
		}

		return environment.domain === environmentDomain;
	});
};
