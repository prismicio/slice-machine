import { RepositoryAPIClient } from "./RepositoryAPIClient";

type CreateRepositoryAPIClient = ConstructorParameters<
	typeof RepositoryAPIClient
>[0];

export const createRepositoryAPIClient = (
	args?: CreateRepositoryAPIClient,
): RepositoryAPIClient => {
	return new RepositoryAPIClient(args);
};
