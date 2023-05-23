import * as t from "io-ts";
import { HookError } from "@slicemachine/plugin-kit";
import fetch from "../../lib/fetch";

import { DecodeError } from "../../lib/DecodeError";
import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { castArray } from "../../lib/castArray";
import { decode } from "../../lib/decode";
import { decodeHookResult } from "../../lib/decodeHookResult";
import { functionCodec } from "../../lib/functionCodec";
import { markdownToHTML } from "../../lib/markdownToHTML";

import { UnexpectedDataError } from "../../errors";

import { BaseManager } from "../BaseManager";

const sliceSimulatorSetupStepCodec = t.intersection([
	t.type({
		title: t.string,
		body: t.string,
	}),
	t.partial({
		description: t.string,
		validate: functionCodec,
	}),
]);

const SliceSimulatorSetupStepValidationMessageCodec = t.type({
	title: t.string,
	message: t.string,
});
type SliceSimulatorSetupStepValidationMessageCodec = t.TypeOf<
	typeof SliceSimulatorSetupStepValidationMessageCodec
>;

export type SimulatorManagerReadSliceSimulatorSetupStep = {
	title: string;
	description?: string;
	body: string;
	/**
	 * Determines if the step is completed.
	 *
	 * This proeprty is `undefined` if the project's adapter does not provide a
	 * validation function for the step; we cannot know if the step is complete
	 * without a validator.
	 */
	isComplete: boolean | undefined;
	validationMessages: SliceSimulatorSetupStepValidationMessageCodec[];
};

export type SimulatorManagerReadSliceSimulatorSetupStepsReturnType = {
	steps: SimulatorManagerReadSliceSimulatorSetupStep[];
	errors: (DecodeError | HookError)[];
};

export class SimulatorManager extends BaseManager {
	async getLocalSliceSimulatorURL(): Promise<string | undefined> {
		const sliceMachineConfig = await this.project.getSliceMachineConfig();

		return sliceMachineConfig.localSliceSimulatorURL;
	}

	/**
	 * @throws {@link UnexpectedDataError} Thrown if the project is not configured
	 *   with a Slice Simulator URL.
	 */
	async checkIsLocalSliceSimulatorURLAccessible(): Promise<boolean> {
		const localSliceSimulatorURL = await this.getLocalSliceSimulatorURL();

		if (!localSliceSimulatorURL) {
			throw new UnexpectedDataError(
				"The project has not been configured with a Slice Simulator URL. Add a `localSliceSimulatorURL` property to your project's configuration to fix this error.",
			);
		}

		const res = await fetch(localSliceSimulatorURL);

		return res.ok;
	}

	async readSliceSimulatorSetupSteps(): Promise<SimulatorManagerReadSliceSimulatorSetupStepsReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"slice-simulator:setup:read",
			undefined,
		);
		const { data, errors } = decodeHookResult(
			t.array(sliceSimulatorSetupStepCodec),
			hookResult,
		);

		const steps = await Promise.all(
			data[0].map(async (step) => {
				const bodyHTML = await markdownToHTML(step.body);

				const res: SimulatorManagerReadSliceSimulatorSetupStep = {
					title: step.title,
					description: step.description,
					body: bodyHTML,
					isComplete: undefined,
					validationMessages: [],
				};

				if (step.validate) {
					const validationResult = await step.validate();
					const { value: validationMessages, error } = decode(
						t.array(SliceSimulatorSetupStepValidationMessageCodec),
						validationResult == null ? [] : castArray(validationResult),
					);

					if (error) {
						// TODO: We may want to do
						// something with the error,
						// like log to the console.
						// This branch should only be
						// reached if the adapter
						// returns invalid data.

						return res;
					}

					const isComplete = validationMessages.length < 1;

					const processedValidationMessages = await Promise.all(
						validationMessages.map(async (validationMessage) => {
							const messageHTML = await markdownToHTML(
								validationMessage.message,
							);

							return {
								...validationMessage,
								message: messageHTML,
							};
						}),
					);

					res.isComplete = isComplete;
					res.validationMessages = processedValidationMessages;
				}

				return res;
			}),
		);

		return {
			steps,
			errors,
		};
	}

	supportsSliceSimulator(): boolean {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hooks = this.sliceMachinePluginRunner.hooksForType(
			"slice-simulator:setup:read",
		);

		return hooks.length > 0;
	}
}
