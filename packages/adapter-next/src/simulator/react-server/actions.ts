"use server";

import { revalidatePath } from "next/cache";

export async function revalidateData(path: string): Promise<void> {
	revalidatePath(path);
}
