import {
  InstallSliceSimulator,
  CreatePage,
  UpdateSmJson,
  SetupStepperConfiguration,
} from "./common";
import { Text } from "theme-ui";
import {
  CreateRouteJsExcerpt,
  InstallExcerpt,
  UpdateSmJsonExcerpt,
} from "./excerpts";

const CreatePageInstructions = {
  code: `import { SliceSimulator } from "@prismicio/slice-simulator-react";
  import SliceZone from "next-slicezone";
  
  import state from "../.slicemachine/libraries-state.json";
  
  import * as Slices from "../slices";
  const resolver = ({ sliceName }) => Slices[sliceName];
  
  const SliceSimulatorPage = () => (<SliceSimulator
  \tsliceZone={(props) => <SliceZone {...props} resolver={resolver} />}
  \tstate={state}
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
];

const NextStepper: SetupStepperConfiguration = {
  steps,
  excerpts: [InstallExcerpt, CreateRouteJsExcerpt, UpdateSmJsonExcerpt],
};

export default NextStepper;
