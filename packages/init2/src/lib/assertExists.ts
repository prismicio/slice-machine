// TypeScript cannot use arrow functions for assertions
export function assertExists<T>(
	value: T,
	name: string
): asserts value is NonNullable<T> {
	if (value == undefined) {
		throw new Error(`Failed to resolve ${name}`);
	}
}
