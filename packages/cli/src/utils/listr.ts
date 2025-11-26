import Listr from "listr";

type ListrArgs = [tasks: Listr.ListrTask[], options?: Listr.ListrOptions];

export const listr = (...[tasks, options]: ListrArgs): Listr => {
	return new Listr(tasks, options);
};

export const listrRun = async (
	...[tasks, options]: ListrArgs
): Promise<void> => {
	return listr(tasks, options).run();
};
