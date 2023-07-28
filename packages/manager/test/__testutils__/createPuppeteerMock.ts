import { vi } from "vitest";

export const createPuppeteerMock = (): {
	launch: () => void;
	__page__$: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		mockReturnValueOnce: (args: any) => void;
	};
	__browser__createIncognitoBrowserContext: () => void;
	__browserContext__newPage: () => void;
	__page__goto: () => void;
	__element__screenshot: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		mockReturnValueOnce: (args: any) => void;
	};
	__page__setViewport: () => void;
	__page__waitForSelector: () => {
		mockReturnValueOnce: () => void;
	};
} => {
	return {
		launch: vi.fn(),
		__page__$: {
			mockReturnValueOnce: vi.fn(),
		},
		__browser__createIncognitoBrowserContext: vi.fn(),
		__browserContext__newPage: vi.fn(),
		__page__goto: vi.fn(),
		__element__screenshot: {
			mockReturnValueOnce: vi.fn(),
		},
		__page__setViewport: vi.fn(),
		__page__waitForSelector: () => ({
			mockReturnValueOnce: vi.fn(),
		}),
	};
};

// TODO(DT-1534): Uncomment to enable Puppeteer screenshots or delete if we decide to remove Puppeteer
// import type * as puppeteer from "puppeteer";

// type CreatePuppeteerMockReturnType = typeof import("puppeteer") & {
// 	launch: Mock<Parameters<typeof puppeteer.launch>>;
// 	__browserContext__newPage: Mock<
// 		Parameters<puppeteer.BrowserContext["newPage"]>
// 	>;
// 	__browser__createIncognitoBrowserContext: Mock<
// 		Parameters<puppeteer.Browser["createIncognitoBrowserContext"]>
// 	>;
// 	__element__screenshot: Mock<
// 		Parameters<puppeteer.ElementHandle["screenshot"]>
// 	>;
// 	__page__$: Mock<Parameters<puppeteer.Page["$"]>>;
// 	__page__goto: Mock<Parameters<puppeteer.Page["goto"]>>;
// 	__page__setViewport: Mock<Parameters<puppeteer.Page["setViewport"]>>;
// 	__page__waitForSelector: Mock<Parameters<puppeteer.Page["waitForSelector"]>>;
// };

// export const createPuppeteerMock = (): CreatePuppeteerMockReturnType => {
// 	const __element__screenshot =
// 		vi.fn<Parameters<puppeteer.ElementHandle["screenshot"]>>();

// 	const __page__$ = vi.fn<Parameters<puppeteer.Page["$"]>>(() => {
// 		return {
// 			screenshot: __element__screenshot,
// 		};
// 	});

// 	const __page__setViewport = vi.fn<Parameters<puppeteer.Page["setViewport"]>>(
// 		() => void 0,
// 	);
// 	const __page__goto = vi.fn<Parameters<puppeteer.Page["goto"]>>(() => void 0);
// 	const __page__waitForSelector = vi.fn<
// 		Parameters<puppeteer.Page["waitForSelector"]>
// 	>(() => void 0);

// 	const __browserContext__newPage = vi.fn<
// 		Parameters<puppeteer.BrowserContext["newPage"]>
// 	>(() => {
// 		return {
// 			setViewport: __page__setViewport,
// 			goto: __page__goto,
// 			waitForSelector: __page__waitForSelector,
// 			$: __page__$,
// 		};
// 	});

// 	const __browser__createIncognitoBrowserContext = vi.fn<
// 		Parameters<puppeteer.BrowserContext["newPage"]>
// 	>(() => {
// 		return {
// 			newPage: __browserContext__newPage,
// 		};
// 	});

// 	const __launch = vi.fn(() => {
// 		return {
// 			createIncognitoBrowserContext: __browser__createIncognitoBrowserContext,
// 		};
// 	});

// 	return {
// 		launch: __launch,
// 		__page__$,
// 		__browser__createIncognitoBrowserContext,
// 		__browserContext__newPage,
// 		__page__goto,
// 		__element__screenshot,
// 		__page__setViewport,
// 		__page__waitForSelector,
// 	} as unknown as CreatePuppeteerMockReturnType;
// 	// If you have time to fix the types so `as unknown as ...` is not
// 	// required, please fix this! - Angelo 2023-02-22
// };
