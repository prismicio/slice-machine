export const coerceTrailingSlash = (path: string): string => {
	return path + (path.endsWith("/") ? "" : "/");
};
