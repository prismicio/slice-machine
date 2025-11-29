import semver from "semver";

import * as pkg from "../../package.json";

/**
 * Checks if we should show errors in the console. Errors are shown in
 * development mode or when using a pre-release version.
 *
 * @returns Whether to show errors.
 */
const shouldShowErrors = (): boolean => {
	// Show errors in development mode
	if (import.meta.env.DEV) {
		return true;
	}

	// Show errors if it's a pre-release version
	if (semver.prerelease(pkg.version) !== null) {
		return true;
	}

	return false;
};

/**
 * Handles errors that should not break the CLI by logging them in
 * dev/pre-release mode, or silently failing otherwise.
 *
 * @param error - The error that occurred.
 * @param context - Context about what operation failed.
 */
export function handleSilentError(error: unknown, context: string): void {
	if (shouldShowErrors()) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error(
			`[${context}] Failed: ${errorMessage}`,
			error instanceof Error ? error : undefined,
		);
	}
}
