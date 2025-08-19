import { useMediaQuery } from "@prismicio/editor-ui";

import { useUpdateAvailable } from "@/hooks/useUpdateAvailable";

import { SharedOnboardingGuide } from "./SharedOnboardingGuide";

export function OnboardingGuide() {
  const isVisible = useIsOnboardingGuideVisible();

  if (!isVisible) return null;
  return <SharedOnboardingGuide />;
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
