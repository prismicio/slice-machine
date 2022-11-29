import {
  InstallSliceSimulator,
  CreatePage,
  UpdateSmJson,
  SetupStepperConfiguration,
} from "./common";
import { Text } from "theme-ui";

const CreatePageInstructions = {
  code: `import { SliceSimulator } from "@prismicio/slice-simulator-react";
import { SliceZone } from "@prismicio/react";

import state from "../.slicemachine/libraries-state.json";
import { components } from "../slices";

const SliceSimulatorPage = () => (<SliceSimulator
  // The "sliceZone" prop should be a function receiving slices and rendering them using your "SliceZone" component.
  sliceZone={(props) => <SliceZone {...props} components={components} />}
  state={state}
/>);

export default SliceSimulatorPage;`,
  instructions: (
    <>
      In your “pages” directory, create a file called{" "}
      <Text as="code" variant="styles.inlineCode">
        slice-simulator.jsx
      </Text>{" "}
      and add the following code. This page is the route you hit to simulator
      and develop your components.
    </>
  ),
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
