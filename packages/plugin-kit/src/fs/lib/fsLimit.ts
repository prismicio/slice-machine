import * as fs from "node:fs/promises";
import pLimit from "p-limit";

/**
 * The parsed number value of the SM_FS_LIMIT environment variable.
 */
const SM_FS_LIMIT = Number.isNaN(Number(process.env.SM_FS_LIMIT))
	? undefined
	: Number(process.env.SM_FS_LIMIT);

/**
 * The maximum number of concurrent file descriptors allowed to adapters to
 * minimize issues like `EMFILE: too many open files`.
 *
 * - MacOS default limit: 2560 (recent), 256 (old)
 * - Windows limit (per process): 2048
 */
const CONCURRENT_FILE_DESCRIPTORS_LIMIT = SM_FS_LIMIT ?? 1024;

/**
 * Limit concurrent file descriptors for adapters.
 */
const fsLimit = pLimit(CONCURRENT_FILE_DESCRIPTORS_LIMIT);

/**
 * Wrap a function with `fsLimit()` to limit concurrent calls. All functions
 * called with `wrapWithFSLimit()` share the same queue.
 *
 * @param fn - The function to wrap.
 *
 * @returns The wrapped function.
 */
const wrapWithFSLimit = <
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TFn extends (...args: any[]) => any,
>(
	fn: TFn,
): TFn => {
	return ((...args) => fsLimit(() => fn(...args))) as TFn;
};

export const access = wrapWithFSLimit(fs.access);
export const appendFile = wrapWithFSLimit(fs.appendFile);
export const chmod = wrapWithFSLimit(fs.chmod);
export const chown = wrapWithFSLimit(fs.chown);
export const copyFile = wrapWithFSLimit(fs.copyFile);
export const cp = wrapWithFSLimit(fs.cp);
export const lchmod = wrapWithFSLimit(fs.lchmod);
export const lchown = wrapWithFSLimit(fs.lchown);
export const link = wrapWithFSLimit(fs.link);
export const lstat = wrapWithFSLimit(fs.lstat);
export const lutimes = wrapWithFSLimit(fs.lutimes);
export const mkdir = wrapWithFSLimit(fs.mkdir);
export const mkdtemp = wrapWithFSLimit(fs.mkdtemp);
export const open = wrapWithFSLimit(fs.open);
export const opendir = wrapWithFSLimit(fs.opendir);
export const readFile = wrapWithFSLimit(fs.readFile);
export const readdir = wrapWithFSLimit(fs.readdir);
export const readlink = wrapWithFSLimit(fs.readlink);
export const realpath = wrapWithFSLimit(fs.realpath);
export const rename = wrapWithFSLimit(fs.rename);
export const rm = wrapWithFSLimit(fs.rm);
export const rmdir = wrapWithFSLimit(fs.rmdir);
export const stat = wrapWithFSLimit(fs.stat);
export const statfs = wrapWithFSLimit(fs.statfs);
export const symlink = wrapWithFSLimit(fs.symlink);
export const truncate = wrapWithFSLimit(fs.truncate);
export const unlink = wrapWithFSLimit(fs.unlink);
export const utimes = wrapWithFSLimit(fs.utimes);
export const watch = wrapWithFSLimit(fs.watch);
export const writeFile = wrapWithFSLimit(fs.writeFile);
