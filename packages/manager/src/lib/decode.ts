import * as t from "io-ts";
import * as z from "zod";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

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

function isZodSchema(value: unknown): value is z.ZodType {
	return (
		value !== null &&
		typeof value === "object" &&
		"safeParse" in value &&
		typeof (value as z.ZodType).safeParse === "function"
	);
}

export function decode<A, O, I>(
	codec: z.ZodType<A>,
	input: I,
): DecodeReturnType<A, O, I>;
export function decode<A, O, I>(
	codec: t.Type<A, O, I> | z.ZodType<A>,
	input: I,
): DecodeReturnType<A, O, I>;
export function decode<A, O, I>(
	codec: t.Type<A, O, I> | z.ZodType<A>,
	input: I,
): DecodeReturnType<A, O, I> {
	if (isZodSchema(codec)) {
		const parsed = codec.safeParse(input);

		if (parsed.success) {
			return { value: parsed.data } as DecodeReturnType<A, O, I>;
		}

		return {
			error: new DecodeError({ input, errors: parsed.error.issues }),
		} as DecodeReturnType<A, O, I>;
	}

	return pipe(
		codec.decode(input),
		E.foldW(
			(errors) => {
				return {
					error: new DecodeError({ input, errors }),
				} as DecodeReturnType<A, O, I>;
			},
			(value) => {
				return {
					value,
				} as DecodeReturnType<A, O, I>;
			},
		),
	);
}
