"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

import {
	SliceSimulatorProps as BaseSliceSimulatorProps,
	SimulatorManager,
	SliceSimulatorState,
	StateEventType,
	getDefaultMessage,
	getDefaultSlices,
} from "@prismicio/simulator/kit";

import { SliceSimulatorWrapper } from "./SliceSimulatorWrapper";

export type SliceSimulatorSliceZoneProps = {
	slices: SliceSimulatorState["slices"];
};

export type SliceSimulatorProps = Omit<BaseSliceSimulatorProps, "state"> & {
	/**
	 * React component to render simulated Slices. Recommended only in the Pages
	 * Router. If you are using the App Router, consider using the `children`
	 * method instead with the `getSlices()` helper.
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
	children?: ReactNode;
	className?: string;
};

/**
 * Simulate slices in isolation. The slice simulator enables live slice
 * development in Slice Machine and live previews in the Page Builder.
 */
export const SliceSimulator = ({
	sliceZone: SliceZoneComp,
	background,
	zIndex,
	className,
}: SliceSimulatorProps): JSX.Element => {
	const simulatorManager = useRef(new SimulatorManager());
	const [slices, setSlices] = useState(() => getDefaultSlices());
	const [message, setMessage] = useState(() => getDefaultMessage());

	useEffect(() => {
		simulatorManager.current.state.on(
			StateEventType.Slices,
			(newSlices) => setSlices(newSlices),
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
			{SliceZoneComp ? <SliceZoneComp slices={slices} /> : null}
		</SliceSimulatorWrapper>
	);
};
