// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const prompts = require("prompts");

function shouldIRun(message) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return prompts({
    type: "select",
    name: "yes",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    message,
    choices: [
      { title: "Yes", value: true },
      { title: "No (skip)", value: false },
    ],
    initial: 0,
  });
}

module.exports = {
  shouldIRun,
};
