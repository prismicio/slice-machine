export const addTrailingSlash = (
	url: string | undefined,
): string | undefined => {
	return url?.replace(/\/?$/, "/");
};
