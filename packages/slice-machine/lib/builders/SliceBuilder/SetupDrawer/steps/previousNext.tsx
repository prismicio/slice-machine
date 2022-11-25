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
import SliceZone from "next-slicezone";

import * as Slices from "../slices";
const resolver = ({ sliceName }) => Slices[sliceName];

const SliceSimulatorPage = () => (<SliceSimulator
\t// The \`sliceZone\` prop should be a function receiving slices and rendering them using your \`SliceZone\` component.
\tsliceZone={(props) => <SliceZone {...props} resolver={resolver} />}
\tstate={{}}
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
    code: `npm install --save next-slicezone prismic-reactjs @prismicio/slice-simulator-react`,
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
