import {
  InstallSlicePreview,
  CreatePage,
  UpdateSmJson,
  CheckSetup,
} from "./common";
import { Text } from "theme-ui";

const CreatePageInstructions = {
  code: `import { SliceCanvasRenderer } from "@prismicio/slice-canvas-renderer-react";
import SliceZone from "next-slicezone";

import state from "../.slicemachine/libraries-state.json";

import * as Slices from "../slices";
const resolver = ({ sliceName }) => Slices[sliceName];

const SlicePreview = () => (<SliceCanvasRenderer
\t// The \`sliceZone\` prop should be a function receiving slices and rendering them using your \`SliceZone\` component.
\tsliceZone={(props) => <SliceZone {...props} resolver={resolver} />}
\tstate={state}
/>);

export default SlicePreview;`,
  instructions: (
    <>
      In your “pages” directory, create a file called{" "}
      <Text variant={"pre"}>_preview.jsx</Text> and add the following code. This
      page is the route you hit to preview and develop your components.
    </>
  ),
};

export const steps = [
  InstallSlicePreview({
    code: `npm install --save next-slicezone prismic-reactjs @prismicio/slice-canvas-renderer-react`,
  }),
  CreatePage(CreatePageInstructions),
  UpdateSmJson({}),
  CheckSetup({}),
];
