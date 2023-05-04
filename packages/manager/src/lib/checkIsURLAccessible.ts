import fetch from "./fetch";

export const checkIsURLAccessible = async (url: string): Promise<boolean> => {
	const res = await fetch(url);

	return res.ok;
};
