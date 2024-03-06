"use client";

import { useEffect, useRef, useState } from "react";
import {
	SliceSimulatorProps as BaseSliceSimulatorProps,
	SimulatorManager,
	StateEventType,
	getDefaultMessage,
	getDefaultSlices,
} from "@prismicio/simulator/kit";

import { SliceSimulatorWrapper } from "../SliceSimulatorWrapper";
import { persistSlices } from "./actions";

const SESSION_SEARCH_PARAM_KEY = "session";

const debounce =
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	<TArgs extends [...any]>(
		callback: (...args: TArgs) => void,
		wait: number,
	) => {
		let timeoutId: ReturnType<typeof setTimeout>;

		return (...args: TArgs) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => callback(...args), wait);
		};
	};
const debouncedPersistSlices = debounce(persistSlices, 500);

const getSessionID = () => {
	const sessionID = new URL(window.location.href).searchParams.get(
		SESSION_SEARCH_PARAM_KEY,
	);

	if (sessionID) {
		return sessionID;
	}

	const newSessionID = window.crypto
		.getRandomValues(new BigUint64Array(1))[0]
		.toString();

	const url = new URL(window.location.href);
	url.searchParams.set(SESSION_SEARCH_PARAM_KEY, newSessionID);
	window.history.replaceState({}, "", url);

	return newSessionID;
};

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
	const [slices, setSlices] = useState(() => getDefaultSlices());
	const [message, setMessage] = useState(() => getDefaultMessage());

	useEffect(() => {
		getSessionID();

		simulatorManager.current.state.on(
			StateEventType.Slices,
			(newSlices) => {
				const sessionID = getSessionID();

				process.env.NODE_ENV === "development"
					? persistSlices(sessionID, newSlices)
					: debouncedPersistSlices(sessionID, newSlices);

				setSlices(newSlices);
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
			hasSlices={slices.length > 0}
			background={background}
			zIndex={zIndex}
			className={className}
		>
			{children}
		</SliceSimulatorWrapper>
	);
};
