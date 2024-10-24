import { OnboardingGuide } from "@prismicio/editor-fields";

import { telemetry } from "@/apiClient";
import { PlayCircleIcon } from "@/icons/PlayCircleIcon";

import { NavigationItem } from "../navigation/NavigationItem";
import { useOnboarding } from "./useOnboarding";

export function SharedOnboardingGuide() {
  const { onboarding, toggleStep, toggleGuide } = useOnboarding();

  if (!onboarding) return null;

  if (onboarding.isDismissed) {
    return (
      <NavigationItem
        title="Get Started"
        Icon={PlayCircleIcon}
        onClick={() => void toggleGuide()}
      />
    );
  }

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
