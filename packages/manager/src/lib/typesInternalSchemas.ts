import * as z from "zod";
import * as TypesInternal from "@prismicio/types-internal/lib/customtypes/index.js";

/**
 * Zod schema wrapper for TypesInternal.CustomType. Uses io-ts validation
 * internally but exposes a Zod-compatible interface.
 */
export const CustomTypeSchema: z.ZodType<TypesInternal.CustomType> = z
	.unknown()
	.transform((val, ctx) => {
		const result = TypesInternal.CustomType.decode(val);
		if (result._tag === "Right") {
			return result.right;
		}

		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Invalid custom type.",
		});

		return z.NEVER;
	});

/**
 * Zod schema wrapper for TypesInternal.SharedSlice. Uses io-ts validation
 * internally but exposes a Zod-compatible interface.
 */
export const SharedSliceSchema: z.ZodType<TypesInternal.SharedSlice> = z
	.unknown()
	.transform((val, ctx) => {
		const result = TypesInternal.SharedSlice.decode(val);
		if (result._tag === "Right") {
			return result.right;
		}

		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Invalid shared slice.",
		});

		return z.NEVER;
	});
