import * as z from "zod";

type ZodIssue = z.ZodIssue;

type DecodeErrorConstructorArgs<TInput = unknown> = {
	input: TInput;
	errors: ZodIssue[];
};

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
		const formattedErrors = formatZodErrors(args.errors);

		super(formattedErrors.join(", "));

		this.input = args.input;
		this.errors = formattedErrors;
	}
}
