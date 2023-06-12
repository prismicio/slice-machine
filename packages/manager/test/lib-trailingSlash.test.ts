import { expect, it, describe } from "vitest";

import {
	addTrailingSlash,
	removeTrailingSlash,
} from "../src/lib/trailingSlash";

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
	it("removes a single trailing slash from endpoints", () => {
		expect(removeTrailingSlash("https://prismic.io/")).toBe(
			"https://prismic.io",
		);
		expect(removeTrailingSlash("https://prismic.io")).toBe(
			"https://prismic.io",
		);
	});
});
