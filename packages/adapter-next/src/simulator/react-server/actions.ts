"use server";

import { revalidatePath as baseRevalidatePath } from "next/cache";

export async function revalidatePath(path: string): Promise<void> {
	baseRevalidatePath(path);
}
