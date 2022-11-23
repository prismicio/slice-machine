import * as t from "io-ts";

export const functionCodec = new t.Type<
	// eslint-disable-next-line @typescript-eslint/ban-types
	Function,
	// eslint-disable-next-line @typescript-eslint/ban-types
	Function,
	unknown
>(
	"function",
	// eslint-disable-next-line @typescript-eslint/ban-types
	(input: unknown): input is Function => typeof input === "function",
	(input, context) =>
		typeof input === "function" ? t.success(input) : t.failure(input, context),
	t.identity,
);
