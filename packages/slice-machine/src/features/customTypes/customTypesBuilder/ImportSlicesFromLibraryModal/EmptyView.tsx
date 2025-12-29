import { Box, Icon, Text, ThemeKeys } from "@prismicio/editor-ui";
import { ReactNode } from "react";

type EmptyViewProps = {
  title: string;
  description?: string;
  // TODO: Replace prismic with github icon when available
  icon: "prismic" | "alert" | "logout";
  color?: "purple" | "tomato";
  children?: ReactNode;
};

export function EmptyView(props: EmptyViewProps) {
  const { title, description, icon, children, color = "purple" } = props;

  const colors = getColors(color);

  return (
    <Box
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={16}
      flexGrow={1}
    >
      <Box
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={8}
        maxWidth={324}
      >
        <Box
          borderRadius="100%"
          backgroundColor={colors.iconBackgroundColor}
          padding={8}
        >
          <Icon name={icon} size="small" color={colors.iconColor} />
        </Box>
        <Box flexDirection="column" alignItems="center">
          <Text variant="bold" align="center">
            {title}
          </Text>
          {description !== undefined && (
            <Text align="center" color="grey11">
              {description}
            </Text>
          )}
        </Box>
      </Box>
      {children}
    </Box>
  );
}

function getColors(color: "purple" | "tomato"): {
  iconBackgroundColor: ThemeKeys<"color">;
  iconColor: ThemeKeys<"color">;
} {
  switch (color) {
    case "purple":
      return {
        iconBackgroundColor: "purple3",
        iconColor: "purple11",
      };
    case "tomato":
      return {
        iconBackgroundColor: "tomato3",
        iconColor: "tomato11",
      };
  }
}
