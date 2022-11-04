import { expect, it } from "vitest";

import { removeFunctions } from "../src/lib/removeFunctions";

it("removes function properties from an object", () => {
	const res = removeFunctions({
		fn: () => void 0,
		nested: {
			baz: "qux",
			fn: () => void 0,
		},
	});

	expect(res).toStrictEqual({
		foo: "bar",
		nested: {
			baz: "qux",
		},
	});
});
