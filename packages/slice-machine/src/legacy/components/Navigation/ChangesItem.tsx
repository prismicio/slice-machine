import {
  Box,
  Button,
  IconButton,
  Text,
  Tooltip,
  useMediaQuery,
} from "@prismicio/editor-ui";
import { useRouter } from "next/router";
import { type FC } from "react";

import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import { AutoSyncStatusIndicator } from "@/features/sync/components/AutoSyncStatusIndicator";
import { useUnSyncChanges } from "@/features/sync/useUnSyncChanges";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useNetwork } from "@/hooks/useNetwork";
import { ChangesIcon } from "@/icons/ChangesIcon";
import { AuthStatus } from "@/modules/userContext/types";

export const ChangesItem: FC = () => {
  const router = useRouter();
  const { autoSyncStatus } = useAutoSync();
  const collapsed = useMediaQuery({ max: "medium" });

  return (
    <Box alignItems={collapsed ? "center" : undefined} flexDirection="column">
      {autoSyncStatus === "failed" ||
      autoSyncStatus === "synced" ||
      autoSyncStatus === "syncing" ? (
        <AutoSyncStatusIndicator autoSyncStatus={autoSyncStatus} />
      ) : collapsed ? (
        <Tooltip content="Review changes" side="right">
          <Box position="relative">
            {/*
             * TODO(DT-1942): This should be an IconButton with a link
             * component for accessibility
             */}
            <IconButton
              icon={<ChangesIcon />}
              onClick={() => {
                void router.push("/changes");
              }}
              variant="solid"
            />
            <Box
              left="100%"
              position="absolute"
              top={0}
              transform="translate(-50%, -50%)"
            >
              <ChangesCount color="purple" />
            </Box>
          </Box>
        </Tooltip>
      ) : (
        // TODO(DT-1942): This should be a Button with a link component for
        // accessibility
        <Button
          color="grey"
          onClick={() => {
            void router.push("/changes");
          }}
          sx={{ width: "100%" }}
        >
          <Box alignItems="center" gap={4}>
            <Text variant="bold">Review changes</Text>{" "}
            <ChangesCount color="grey" />
          </Box>
        </Button>
      )}
    </Box>
  );
};

type ChangesCountProps = { color: "grey" | "purple" };

export const ChangesCount: FC<ChangesCountProps> = ({ color }) => {
  const isOnline = useNetwork();
  const authStatus = useAuthStatus();
  const { unSyncedSlices, unSyncedCustomTypes } = useUnSyncChanges();
  const numberOfChanges = unSyncedSlices.length + unSyncedCustomTypes.length;

  if (
    !isOnline ||
    authStatus === AuthStatus.UNAUTHORIZED ||
    authStatus === AuthStatus.FORBIDDEN
  ) {
    return null;
  }

  if (numberOfChanges === 0) {
    return null;
  }

  const formattedNumberOfChanges = numberOfChanges > 9 ? "+9" : numberOfChanges;

  return (
    <Box
      padding={{ inline: 6 }}
      borderRadius={10}
      backgroundColor={color === "grey" ? "grey5" : "purple9"}
    >
      <Text color={color === "grey" ? "grey11" : "grey1"} variant="small">
        {formattedNumberOfChanges}
      </Text>
    </Box>
  );
};
