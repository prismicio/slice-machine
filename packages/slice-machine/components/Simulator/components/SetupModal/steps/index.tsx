import { Frameworks } from "@slicemachine/core/build/models";

import NextSetupStepperConfiguration from "./next";
import NuxtSetupStepperConfiguration from "./nuxt";
import PreviousNextStepperConfiguration from "./previousNext";
import PreviousNuxtSetupStepperConfiguration from "./previousNuxt";
import Unsupported from "./unsupported";

import { SetupStepperConfiguration } from "./common";

export const getStepperConfigurationByFramework = (
  framework: Frameworks
): SetupStepperConfiguration => {
  switch (framework) {
    case Frameworks.nuxt:
      return NuxtSetupStepperConfiguration;
    case Frameworks.next:
      return NextSetupStepperConfiguration;
    case Frameworks.previousNext:
      return PreviousNextStepperConfiguration;
    case Frameworks.previousNuxt:
      return PreviousNuxtSetupStepperConfiguration;
    default:
      return Unsupported;
  }
};
