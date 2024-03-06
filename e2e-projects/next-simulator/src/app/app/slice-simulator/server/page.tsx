import {
  SliceSimulator,
  SliceSimulatorParams,
  getSlices,
} from "@slicemachine/adapter-next/simulator";
import { SliceZone } from "@prismicio/react";

import { components } from "@/slices";

export const runtime = "nodejs";

export default async function SliceSimulatorPage({
  searchParams,
}: SliceSimulatorParams) {
  const slices = await getSlices(searchParams.session);

  return (
    <SliceSimulator>
      <SliceZone slices={slices} components={components} />
    </SliceSimulator>
  );
}
