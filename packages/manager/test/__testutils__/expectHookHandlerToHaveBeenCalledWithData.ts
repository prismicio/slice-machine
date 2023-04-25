import { expect, Mock } from "vitest";

// TODO: Replace this function with a custom matcher
// (e.g. `expect(hookHandler).toHaveBeenCalledWithHookData({ ... })`).
export const expectHookHandlerToHaveBeenCalledWithData = (
	hookHandler: Mock,
	data: Record<string, unknown>,
): void => {
	expect(hookHandler).toHaveBeenCalledWith(
		data,
		expect.objectContaining({
			actions: expect.anything(),
			helpers: expect.anything(),
			project: expect.anything(),
			options: expect.anything(),
		}),
	);
};
