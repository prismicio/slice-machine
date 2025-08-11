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

import {
  HoverCard,
  HoverCardCloseButton,
  HoverCardDescription,
  HoverCardMedia,
  HoverCardTitle,
} from "@/components/HoverCard";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import { AutoSyncStatusIndicator } from "@/features/sync/components/AutoSyncStatusIndicator";
import { useUnSyncChanges } from "@/features/sync/useUnSyncChanges";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useNetwork } from "@/hooks/useNetwork";
import { ChangesIcon } from "@/icons/ChangesIcon";
import { AuthStatus } from "@/modules/userContext/types";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

export const ChangesItem: FC = () => {
  const { setSeenChangesToolTip } = useSliceMachineActions();
  const open = useOpenChangesHoverCard();
  const router = useRouter();
  const { autoSyncStatus } = useAutoSync();
  const collapsed = useMediaQuery({ max: "medium" });

  const onClose = () => {
    setSeenChangesToolTip();
  };

  return (
    <HoverCard
      align="start"
      open={open}
      openDelay={3000}
      onClose={onClose}
      side="right"
      sideOffset={24}
      trigger={
        <Box
          alignItems={collapsed ? "center" : undefined}
          flexDirection="column"
        >
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
      }
    >
      <HoverCardTitle>Push your changes</HoverCardTitle>
      <HoverCardMedia component="image" src="/push.png" />
      <HoverCardDescription>
        When you click Save, your changes are saved locally. Then, you can push
        your models to Prismic from the Changes page.
      </HoverCardDescription>
      <HoverCardCloseButton>Got it</HoverCardCloseButton>
    </HoverCard>
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

// TODO(DT-1925): Reactivate this feature
const useOpenChangesHoverCard = () => {
  // const { hasSeenChangesToolTip, hasSeenSimulatorToolTip } = useSelector(
  //   (store: SliceMachineStoreType) => ({
  //     hasSeenChangesToolTip: userHasSeenChangesToolTip(store),
  //     hasSeenSimulatorToolTip: userHasSeenSimulatorToolTip(store),
  //   }),
  // );

  // return (
  //   !hasSeenChangesToolTip &&
  //   hasSeenSimulatorToolTip
  // );

  return false;
};
