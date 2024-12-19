import { useMediaQuery } from "@prismicio/editor-ui";

import { useUpdateAvailable } from "@/hooks/useUpdateAvailable";

import { SharedOnboardingGuide } from "./SharedOnboardingGuide";
import { useSharedOnboardingExperiment } from "./useSharedOnboardingExperiment";

export function OnboardingGuide() {
  const isVisible = useIsOnboardingGuideVisible();
  const isSharedExperimentEligible = useSharedOnboardingExperiment().eligible;

  return isVisible && isSharedExperimentEligible ? (
    <SharedOnboardingGuide />
  ) : null;
}

function useIsOnboardingGuideVisible() {
  const isMediaQueryVisible = useMediaQuery({ min: "medium" });
  const updates = useUpdateAvailable();

  return (
    isMediaQueryVisible &&
    !updates.sliceMachineUpdateAvailable &&
    !updates.adapterUpdateAvailable
  );
}
