import * as crypto from "node:crypto";

/**
 * Creates a content digest for a given input.
 *
 * @param input - The value used to create a digest digest.
 *
 * @returns The content digest of `input`.
 */
export const createContentDigest = (input: crypto.BinaryLike): string => {
	return crypto.createHash("sha1").update(input).digest("hex");
};
