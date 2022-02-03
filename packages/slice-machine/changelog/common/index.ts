import prompts from "prompts";

export function shouldIRun(message: string): Promise<{ yes: boolean }> {
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
