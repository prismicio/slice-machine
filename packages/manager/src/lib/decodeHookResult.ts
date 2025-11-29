import { CallHookReturnType, HookError } from "@prismicio/plugin-kit";
import * as z from "zod";

import { DecodeError } from "./DecodeError";
import { decode } from "./decode";

export const decodeHookResult = <
	A,
	_O,
	I,
	THookResult extends Awaited<CallHookReturnType>,
>(
	codec: z.ZodType<A>,
	hookResult: THookResult,
): {
	data: A[];
	errors: (HookError | DecodeError<I>)[];
} => {
	const data: A[] = [];
	const errors: DecodeError<I>[] = [];

	for (const dataElement of hookResult.data) {
		const { value, error } = decode(codec, dataElement);

		if (error) {
			errors.push(error);
		} else {
			data.push(value);
		}
	}

	return {
		data,
		errors: [...errors, ...hookResult.errors],
	};
};
