import * as t from "io-ts";
import { formatValidationErrors } from "io-ts-reporters";
import { ZodIssue } from "zod";

type DecodeErrorConstructorArgs<TInput = unknown> = {
	input: TInput;
	errors: t.Errors | ZodIssue[];
};

function isZodIssueArray(errors: object[]): errors is ZodIssue[] {
	return "path" in errors[0];
}

function formatZodErrors(errors: ZodIssue[]): string[] {
	return errors.map((err) => {
		const path = err.path.length > 0 ? ` at ${err.path.join(".")}` : "";

		return `${err.message}${path}`;
	});
}

export class DecodeError<TInput = unknown> extends Error {
	name = "DecodeError";
	input: TInput;
	errors: string[];

	constructor(args: DecodeErrorConstructorArgs<TInput>) {
		let formattedErrors: string[] = [];

		if (isZodIssueArray(args.errors)) {
			formattedErrors = formatZodErrors(args.errors);
		} else {
			formattedErrors = formatValidationErrors(args.errors);
		}

		super(formattedErrors.join(", "));

		this.input = args.input;
		this.errors = formattedErrors;
	}
}
