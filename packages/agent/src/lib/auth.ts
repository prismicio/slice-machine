import type { SliceMachineManager } from "@slicemachine/manager";
import open from "open";
import chalk from "chalk";

export async function ensureAuthenticated(
  manager: SliceMachineManager,
  verbose: boolean,
): Promise<void> {
  if (verbose) {
    console.log(chalk.gray("🔐 Checking authentication..."));
  }

  const isLoggedIn = await manager.user.checkIsLoggedIn();

  if (!isLoggedIn) {
    if (verbose) {
      console.log(chalk.gray("📝 Authentication required"));
    }

    await pressKeyToLogin();
    await waitForLogin(manager);
  }

  if (verbose) {
    const profile = await manager.user.getProfile();
    console.log(chalk.gray(`✅ Logged in as ${chalk.cyan(profile.email)}`));
  }
}

async function pressKeyToLogin(): Promise<void> {
  console.log(chalk.cyan("🔑 Press any key to open the browser to login..."));

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

async function waitForLogin(manager: SliceMachineManager): Promise<void> {
  const sessionInfo = await manager.user.getLoginSessionInfo();

  console.log(chalk.gray("🌐 Opening browser..."));

  await manager.user.nodeLoginSession({
    port: sessionInfo.port,
    onListenCallback() {
      open(sessionInfo.url);
      console.log(chalk.gray("⏳ Waiting for you to login in the browser..."));
      console.log(
        chalk.gray(
          `   If your browser didn't open automatically, visit: ${chalk.cyan(
            sessionInfo.url,
          )}`,
        ),
      );
    },
  });

  console.log(chalk.green("✅ Successfully authenticated!"));
}
