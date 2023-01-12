import { SliceSimulator } from "@prismicio/slice-simulator-react";
import { SliceZone } from "@prismicio/react";

import { components } from "../slices";

const SliceSimulatorPage = () => (
  <SliceSimulator
    // The "sliceZone" prop should be a function receiving slices and rendering them using your "SliceZone" component.
    sliceZone={(props) => <SliceZone {...props} components={components} />}
    state={{}}
  />
);

export default SliceSimulatorPage;
