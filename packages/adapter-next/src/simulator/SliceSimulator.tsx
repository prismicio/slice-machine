"use client";

import * as React from "react";

import { compressToEncodedURIComponent } from "lz-string";
import {
	SimulatorManager,
	StateEventType,
	getDefaultMessage,
	SliceSimulatorProps as BaseSliceSimulatorProps,
	SliceSimulatorState,
	getDefaultSlices,
	disableEventHandler,
	getDefaultProps,
	onClickHandler,
	simulatorClass,
	simulatorRootClass,
} from "@prismicio/simulator/kit";

const STATE_PARAMS_KEY = "state";
const SERVER_REVALIDATE_THROTTLE_DELAY = 300;

const throttle =
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	<TArgs extends [...any]>(fn: (...args: TArgs) => unknown, wait: number) => {
		let timeoutId: ReturnType<typeof setTimeout>;
		let lastCallTime = 0;

		return async (...args: TArgs) => {
			clearTimeout(timeoutId);

			const now = Date.now();
			const timeSinceLastCall = now - lastCallTime;
			const delayForNextCall = wait - timeSinceLastCall;

			if (delayForNextCall <= 0) {
				lastCallTime = now;
				fn(...args);
			} else {
				timeoutId = setTimeout(() => {
					lastCallTime = Date.now();
					fn(...args);
				}, delayForNextCall);
			}
		};
	};

const simulatorManager = new SimulatorManager();

export type SliceSimulatorSliceZoneProps = {
	slices: SliceSimulatorState["slices"];
};

export type SliceSimulatorProps = Omit<BaseSliceSimulatorProps, "state"> & {
	/**
	 * React component to render simulated Slices.
	 *
	 * @example
	 *
	 * ```tsx
	 * import { SliceSimulator } from "@slicemachine/adapter-next/simulator";
	 * import { SliceZone } from "@prismicio/react";
	 *
	 * import { components } from "../slices";
	 *
	 * <SliceSimulator
	 * 	sliceZone={({ slices }) => (
	 * 		<SliceZone slices={slices} components={components} />
	 * 	)}
	 * />;
	 * ```
	 */
	sliceZone?: (props: SliceSimulatorSliceZoneProps) => JSX.Element;

	children: React.ReactNode;
	className?: string;

	/** @internal */
	__revalidatePath?: (path: string) => Promise<void>;
};

/**
 * Simulate slices in isolation. The slice simulator enables live slice
 * development in Slice Machine and live previews in the Page Builder.
 */
export const SliceSimulator = ({
	background,
	zIndex,
	className,
	sliceZone: SliceZoneComp,
	children,
	__revalidatePath,
}: SliceSimulatorProps): JSX.Element => {
	const isServerComponent = Boolean(__revalidatePath);

	if (isServerComponent && SliceZoneComp) {
		throw new Error(
			"The sliceZone prop should not be used when <SliceSimulator> is rendered in a Server Component. Use the getSlices helper or convert your simulator to a Client Component.",
		);
	}

	if (!isServerComponent && !SliceZoneComp) {
		throw new Error(
			"A sliceZone prop must be provided when <SliceZone> is rendered in a Client Component. Add a sliceZone prop or convert your simulator to a Server Component with the getSlices helper.",
		);
	}

	const [slices, setSlices] = React.useState(() => getDefaultSlices());
	const [message, setMessage] = React.useState(() => getDefaultMessage());
	const throttledRevalidatePath = React.useRef(
		__revalidatePath
			? throttle(__revalidatePath, SERVER_REVALIDATE_THROTTLE_DELAY)
			: undefined,
	);

	const defaultProps = getDefaultProps();
	const hasSlices = slices.length > 0;

	React.useEffect(() => {
		simulatorManager.state.on(
			StateEventType.Slices,
			(newSlices) => {
				if (isServerComponent) {
					const url = new URL(window.location.href);
					url.searchParams.set(
						STATE_PARAMS_KEY,
						compressToEncodedURIComponent(JSON.stringify(newSlices)),
					);

					window.history.pushState(null, "", url);

					// A 0 ms timeout is needed to prevent a bug
					// where the path is revalidated before the URL
					// is updated with the new state.
					const path = window.location.pathname;
					setTimeout(() => throttledRevalidatePath.current?.(path), 0);
				}

				setSlices(newSlices);
			},
			"simulator-slices",
		);
		simulatorManager.state.on(
			StateEventType.Message,
			(newMessage) => setMessage(newMessage),
			"simulator-message",
		);

		simulatorManager.init();

		return () => {
			simulatorManager.state.off(StateEventType.Slices, "simulator-slices");
			simulatorManager.state.off(StateEventType.Message, "simulator-message");
		};
	}, []);

	return (
		<div
			className={[simulatorClass, className].filter(Boolean).join(" ")}
			style={{
				zIndex:
					typeof zIndex === "undefined"
						? defaultProps.zIndex
						: zIndex ?? undefined,
				position: "fixed",
				top: 0,
				left: 0,
				width: "100%",
				height: "100vh",
				overflow: "auto",
				background:
					typeof background === "undefined"
						? defaultProps.background
						: background ?? undefined,
			}}
		>
			{message ? (
				<article dangerouslySetInnerHTML={{ __html: message }} />
			) : hasSlices ? (
				<div
					id="root"
					className={simulatorRootClass}
					onClickCapture={onClickHandler as unknown as React.MouseEventHandler}
					onSubmitCapture={
						disableEventHandler as unknown as React.FormEventHandler
					}
				>
					{SliceZoneComp ? <SliceZoneComp slices={slices} /> : children}
				</div>
			) : null}
		</div>
	);
};
