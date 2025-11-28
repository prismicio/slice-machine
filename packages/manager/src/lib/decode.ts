import * as z from "zod";

import { DecodeError } from "./DecodeError";

export type DecodeReturnType<A, _O, I> =
	| {
			value: A;
			error?: never;
	  }
	| {
			value?: never;
			error: DecodeError<I>;
	  };

export function decode<A, O, I>(
	codec: z.ZodType<A>,
	input: I,
): DecodeReturnType<A, O, I> {
	const parsed = codec.safeParse(input);

	if (parsed.success) {
		return { value: parsed.data } as DecodeReturnType<A, O, I>;
	}

	return {
		error: new DecodeError({ input, errors: parsed.error.issues }),
	} as DecodeReturnType<A, O, I>;
}
