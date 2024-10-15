import { useMediaQuery } from "@prismicio/editor-ui";

import { useOnboardingExperiment } from "@/features/onboarding/useOnboardingExperiment";
import { useUpdateAvailable } from "@/hooks/useUpdateAvailable";

import { SharedOnboardingGuide } from "./SharedOnboardingGuide";
import { SliceMachineOnboardingGuide } from "./SliceMachineOnboardingGuide/SliceMachineOnboardingGuide";
import { useSharedOnboardingExperiment } from "./useSharedOnboardingExperiment";

export function OnboardingGuide() {
  const isVisible = useIsOnboardingGuideVisible();
  const isSharedExperimentEligible = useSharedOnboardingExperiment().eligible;

  if (!isVisible) return null;
  if (isSharedExperimentEligible) return <SharedOnboardingGuide />;
  return <SliceMachineOnboardingGuide />;
}

function useIsOnboardingGuideVisible() {
  const isMediaQueryVisible = useMediaQuery({ min: "medium" });
  const isExperimentEligible = useOnboardingExperiment().eligible;
  const updates = useUpdateAvailable();

  return (
    isMediaQueryVisible &&
    isExperimentEligible &&
    !updates.sliceMachineUpdateAvailable &&
    !updates.adapterUpdateAvailable
  );
}
