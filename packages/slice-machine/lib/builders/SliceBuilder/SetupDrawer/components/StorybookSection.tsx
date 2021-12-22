import React from "react";
import { Link } from "theme-ui";
import Section from "./Section";
import { Frameworks } from "@slicemachine/core/build/src/models/Framework";

function linkToDocsForFramework(framework: Frameworks): string {
  switch (framework) {
    case Frameworks.next:
      return "https://prismic.io/docs/technologies/storybook-nextjs";
    case Frameworks.nuxt:
      return "https://prismic.io/docs/technologies/use-storybook-nuxtjs";
    default:
      return "https://prismic.io/docs";
  }
}

const StorybookSection: React.FC<{
  framework: Frameworks;
}> = ({ framework }) => (
  <Section heading="Already using Storybook">
    Want to still use Storybook for your project? You can check the{" "}
    <Link href={linkToDocsForFramework(framework)}>documentation</Link> for more
    info to update your configuration.
  </Section>
);

export default StorybookSection;
