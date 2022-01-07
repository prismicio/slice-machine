import { Frameworks } from "@slicemachine/core/build/src/models";

import { steps as nuxtSteps } from "./nuxt";
import { steps as nextSteps } from "./next";
import { DefaultStepCompProps } from "@builders/SliceBuilder/SetupDrawer/steps/common";

export const getStepByFramework = (
  framework: Frameworks
): React.FunctionComponent<DefaultStepCompProps>[] => {
  switch (framework) {
    case Frameworks.nuxt:
      return nuxtSteps;
    case Frameworks.next:
      return nextSteps;
    default:
      return [];
  }
};
