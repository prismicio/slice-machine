import { PrismicManager } from "./PrismicManager";

type CreatePrismicManagerArgs = ConstructorParameters<typeof PrismicManager>;

export const createPrismicManager = (
	...args: CreatePrismicManagerArgs
): PrismicManager => {
	return new PrismicManager(...args);
};
