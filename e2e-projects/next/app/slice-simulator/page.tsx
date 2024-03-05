import { SliceZone } from "@prismicio/react";
import {
  SliceSimulator,
  SliceSimulatorParams,
  getSlices,
} from "@slicemachine/adapter-next/simulator";

import { components as ecommerceComponents } from "../../slices/ecommerce/index";
import { components as marketingComponents } from "../../slices/marketing/index";
import { components as navigationComponents } from "../../slices/navigation/index";

const components = {
  ...ecommerceComponents,
  ...marketingComponents,
  ...navigationComponents,
};

export default async function SliceSimulatorPage({
  searchParams,
}: SliceSimulatorParams) {
  const slices = await getSlices(searchParams.sessionID);

  return (
    <SliceSimulator>
      <SliceZone slices={slices} components={components} />
    </SliceSimulator>
  );
}
