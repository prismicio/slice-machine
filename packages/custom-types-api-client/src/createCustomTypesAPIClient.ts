import { CustomTypesAPIClient } from "./CustomTypesAPIClient";

type CreateCustomTypesAPIClient = ConstructorParameters<
	typeof CustomTypesAPIClient
>[0];

export const createCustomTypesAPIClient = (
	args: CreateCustomTypesAPIClient,
): CustomTypesAPIClient => {
	return new CustomTypesAPIClient(args);
};
