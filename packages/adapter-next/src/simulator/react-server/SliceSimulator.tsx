"use client";

import { useEffect, useRef, useState } from "react";
import {
	SliceSimulatorProps as BaseSliceSimulatorProps,
	SimulatorManager,
	StateEventType,
	getDefaultMessage,
} from "@prismicio/simulator/kit";
import { compressToEncodedURIComponent } from "lz-string";

import { SliceSimulatorWrapper } from "../SliceSimulatorWrapper";
import { revalidateData } from "./actions";
import { getSlices } from "./getSlices";

const STATE_PARAMS_KEY = "state";

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
	const simulatorManager = useRef(new SimulatorManager());
	const [message, setMessage] = useState(() => getDefaultMessage());

	const state =
		typeof window !== "undefined"
			? new URL(window.location.href).searchParams.get(STATE_PARAMS_KEY)
			: undefined;
	const hasSlices = getSlices(state).length > 0;

	useEffect(() => {
		simulatorManager.current.state.on(
			StateEventType.Slices,
			(newSlices) => {
				const url = new URL(window.location.href);
				url.searchParams.set(
					STATE_PARAMS_KEY,
					compressToEncodedURIComponent(JSON.stringify(newSlices)),
				);
				window.history.pushState(null, "", url);

				const path = window.location.pathname;
				requestIdleCallback(() => revalidateData(path), { timeout: 100 });
			},
			"simulator-slices",
		);
		simulatorManager.current.state.on(
			StateEventType.Message,
			(newMessage) => setMessage(newMessage),
			"simulator-message",
		);

		simulatorManager.current.init();

		return () => {
			simulatorManager.current.state.off(
				StateEventType.Slices,
				"simulator-slices",
			);
			simulatorManager.current.state.off(
				StateEventType.Message,
				"simulator-message",
			);
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
