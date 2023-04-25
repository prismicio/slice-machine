import { API_ENDPOINTS } from "../constants/API_ENDPOINTS";

export type BuildPrismicRepositoryAPIEndpointConfig = {
	withCDN?: boolean;
};

export const buildPrismicRepositoryAPIEndpoint = (
	repositoryName: string,
	{ withCDN = true }: BuildPrismicRepositoryAPIEndpointConfig = {},
): string => {
	const baseEndpoint = new URL(API_ENDPOINTS.PrismicWroom);

	return `${baseEndpoint.protocol}//${repositoryName}${withCDN ? ".cdn" : ""}.${
		baseEndpoint.host
	}/api/v2`;
};
