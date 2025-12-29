import { Box, Icon, Text } from "@prismicio/editor-ui";
import { ReactNode } from "react";

type EmptyViewProps = {
  title: string;
  description?: string;
  // TODO: Replace add with github icon when available
  icon: "add" | "alert";
  children?: ReactNode;
};

export function EmptyView(props: EmptyViewProps) {
  const { title, description, icon, children } = props;

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
        <Box borderRadius="100%" backgroundColor="purple3" padding={8}>
          <Icon name={icon} size="small" color="purple11" />
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
