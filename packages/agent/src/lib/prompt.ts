import prompts from "prompts";

export async function prompt<TReturn, TProperty extends string = string>(
  question: prompts.PromptObject<TProperty>,
): Promise<Record<TProperty, TReturn>> {
  const answers = await prompts<TProperty>(question);

  if (!Object.keys(answers).length) {
    process.exit(130); // User cancelled (Ctrl+C)
  }

  // Clear prompt line
  process.stdout.moveCursor?.(0, -1);
  process.stdout.clearLine?.(1);

  return answers;
}
