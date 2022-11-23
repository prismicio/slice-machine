import { PrismicAuthManager } from "./PrismicAuthManager";

type CreatePrismicAuthManager = ConstructorParameters<
	typeof PrismicAuthManager
>[0];

export const createPrismicAuthManager = (
	args?: CreatePrismicAuthManager,
): PrismicAuthManager => {
	return new PrismicAuthManager(args);
};
