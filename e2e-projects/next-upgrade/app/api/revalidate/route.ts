import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(): Promise<Response> {
	revalidateTag("prismic");

	return NextResponse.json({ revalidated: true, now: Date.now() });
}
