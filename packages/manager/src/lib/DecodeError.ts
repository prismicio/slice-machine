import * as t from "io-ts";
import { formatValidationErrors } from "io-ts-reporters";

type DecodeErrorConstructorArgs<TInput = unknown> = {
	input: TInput;
	errors: t.Errors;
};

export class DecodeError<TInput = unknown> extends Error {
	name = "DecodeError";
	input: TInput;
	errors: string[];

	constructor(args: DecodeErrorConstructorArgs<TInput>) {
		const formattedErrors = formatValidationErrors(args.errors);

		super(formattedErrors.join(", "));

		this.input = args.input;
		this.errors = formattedErrors;
	}
}
