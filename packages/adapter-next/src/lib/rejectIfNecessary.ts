export const rejectIfNecessary = <
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TPromiseSettledResults extends readonly PromiseSettledResult<any>[],
>(
	promiseSettledResults: TPromiseSettledResults,
): void => {
	const rejectedReasons = promiseSettledResults
		.filter(
			(result): result is PromiseRejectedResult => result.status === "rejected",
		)
		.map((result) => result.reason);

	if (rejectedReasons.length > 0) {
		throw rejectedReasons[0];
	}
};
