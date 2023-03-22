// TODO: MIGRATION - Remove this after migration the Migration Manager if still not used elsewhere
export const castArray = <T>(input: T | readonly T[]): T[] => {
	return Array.isArray(input) ? input : ([input] as T[]);
};
