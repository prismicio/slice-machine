import { FC } from "react";
import { Box, Tooltip } from "@prismicio/editor-ui";

import LogoIcon from "@src/icons/LogoIcon";

import { useAutoSync } from "./AutoSyncProvider";

export const AutoSyncStatusIndicator: FC = () => {
  const { autoSyncStatus } = useAutoSync();
  const logoProps = {
    height: 40,
    width: 40,
  };

  let autoSaveStatusInfo;

  console.log("autoSyncStatus:", autoSyncStatus);

  switch (autoSyncStatus) {
    case "not-active":
      autoSaveStatusInfo = {
        icon: <LogoIcon {...logoProps} />,
      };
      break;
    case "offline":
      autoSaveStatusInfo = {
        icon: <LogoIcon {...logoProps} />,
      };
      break;
    case "not-logged-in":
      autoSaveStatusInfo = {
        icon: <LogoIcon {...logoProps} />,
      };
      break;
    case "syncing":
      autoSaveStatusInfo = {
        icon: <LogoIcon {...logoProps} />,
        tooltipText:
          "Syncing - Slice Machine is attempting to sync your changes with your Personal Sandbox.",
      };
      break;
    case "synced":
      autoSaveStatusInfo = {
        icon: <LogoIcon {...logoProps} />,
        tooltipText: "In sync",
      };
      break;
    case "failed":
      autoSaveStatusInfo = {
        icon: <LogoIcon {...logoProps} />,
        tooltipText: "Sync failed",
      };
      break;
  }

  return autoSaveStatusInfo.tooltipText !== undefined ? (
    <Tooltip content={autoSaveStatusInfo.tooltipText}>
      <Box height={40}>{autoSaveStatusInfo.icon}</Box>
    </Tooltip>
  ) : (
    autoSaveStatusInfo.icon
  );
};
