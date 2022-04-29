import { SliceSimulator } from "@prismicio/slice-simulator-react";
import { SliceZone } from "@prismicio/react";

import { components as ecommerceComponents } from '../slices/ecommerce/index'
import { components as marketingComponents } from '../slices/marketing/index'
import { components as navigationComponents } from '../slices/navigation/index'

const __allComponents = {  ...ecommerceComponents, ...marketingComponents, ...navigationComponents }

import state from "../.slicemachine/libraries-state.json";

const SliceSimulatorPage = () => {
  return (
    <SliceSimulator
      sliceZone={({ slices }) => (
        <SliceZone slices={slices} components={__allComponents} />
      )}
      state={state}
    />
  );
};

export default SliceSimulatorPage;