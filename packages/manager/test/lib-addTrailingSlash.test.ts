import { expect, it, describe } from "vitest";

import {
	addTrailingSlash,
	removeTrailingSlash,
} from "../src/lib/addTrailingSlash";

describe("addTrailingSlash", () => {
	it("supports undefined urls", async () => {
		expect(addTrailingSlash(undefined)).toBe(undefined);
	});

	it("adds a single trailing slash to endpoints", async () => {
		expect(addTrailingSlash("https://prismic.io")).toBe("https://prismic.io/");
		expect(addTrailingSlash("https://prismic.io/")).toBe("https://prismic.io/");
	});
});

describe("removeTrailingSlash", () => {
	it("will removed a trailing slash from a string", () => {
		expect(removeTrailingSlash("https://prismic.io/")).toBe(
			"https://prismic.io",
		);
		expect(removeTrailingSlash("https://prismic.io")).toBe(
			"https://prismic.io",
		);

		expect(removeTrailingSlash("foo/bar")).toBe("foo/bar");
	});
});
