import { SliceSimulator } from "@slicemachine/adapter-next/simulator";
import { SliceZone } from "@prismicio/react";

import { components } from "../slices";

const SliceSimulatorPage = () => {
  return (
    <SliceSimulator
      background="#000000"
      sliceZone={(props) => <SliceZone {...props} components={components}/>}
    />
  );
};

export default SliceSimulatorPage;
