import * as t from "io-ts";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { DecodeError } from "./DecodeError";

export type DecodeReturnType<A, _O, I> =
	| {
			value: A;
			error: undefined;
	  }
	| {
			value: undefined;
			error: DecodeError<I>;
	  };

export const decode = <A, O, I>(
	codec: t.Type<A, O, I>,
	input: I,
): DecodeReturnType<A, O, I> => {
	return pipe(
		codec.decode(input),
		E.foldW(
			(errors) => {
				return {
					value: undefined,
					error: new DecodeError({ input, errors }),
				};
			},
			(value) => {
				return {
					value,
					error: undefined,
				};
			},
		),
	);
};
