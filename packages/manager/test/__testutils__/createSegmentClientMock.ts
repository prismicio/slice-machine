import { Mock, vi } from "vitest";

type CreateSegmentClientMockReturnType = {
	default: Mock;
};

export const createSegmentClientMock =
	(): CreateSegmentClientMockReturnType => {
		const MockSegmentClient = vi.fn();

		MockSegmentClient.prototype.track = vi.fn(
			(_message: unknown, callback: (error?: Error) => void) => {
				if (callback) {
					callback();
				}
			},
		);

		return {
			default: MockSegmentClient,
		};
	};
