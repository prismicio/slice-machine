import { Link } from "theme-ui";
import { SetupStepperConfiguration } from "./common";
import { DefaultStepCompProps } from "./common";

const LinkToSb = ({ linkToStorybookDocs }: DefaultStepCompProps) => (
  <>
    Slice Simulator does not support your framework yet.
    <br />
    You can{" "}
    <Link target="_blank" href={linkToStorybookDocs}>
      install Storybook
    </Link>{" "}
    instead.
  </>
);

const Unsupported: SetupStepperConfiguration = {
  steps: [LinkToSb],
  excerpts: [
    { title: "Framework not supported", excerpt: "Install Storybook instead." },
  ],
};

export default Unsupported;
