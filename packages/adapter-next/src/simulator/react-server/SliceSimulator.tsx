// This `<SliceSimulator>` is only accessible from Server Components.

"use client";

import { FC, useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import {
	SliceSimulatorProps as BaseSliceSimulatorProps,
	SimulatorManager,
	StateEventType,
	getDefaultMessage,
} from "@prismicio/simulator/kit";
import { compressToEncodedURIComponent } from "lz-string";

import { SliceSimulatorWrapper } from "../SliceSimulatorWrapper";
import { getSlices } from "./getSlices";

const STATE_PARAMS_KEY = "state";

const simulatorManager = new SimulatorManager();

export type SliceSimulatorProps = Omit<BaseSliceSimulatorProps, "state"> & {
	children: React.ReactNode;
	className?: string;
};

export const SliceSimulator: FC<SliceSimulatorProps> = ({
	children,
	background,
	zIndex,
	className,
}) => {
	const [message, setMessage] = useState(() => getDefaultMessage());
	const router = useRouter();

	const state =
		typeof window !== "undefined"
			? new URL(window.location.href).searchParams.get(STATE_PARAMS_KEY)
			: undefined;
	const hasSlices = getSlices(state).length > 0;

	useEffect(() => {
		simulatorManager.state.on(
			StateEventType.Slices,
			(newSlices) => {
				const url = new URL(window.location.href);
				url.searchParams.set(
					STATE_PARAMS_KEY,
					compressToEncodedURIComponent(JSON.stringify(newSlices)),
				);

				window.history.replaceState(null, "", url);
				// Wait until the next tick to prevent URL state race conditions.
				setTimeout(() => router.refresh(), 0);
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
