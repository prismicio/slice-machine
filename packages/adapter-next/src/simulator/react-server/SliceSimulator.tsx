// This `<SliceSimulator>` is only accessible from Server Components.

"use client";

import {
	SliceSimulator as BaseSliceSimulator,
	SliceSimulatorProps,
} from "../SliceSimulator";
import { revalidatePath } from "./actions";

export const SliceSimulator = (props: SliceSimulatorProps): JSX.Element => {
	return <BaseSliceSimulator {...props} __revalidatePath={revalidatePath} />;
};
