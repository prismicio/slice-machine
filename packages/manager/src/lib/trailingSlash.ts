export const addTrailingSlash = (
	url: string | undefined,
): string | undefined => {
	return url?.replace(/\/?$/, "/");
};

export const removeTrailingSlash = (url: string): string => {
	return url.replace(/\/$/, "");
};
