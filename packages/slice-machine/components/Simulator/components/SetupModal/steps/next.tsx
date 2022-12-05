import {
  InstallSliceSimulator,
  CreatePage,
  UpdateSmJson,
  SetupStepperConfiguration,
} from "./common";

const CreatePageInstructions = {
  code: `import { SliceSimulator } from "@prismicio/slice-simulator-react";
import { SliceZone } from "@prismicio/react";

import state from "../.slicemachine/libraries-state.json";
import { components } from "../slices";

const SliceSimulatorPage = () => (
  <SliceSimulator
    sliceZone={({ slices }) => (
      <SliceZone slices={slices} components={components} />
    )}
    state={state}
  />
);

export default SliceSimulatorPage;`,
};

const steps = [
  InstallSliceSimulator({
    code: `npm install --save @prismicio/react @prismicio/slice-simulator-react @prismicio/client@latest @prismicio/helpers`,
  }),
  CreatePage(CreatePageInstructions),
  UpdateSmJson({}),
];

const NextStepper: SetupStepperConfiguration = {
  steps,
};

export default NextStepper;
