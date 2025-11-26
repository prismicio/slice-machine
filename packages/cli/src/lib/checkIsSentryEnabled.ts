/**
 * Checks whether or not Sentry is enabled.
 *
 * Sentry is enabled automatically in production but can be disabled by setting
 * `VITE_ENABLE_SENTRY` to `false`.
 *
 * @returns Whether or not Sentry is enabled.
 */
export const checkIsSentryEnabled = (): boolean =>
	import.meta.env.VITE_ENABLE_SENTRY === undefined
		? import.meta.env.PROD
		: import.meta.env.VITE_ENABLE_SENTRY === "true";
