import prompts from "prompts";

type promptArgs<
	TValue = unknown,
	TProperty extends string = string
> = prompts.PromptObject<TProperty> & {
	// Method is available, cf. docs
	onRender?: (this: { msg: string; value?: TValue; initial?: TValue }) => void;
};

export const prompt = async <TReturn, TProperty extends string = string>(
	question: promptArgs<TReturn, TProperty>
): Promise<Record<TProperty, TReturn>> => {
	const answers: Record<TProperty, TReturn> = await prompts<TProperty>(
		question
	);

	if (!Object.keys(answers).length) {
		process.exit(130);
	}

	// Clear prompt line, clean recap are done manually
	process.stdout.moveCursor(0, -1);
	process.stdout.clearLine(1);

	return answers;
};
