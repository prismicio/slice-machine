import { Box, Icon, ProgressCircle, Text } from "@prismicio/editor-ui";
import { FC } from "react";

import { ActionQueueStatus } from "@/hooks/useActionQueue";

type AutoSaveStatusIndicatorProps = {
  status: ActionQueueStatus;
};

export const AutoSaveStatusIndicator: FC<AutoSaveStatusIndicatorProps> = (
  props,
) => {
  const { status } = props;
  let autoSaveStatusInfo;

  switch (status) {
    case "pending":
      autoSaveStatusInfo = {
        icon: <ProgressCircle color="grey11" />,
        text: "Saving...",
      };
      break;
    case "failed":
      autoSaveStatusInfo = {
        icon: <Icon name="close" color="tomato11" size="medium" />,
        text: "Failed to save",
      };
      break;
    case "done":
      autoSaveStatusInfo = {
        icon: <Icon name="check" color="green11" size="medium" />,
        text: "Auto-saved",
      };
      break;
  }

  return (
    <Box gap={8} alignItems="center">
      {autoSaveStatusInfo.icon}
      <Text color="grey11">{autoSaveStatusInfo.text}</Text>
    </Box>
  );
};
