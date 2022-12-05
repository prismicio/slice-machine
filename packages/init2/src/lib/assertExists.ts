// TypeScript cannot use arrow functions for assertions
export function assertExists<T>(
	value: T,
	message: string
): asserts value is NonNullable<T> {
	if (value == undefined) {
		throw new Error(message);
	}
}
