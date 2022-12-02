import * as t from "io-ts";
import {
	HookError,
	SliceSimulatorSetupStepValidationMessageType,
} from "@slicemachine/plugin-kit";

import { DecodeError } from "../lib/DecodeError";
import { assertPluginsInitialized } from "../lib/assertPluginsInitialized";
import { castArray } from "../lib/castArray";
import { decode } from "../lib/decode";
import { decodeHookResult } from "../lib/decodeHookResult";
import { functionCodec } from "../lib/functionCodec";

import { BaseManager } from "./_BaseManager";
import { markdownToHTML } from "../lib/markdownToHTML";

const sliceSimulatorSetupStepCodec = t.intersection([
	t.type({
		title: t.string,
		body: t.string,
	}),
	t.partial({
		validate: functionCodec,
	}),
]);

const SliceSimulatorSetupStepValidationMessageCodec = t.type({
	type: t.union([
		// This list should contain every value from
		// `SliceSimulatorSetupStepValidationMessageType`.
		t.literal(SliceSimulatorSetupStepValidationMessageType.Error),
		t.literal(SliceSimulatorSetupStepValidationMessageType.Warning),
	]),
	title: t.string,
	message: t.string,
});
type SliceSimulatorSetupStepValidationMessageCodec = t.TypeOf<
	typeof SliceSimulatorSetupStepValidationMessageCodec
>;

export type SimulatorManagerReadSliceSimulatorSetupStep = {
	title: string;
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

					const isComplete = !validationMessages.some((validationMessage) => {
						return (
							validationMessage.type ===
							SliceSimulatorSetupStepValidationMessageType.Error
						);
					});

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
}
