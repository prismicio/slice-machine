import chalk from "chalk";
import ora from "ora";

export const purple = chalk.hex("8c76fc");
export const error = chalk.hex("FF6868");
export const warning = chalk.hex("F3AD38");
export const underline = chalk.underline;
export const bold = chalk.bold;
export const dim = chalk.dim;
export const cyan = chalk.cyan;
export const yellow = chalk.yellow;
export const white = chalk.white;

export const spinner = ora;

export const writeError = (msg: string, prefix = "Error!"): void =>
  console.error(`${error(prefix)} ${msg}`);

export const writeWarning = (msg: string, prefix = "Warning!"): void =>
  console.warn(`${warning(prefix)} ${msg}`);

export const writeCheck = (msg: string): void => {
  ora().succeed(msg); // using the same check as Ora for coherence
};

export const writeInfo = (msg: string): void => {
  console.log(`${yellow("ℹ")} ${dim(msg)}`);
};
