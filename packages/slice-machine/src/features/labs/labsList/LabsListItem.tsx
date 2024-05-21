import { Box, Card, Icon, Switch, Text } from "@prismicio/editor-ui";
import { type FC, type PropsWithChildren } from "react";

type LabsListItemProps = PropsWithChildren<{
  title: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}>;

export const LabsListItem: FC<LabsListItemProps> = ({
  title,
  enabled,
  onToggle,
  children,
}) => {
  return (
    <Card variant="outlined">
      <Box gap={8} padding={16}>
        <Box padding={{ top: 6 }}>
          <Icon name="viewDay" size="medium" color="grey11" />
        </Box>
        <Box flexDirection="column" flexGrow={1}>
          <Text variant="h3">{title}</Text>
          <Text variant="normal">{children}</Text>
        </Box>
        <Box width={128} justifyContent="end">
          <Switch
            size="medium"
            checked={enabled}
            onCheckedChange={(checked) => onToggle(checked)}
          />
        </Box>
      </Box>
    </Card>
  );
};
