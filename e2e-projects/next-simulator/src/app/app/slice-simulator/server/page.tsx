import {
  SliceSimulator,
  SliceSimulatorParams,
  getSlices,
} from "@slicemachine/adapter-next/simulator";
import { SliceZone } from "@prismicio/react";

import { components } from "@/slices";

export default async function SliceSimulatorPage({
  searchParams,
}: SliceSimulatorParams) {
  return (
    <SliceSimulator>
      <SliceZone
        slices={getSlices(searchParams.state)}
        components={components}
      />
    </SliceSimulator>
  );
}
