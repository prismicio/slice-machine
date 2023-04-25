/**
 * Checks whether or not Sentry is enabled.
 *
 * Sentry is enabled automatically in production but can be disabled by setting
 * `ENABLE_SENTRY` to `false`.
 *
 * @returns Whether or not Sentry is enabled.
 */
export const checkIsSentryEnabled = (): boolean =>
	process.env.ENABLE_SENTRY === undefined
		? !["development", "test"].includes(process.env.NODE_ENV ?? "")
		: process.env.ENABLE_SENTRY === "true";
