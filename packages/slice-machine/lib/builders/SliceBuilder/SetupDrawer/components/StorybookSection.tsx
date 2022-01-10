import React from "react";
import { Link } from "theme-ui";
import Section from "./Section";

const StorybookSection: React.FC<{
  linkToStorybookDocs: string;
}> = ({ linkToStorybookDocs }) => (
  <Section heading="Already using Storybook">
    Want to still use Storybook for your project? You can check the{" "}
    <Link target={"_blank"} href={linkToStorybookDocs}>
      documentation
    </Link>{" "}
    for more info to update your configuration.
  </Section>
);

export default StorybookSection;
