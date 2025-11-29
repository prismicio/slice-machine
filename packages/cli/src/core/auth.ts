import type { PrismicManager } from "@prismicio/manager";
import chalk from "chalk";
import open from "open";

import { listr, listrRun } from "../utils/listr";
import { updateSentryContext } from "../utils/sentry";

export async function login(manager: PrismicManager): Promise<void> {
	return listrRun([
		{
			title: "Logging in to Prismic...",
			task: async (_, parentTask) => {
				const isLoggedIn = await manager.user.checkIsLoggedIn();

				if (!isLoggedIn) {
					parentTask.title = getLoggingInTitle(
						chalk.cyan("Press any key to open the browser to login..."),
					);
					await pressKeyToLogin();
					await waitingForLogin(manager, ({ url }) => {
						parentTask.title = getLoggingInTitle(
							chalk.cyan("Opening browser, waiting for you to login..."),
							chalk.yellow(
								"If your browser did not open automatically, please use the url below:",
							),
							url,
						);
					});
				}

				parentTask.title = `Logged in`;

				return listr(
					[
						{
							title: "Fetching user profile...",
							task: async (_, task) => {
								const userProfile = await manager.user.getProfile();

								// Update Sentry context for the current user
								updateSentryContext({ userProfile });

								parentTask.title = `Logged in as ${chalk.cyan(
									userProfile?.email,
								)}`;
								task.title = "Fetched user profile";
							},
						},
					],
					{ concurrent: true },
				);
			},
		},
	]);
}

function getLoggingInTitle(subtitle?: string, ...extra: string[]): string {
	return `Logging in to Prismic...
    
███████████████████████████████████████████████████████████████████████████

${subtitle ? `* * ${subtitle}` : ""}
${extra.length ? `\n${extra.map((line) => `   ${line}`).join("\n")}\n` : ""}
███████████████████████████████████████████████████████████████████████████
`;
}

async function pressKeyToLogin(): Promise<void> {
	await new Promise((resolve) => {
		const initialRawMode = !!process.stdin.isRaw;
		process.stdin.setRawMode?.(true);
		process.stdin.resume();
		process.stdin.once("data", (data: Buffer) => {
			process.stdin.setRawMode?.(initialRawMode);
			process.stdin.pause();
			resolve(data.toString("utf-8"));
		});
	});
}

async function waitingForLogin(
	manager: PrismicManager,
	onListenCallback?: (
		sessionInfo: Awaited<ReturnType<typeof manager.user.getLoginSessionInfo>>,
	) => void,
): Promise<void> {
	const sessionInfo = await manager.user.getLoginSessionInfo();
	await manager.user.nodeLoginSession({
		port: sessionInfo.port,
		onListenCallback() {
			open(sessionInfo.url);
			onListenCallback?.(sessionInfo);
		},
	});
}
