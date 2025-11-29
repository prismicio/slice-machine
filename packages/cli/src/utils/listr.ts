import { Listr, type ListrTask, type ListrOptions } from "listr2";

type ListrArgs = [tasks: ListrTask[], options?: ListrOptions];

export const listr = (...[tasks, options]: ListrArgs): Listr => {
	return new Listr(tasks, options);
};

export const listrRun = async (
	...[tasks, options]: ListrArgs
): Promise<void> => {
	return listr(tasks, options).run();
};
