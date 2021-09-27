/** https://github.com/storybookjs/storybook/blob/main/lib/node-logger/src/index.ts */

import npmLog from "npmlog";
import chalk from "chalk";

export const colors = {
  pink: chalk.hex("F1618C"),
  purple: chalk.hex("B57EE5"),
  orange: chalk.hex("F3AD38"),
  green: chalk.hex("A2E05E"),
  blue: chalk.hex("6DABF5"),
  red: chalk.hex("F16161"),
  gray: chalk.gray,
};

export const logger = {
  info: (message: string): void => npmLog.info("", message),
  plain: (message: string): void => console.log(message),
  line: (count = 1): void => console.log(`${Array(count - 1).fill("\n")}`),
  warn: (message: string): void => npmLog.warn("", message),
  error: (message: string): void => npmLog.error("", message),
  setLevel: (level = "info"): void => {
    npmLog.level = level;
  },
};

export { npmLog as instance };
