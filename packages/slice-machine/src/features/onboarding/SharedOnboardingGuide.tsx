import { OnboardingGuide } from "@prismicio/editor-fields";

import { telemetry } from "@/apiClient";

import { useOnboarding } from "./useOnboarding";

export function SharedOnboardingGuide() {
  const { onboarding, toggleStep, toggleGuide } = useOnboarding();

  if (!onboarding) return null;

  return (
    <OnboardingGuide
      tracking={{
        track: (args) => telemetry.track({ ...args, source: "SliceMachine" }),
        source: "SliceMachine",
      }}
      onboardingState={onboarding}
      onToggleStep={toggleStep}
      onToggleGuide={toggleGuide}
    />
  );
}
