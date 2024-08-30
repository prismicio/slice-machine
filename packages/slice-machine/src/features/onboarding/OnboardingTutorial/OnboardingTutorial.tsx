import { Box, Icon, Text } from "@prismicio/editor-ui";

import { useOnboardingCardVisibilityExperiment } from "@/features/onboarding/useOnboardingCardVisibilityExperiment";
import { useMarketingContent } from "@/hooks/useMarketingContent";

export function OnboardingTutorial() {
  const { variant } = useOnboardingCardVisibilityExperiment();
  const { tutorial } = useMarketingContent();

  const color = variant === "dark" ? "white" : "grey11";
  const url = tutorial?.url;

  if (url === undefined) return null;

  return (
    <Box justifyContent="center" padding={{ block: 6 }} gap={4}>
      <Text href={url} variant="smallBold" color={color}>
        Or watch our full course
      </Text>
      <Icon name="playCircle" color={color} size="small" />
    </Box>
  );
}
