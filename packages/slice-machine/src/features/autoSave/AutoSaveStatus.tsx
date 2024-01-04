import { FC } from "react";
import { Box, Icon, ProgressCircle, Text } from "@prismicio/editor-ui";

import { AutoSaveStatusType } from "./useAutoSave";

type AutoSaveStatusProps = {
  status: AutoSaveStatusType;
};

export const AutoSaveStatus: FC<AutoSaveStatusProps> = (props) => {
  const { status } = props;
  let autoSaveStatusInfo;

  switch (status) {
    case "saving":
      autoSaveStatusInfo = {
        icon: <ProgressCircle color="grey11" />,
        text: "Saving...",
      };
      break;
    case "error":
      autoSaveStatusInfo = {
        icon: <Icon name="close" color="tomato11" size="medium" />,
        text: "Failed to save",
      };
      break;
    case "saved":
      autoSaveStatusInfo = {
        icon: <Icon name="check" color="green11" size="medium" />,
        text: "Auto-saved",
      };
      break;
  }

  return (
    <Box gap={8} alignItems="center">
      {autoSaveStatusInfo.icon}
      <Text>{autoSaveStatusInfo.text}</Text>
    </Box>
  );
};
