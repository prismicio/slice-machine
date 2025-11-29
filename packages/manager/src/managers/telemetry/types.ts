export type { Variant } from "@amplitude/experiment-node-server";

export const SegmentEventType = {
	experiment_exposure: "experiment:exposure",
	prismic_cli_start: "prismic-cli:start",
	prismic_cli_end: "prismic-cli:end",
} as const;
type SegmentEventTypes =
	(typeof SegmentEventType)[keyof typeof SegmentEventType];

export const HumanSegmentEventType = {
	[SegmentEventType.experiment_exposure]: "$exposure",
	[SegmentEventType.prismic_cli_start]: "Prismic CLI Start",
	[SegmentEventType.prismic_cli_end]: "Prismic CLI End",
} as const;

export type HumanSegmentEventTypes =
	(typeof HumanSegmentEventType)[keyof typeof HumanSegmentEventType];

type SegmentEvent<
	TType extends SegmentEventTypes,
	TProperties extends Record<string, unknown> | void = void,
> = TProperties extends void
	? {
			event: TType;
			repository?: string;
		}
	: {
			event: TType;
			repository?: string;
		} & TProperties;

type ExperimentExposure = SegmentEvent<
	typeof SegmentEventType.experiment_exposure,
	{
		flag_key: string;
		variant: string;
	}
>;

type PrismicCLIStartSegmentEvent = SegmentEvent<
	typeof SegmentEventType.prismic_cli_start,
	{
		commandType: "init" | "sync";
		fullCommand: string;
	}
>;

type PrismicCLIEndSegmentEvent = SegmentEvent<
	typeof SegmentEventType.prismic_cli_end,
	{
		commandType: "init" | "sync";
		success: boolean;
		error?: string;
		fullCommand: string;
	}
>;

export type SegmentEvents =
	| ExperimentExposure
	| PrismicCLIStartSegmentEvent
	| PrismicCLIEndSegmentEvent;
