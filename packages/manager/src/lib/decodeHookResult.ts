import * as t from "io-ts";
import { CallHookReturnType, HookError } from "@slicemachine/plugin-kit";

import { DecodeError } from "./DecodeError";
import { decode } from "./decode";

export const decodeHookResult = <
	A,
	O,
	I,
	THookResult extends Awaited<CallHookReturnType>,
>(
	codec: t.Type<A, O, I>,
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
