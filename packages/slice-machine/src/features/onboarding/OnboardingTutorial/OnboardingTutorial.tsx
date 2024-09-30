import { Box, Icon, Text } from "@prismicio/editor-ui";

import { useMarketingContent } from "@/hooks/useMarketingContent";

export function OnboardingTutorial() {
  const { tutorial } = useMarketingContent();

  const url = tutorial?.url;

  if (url === undefined) return null;

  return (
    <Box justifyContent="center" padding={{ block: 6 }}>
      <Text href={url} variant="smallBold" color="grey11">
        Or watch our full course
        <Icon
          name="playCircle"
          color="grey11"
          size="small"
          sx={{ marginLeft: 4 }}
        />
      </Text>
    </Box>
  );
}
