import chalk from "chalk";

import { version as pkgVersion } from "../../package.json";

export function displayHeader(): void {
	console.info(
		chalk.cyan.bold("┌" + "─".repeat(48) + "┐\n") +
			chalk.white("  Prismic ") +
			chalk.gray(`v${pkgVersion}\n`) +
			chalk.cyan.bold("└" + "─".repeat(48) + "┘\n"),
	);
}

export function displaySuccess(message: string, context?: string): void {
	console.info("\n" + chalk.green.bold("✓ Success"));
	console.info(chalk.green("─".repeat(50)));
	console.info(chalk.green(message));
	if (context) {
		console.info(chalk.gray(context + "\n"));
	} else {
		console.info();
	}
}

export function displayError(error: unknown): void {
	const errorMessage = error instanceof Error ? error.message : String(error);
	const errorStack =
		error instanceof Error && error.stack ? error.stack : undefined;

	console.error("\n" + chalk.red.bold("✕ Error"));
	console.error(chalk.red("─".repeat(50)));
	console.error(chalk.red(errorMessage) + "\n");

	if (errorStack) {
		console.error(chalk.gray("Stack trace:"));
		console.error(chalk.gray(errorStack) + "\n");
	}

	console.error(
		chalk.gray("─".repeat(50)) +
			chalk.gray("\nNeed help?") +
			chalk.white("\n  • Documentation: https://prismic.io/docs") +
			chalk.white("\n  • Raise an issue: https://community.prismic.io\n"),
	);
}
