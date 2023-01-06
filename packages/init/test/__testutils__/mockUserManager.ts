import { SpyInstance, vi } from "vitest";

import { PrismicUserProfile } from "@slicemachine/manager";

import { SliceMachineInitProcess } from "../../src/SliceMachineInitProcess";

export const mockUserManager = (
	initProcess: SliceMachineInitProcess,
	authState?: {
		isLoggedIn?: boolean;
		userProfile?: PrismicUserProfile | true;
	},
): {
	checkIsLoggedIn: SpyInstance;
	getLoginSessionInfo: SpyInstance;
	nodeLoginSession: SpyInstance;
	getProfile: SpyInstance;
} => {
	// @ts-expect-error - Accessing protected method
	const manager = initProcess.manager;

	const checkIsLoggedIn = vi
		.spyOn(manager.user, "checkIsLoggedIn")
		.mockImplementation(vi.fn(() => Promise.resolve(!!authState?.isLoggedIn)));

	const getLoginSessionInfo = vi.spyOn(manager.user, "getLoginSessionInfo");

	const nodeLoginSession = vi
		.spyOn(manager.user, "nodeLoginSession")
		.mockImplementation(
			vi.fn((args: { onListenCallback?: () => void }) => {
				args.onListenCallback?.();

				return Promise.resolve();
			}),
		);

	const getProfile = vi.spyOn(manager.user, "getProfile").mockImplementation(
		vi.fn(() => {
			if (!authState?.userProfile) {
				throw new Error("test: not logged in");
			}

			if (authState.userProfile === true) {
				return Promise.resolve({
					userId: "userId",
					shortId: "shortId",
					intercomHash: "intercomHash",
					email: "email",
					firstName: "firstName",
					lastName: "lastName",
				});
			}

			return Promise.resolve(authState.userProfile);
		}),
	);

	return {
		checkIsLoggedIn,
		getLoginSessionInfo,
		nodeLoginSession,
		getProfile,
	};
};
