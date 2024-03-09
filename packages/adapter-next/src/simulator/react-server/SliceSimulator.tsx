// This `<SliceSimulator>` is only accessible from Server Components.

"use client";

import * as React from "react";

import {
	SliceSimulatorProps as BaseSliceSimulatorProps,
	SimulatorManager,
	StateEventType,
	getDefaultMessage,
} from "@prismicio/simulator/kit";
import { compressToEncodedURIComponent } from "lz-string";

import { SliceSimulatorWrapper } from "../SliceSimulatorWrapper";
import { revalidatePath } from "./actions";
import { getSlices } from "./getSlices";

const STATE_PARAMS_KEY = "state";

const throttle =
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	<TArgs extends [...any]>(fn: (...args: TArgs) => unknown, wait: number) => {
		let timeoutId: ReturnType<typeof setTimeout>;
		let lastCallTime = 0;

		return (...args: TArgs) => {
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
const throttledRevalidatePath = throttle(revalidatePath, 300);

const simulatorManager = new SimulatorManager();

export type SliceSimulatorProps = Omit<BaseSliceSimulatorProps, "state"> & {
	children: React.ReactNode;
	className?: string;
};

export const SliceSimulator = ({
	children,
	background,
	zIndex,
	className,
}: SliceSimulatorProps): JSX.Element => {
	const [message, setMessage] = React.useState(() => getDefaultMessage());

	const state =
		typeof window !== "undefined"
			? new URL(window.location.href).searchParams.get(STATE_PARAMS_KEY)
			: undefined;
	const hasSlices = getSlices(state).length > 0;

	React.useEffect(() => {
		simulatorManager.state.on(
			StateEventType.Slices,
			(newSlices) => {
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
				setTimeout(() => throttledRevalidatePath(path), 0);
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
		<SliceSimulatorWrapper
			message={message}
			hasSlices={hasSlices}
			background={background}
			zIndex={zIndex}
			className={className}
		>
			{children}
		</SliceSimulatorWrapper>
	);
};
