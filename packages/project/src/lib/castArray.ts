export const castArray = <T>(input: T | readonly T[]): T[] => {
	return Array.isArray(input) ? input : ([input] as T[]);
};
