import * as t from "io-ts";
import { formatValidationErrors } from "io-ts-reporters";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

type DecodeReturnType<A> =
	| {
			value: undefined;
			errors: string[];
	  }
	| {
			value: A;
			errors: undefined;
	  };

export const decode = <A, O, I>(
	type: t.Type<A, O, I>,
	input: I,
): DecodeReturnType<A> => {
	return pipe(
		type.decode(input),
		E.foldW(
			(errors) => {
				return {
					value: undefined,
					errors: formatValidationErrors(errors),
				};
			},
			(value) => {
				return {
					value,
					errors: undefined,
				};
			},
		),
	);
};
