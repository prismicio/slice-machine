import { PrismicAuth } from "./PrismicAuth";

type CreatePrismicAuth = ConstructorParameters<typeof PrismicAuth>[0];

export const createPrismicAuth = (args?: CreatePrismicAuth): PrismicAuth => {
	return new PrismicAuth(args);
};
