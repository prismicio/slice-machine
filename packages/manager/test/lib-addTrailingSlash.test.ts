import { expect, it } from "vitest";

import { addTrailingSlash } from "../src/lib/addTrailingSlash";

it("supports undefined urls", async () => {
	expect(addTrailingSlash(undefined)).toBe(undefined);
});

it("adds a single trailing slash to endpoints", async () => {
	expect(addTrailingSlash("https://prismic.io")).toBe("https://prismic.io/");
	expect(addTrailingSlash("https://prismic.io/")).toBe("https://prismic.io/");
});
