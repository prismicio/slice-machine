import { type FC, type PropsWithChildren } from "react";
import {
  Badge,
  Switch,
  Box,
  Card,
  Icon,
  Separator,
  Text,
} from "@prismicio/editor-ui";

type LabsTableItemProps = PropsWithChildren<{
  title: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => Promise<void> | void;
  tags?: string[];
}>;

export const LabsTableItem: FC<LabsTableItemProps> = ({
  title,
  enabled,
  onToggle,
  tags,
  children,
}) => {
  return (
    <Card variant="outlined" style={{ padding: 0 }}>
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
            onCheckedChange={(checked) => void onToggle(checked)}
          />
        </Box>
      </Box>
      {tags?.length ?? 0 ? (
        <>
          <Separator />
          <Box alignItems="center" gap={4} padding={{ inline: 16, block: 12 }}>
            <Icon name="label" size="small" color="grey11" />
            <Text variant="small" color="grey11">
              Tags:
            </Text>
            <Box gap={8}>
              {tags?.map((tag) => (
                <Badge size="medium" key={tag} title={tag} />
              ))}
            </Box>
          </Box>
        </>
      ) : null}
    </Card>
  );
};
