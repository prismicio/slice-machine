import {
  InstallSliceSimulator,
  CreatePage,
  UpdateSmJson,
  CheckSetup,
  SetupStepperConfiguration,
} from "./common";
import { Text } from "theme-ui";
import { SetupStatus } from "@src/modules/simulator/types";

const CreatePageInstructions = {
  code: `import { SliceSimulator } from "@prismicio/slice-simulator-react";
import { SliceZone } from "@prismicio/react";

import state from "../.slicemachine/libraries-state.json";
import { components } from "../slices/components";

const SliceSimulatorPage = () => (<SliceSimulator
  // The "sliceZone" prop should be a function receiving slices and rendering them using your "SliceZone" component.
  sliceZone={(props) => <SliceZone {...props} components={components} />}
  state={state}
/>);

export default SliceSimulatorPage;`,
  instructions: (
    <>
      In your “pages” directory, create a file called{" "}
      <Text variant={"pre"}>slice-simulator.jsx</Text> and add the following
      code. This page is the route you hit to simulator and develop your
      components.
    </>
  ),
};

const steps = [
  InstallSliceSimulator({
    code: `npm install --save @prismicio/react @prismicio/slice-simulator-react`,
  }),
  CreatePage(CreatePageInstructions),
  UpdateSmJson({}),
  CheckSetup({}),
];

const getStepNumberWithErrors = (setupStatus: SetupStatus) => [
  ...(setupStatus.dependencies === "ko" ? ["1"] : []),
  ...(setupStatus.iframe === "ko" ? ["2"] : []),
  ...(setupStatus.manifest === "ko" ? ["3"] : []),
];

const NextStepper: SetupStepperConfiguration = {
  steps,
  getStepNumberWithErrors,
};

export default NextStepper;
