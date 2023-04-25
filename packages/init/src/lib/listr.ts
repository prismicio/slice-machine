// @ts-expect-error - @types package not available
import UpdateRenderer from "@lihbr/listr-update-renderer";
import Listr from "listr";

type ListrArgs = [tasks: Listr.ListrTask[], options?: Listr.ListrOptions];

export const listr = (...[tasks, options]: ListrArgs): Listr => {
	return new Listr(tasks, { renderer: UpdateRenderer, ...options });
};

export const listrRun = async (
	...[tasks, options]: ListrArgs
): Promise<void> => {
	return listr(tasks, options).run();
};
