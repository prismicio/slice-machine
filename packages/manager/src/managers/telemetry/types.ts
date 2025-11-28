export type { Variant } from "@amplitude/experiment-node-server";

export const SegmentEventType = {
	experiment_exposure: "experiment:exposure",
	prismic_cli_init_start: "prismic-cli:init:start",
	prismic_cli_init_end: "prismic-cli:init:end",
	prismic_cli_sync_start: "prismic-cli:sync:start",
	prismic_cli_sync_end: "prismic-cli:sync:end",
} as const;
type SegmentEventTypes =
	(typeof SegmentEventType)[keyof typeof SegmentEventType];

export const HumanSegmentEventType = {
	[SegmentEventType.experiment_exposure]: "$exposure",
	[SegmentEventType.prismic_cli_init_start]: "Prismic CLI Init Start",
	[SegmentEventType.prismic_cli_init_end]: "Prismic CLI Init End",
	[SegmentEventType.prismic_cli_sync_start]: "Prismic CLI Sync Start",
	[SegmentEventType.prismic_cli_sync_end]: "Prismic CLI Sync End",
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

type PrismicCLIInitStartSegmentEvent = SegmentEvent<
	typeof SegmentEventType.prismic_cli_init_start
>;

type PrismicCLIInitEndSegmentEvent = SegmentEvent<
	typeof SegmentEventType.prismic_cli_init_end
>;

type PrismicCLISyncStartSegmentEvent = SegmentEvent<
	typeof SegmentEventType.prismic_cli_sync_start
>;

type PrismicCLISyncEndSegmentEvent = SegmentEvent<
	typeof SegmentEventType.prismic_cli_sync_end
>;

export type SegmentEvents =
	| ExperimentExposure
	| PrismicCLIInitStartSegmentEvent
	| PrismicCLIInitEndSegmentEvent
	| PrismicCLISyncStartSegmentEvent
	| PrismicCLISyncEndSegmentEvent;
