import { Box, Icon, Text } from "@prismicio/editor-ui";

interface OnboardingTutorialProps {
  url: string;
  variant: "dark" | "light";
}
export function OnboardingTutorial(props: OnboardingTutorialProps) {
  const { url, variant } = props;

  return (
    <Box justifyContent="center" padding={{ block: 6 }} gap={4}>
      <Text
        href={url}
        variant="smallBold"
        color={variant === "light" ? "grey11" : "white"}
      >
        Or watch our full course
      </Text>
      <Icon
        name="playCircle"
        color={variant === "light" ? "grey11" : "white"}
        size="small"
      />
    </Box>
  );
}
