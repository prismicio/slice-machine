const prompts = require("prompts");

function shouldIRun(message) {
  return prompts({
    type: "select",
    name: "yes",
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
