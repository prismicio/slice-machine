import * as t from "io-ts";
import { ZodType, ZodTypeDef } from "zod";
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

function isZodSchema(value: unknown): value is ZodType<unknown> {
	return (
		typeof (value as ZodType<unknown>).safeParse === "function" &&
		value instanceof ZodType
	);
}

export function decode<A, O, I>(
	codec: ZodType<A, ZodTypeDef, unknown>,
	input: I,
): DecodeReturnType<A, O, I>;
export function decode<A, O, I>(
	codec: t.Type<A, O, I> | ZodType<A, ZodTypeDef, unknown>,
	input: I,
): DecodeReturnType<A, O, I>;
export function decode<A, O, I>(
	codec: t.Type<A, O, I> | ZodType<A, ZodTypeDef, unknown>,
	input: I,
): DecodeReturnType<A, O, I> {
	if (isZodSchema(codec)) {
		const parsed = codec.safeParse(input);

		if (parsed.success) {
			return { value: parsed.data };
		}

		return { error: new DecodeError({ input, errors: parsed.error.errors }) };
	}

	return pipe(
		codec.decode(input),
		E.foldW(
			(errors) => {
				return {
					error: new DecodeError({ input, errors }),
				};
			},
			(value) => {
				return {
					value,
				};
			},
		),
	);
}
