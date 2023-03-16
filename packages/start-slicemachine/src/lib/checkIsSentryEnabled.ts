/**
 * Checks whether or not Sentry is enabled
 *
 * Sentry is enabled:
 *
 * - Automatically in production
 * - If explicitely set through `SENTRY_AUTH_TOKEN`
 *
 * @returns Whether or not Sentry is enabeld
 */
export const checkIsSentryEnabled = (): boolean =>
	!["development", "test"].includes(process.env.NODE_ENV ?? "") ||
	process.env.SENTRY_AUTH_TOKEN !== undefined;
