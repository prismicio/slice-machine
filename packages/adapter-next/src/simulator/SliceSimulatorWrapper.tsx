import { ReactNode } from "react";
import {
	SliceSimulatorProps,
	disableEventHandler,
	getDefaultProps,
	onClickHandler,
	simulatorClass,
	simulatorRootClass,
} from "@prismicio/simulator/kit";

type SliceSimulatorWrapperProps = {
	children: ReactNode;
	className?: string;
	message?: string;
	hasSlices: boolean;
} & Omit<SliceSimulatorProps, "state">;

/**
 * A wrapper for the slice simulator that isolates the given children from the
 * page's layout.
 */
export const SliceSimulatorWrapper = ({
	className,
	children,
	zIndex,
	background,
	message,
	hasSlices,
}: SliceSimulatorWrapperProps): JSX.Element => {
	const defaultProps = getDefaultProps();

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
					{children}
				</div>
			) : null}
		</div>
	);
};
