export async function safelyExecute<T>(
	operation: () => Promise<T>,
): Promise<T | undefined> {
	try {
		return await operation();
	} catch {
		return undefined;
	}
}
