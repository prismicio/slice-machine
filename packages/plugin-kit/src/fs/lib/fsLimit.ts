import pLimit from "p-limit";

/**
 * The maximum number of concurrent file descriptors allowed to adapters to
 * minimize issues like `EMFILE: too many open files`.
 *
 * - MacOS default limit: 2560 (recent), 256 (old)
 * - Windows limit (per process): 2048
 */
const CONCURRENT_FILE_DESCRIPTORS_LIMIT = 1024;

/**
 * Limit concurrent file descriptors for adapters.
 */
export const fsLimit = pLimit(CONCURRENT_FILE_DESCRIPTORS_LIMIT);
