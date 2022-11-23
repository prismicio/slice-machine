export type SliceMachineInitProcessOptions = { input: string[] } & Record<
	string,
	unknown
>;

export const createSliceMachineInitProcess = (
	options: SliceMachineInitProcessOptions
): SliceMachineInitProcess => {
	return new SliceMachineInitProcess(options);
};

export class SliceMachineInitProcess {
	private _options: SliceMachineInitProcessOptions;

	constructor(options: SliceMachineInitProcessOptions) {
		this._options = options;
	}

	async run(): Promise<void> {
		console.log("run!");
	}
}
