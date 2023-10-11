import { exitPreview } from "@prismicio/next";

export async function GET(): Promise<void | Response> {
	return await exitPreview();
}
