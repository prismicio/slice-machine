import React from "react";
import { Box, Divider, Heading, Paragraph, Button, Flex } from "theme-ui";
import ItemsList from "./Navigation/List";
import Logo from "../Menu/Logo";
import { LinkProps } from "..";

import { useSelector } from "react-redux";
import { getChangelog } from "@src/modules/environment";
import {
  getUpdatesViewed,
  userHashasSeenTutorialsTooTip,
} from "@src/modules/userContext";
import { SliceMachineStoreType } from "@src/redux/type";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useRouter } from "next/router";
import ChangelogItem from "./Navigation/ChangelogItem";
import VideoItem from "@components/AppLayout/Navigation/Menu/Navigation/VideoItem";

const UpdateInfo: React.FC<{
  onClick: () => void;
  hasSeenUpdate: boolean;
}> = ({ onClick, hasSeenUpdate }) => {
  return (
    <Flex
      sx={{
        maxWidth: "240px",
        border: "1px solid #E6E6EA",
        borderRadius: "4px",
        padding: "8px",
        flexDirection: "column",
      }}
    >
      <Heading
        as="h6"
        sx={{
          fontSize: "14px",
          margin: "4px 8px",
        }}
      >
        Updates Available{" "}
        {hasSeenUpdate || (
          <span
            data-testid="the-red-dot"
            style={{
              borderRadius: "50%",
              width: "8px",
              height: "8px",
              backgroundColor: "#FF4A4A",
              display: "inline-block",
              margin: "4px",
            }}
          />
        )}
      </Heading>
      <Paragraph
        sx={{
          fontSize: "14px",
          color: "#4E4E55",
          margin: "4px 8px 8px",
        }}
      >
        Some updates of Slice Machine are available.
      </Paragraph>
      <Button
        data-testid="update-modal-open"
        sx={{
          background: "#5B3DF5",
          border: "1px solid rgba(62, 62, 72, 0.15)",
          boxSizing: "border-box",
          borderRadius: "4px",
          margin: "8px",
          fontSize: "11.67px",
          alignSelf: "flex-start",
          padding: "4px 8px",
        }}
        onClick={onClick}
      >
        Learn more
      </Button>
    </Flex>
  );
};

const Desktop: React.FunctionComponent<{ links: LinkProps[] }> = ({
  links,
}) => {
  const { changelog, updatesViewed, hasSeenTutorialsTooTip } = useSelector(
    (store: SliceMachineStoreType) => ({
      changelog: getChangelog(store),
      updatesViewed: getUpdatesViewed(store),
      hasSeenTutorialsTooTip: userHashasSeenTutorialsTooTip(store),
    })
  );

  const { setUpdatesViewed, setSeenTutorialsToolTip } =
    useSliceMachineActions();

  const latestVersion =
    changelog.versions.length > 0 ? changelog.versions[0] : null;

  const hasSeenLatestUpdates =
    updatesViewed &&
    updatesViewed.latest === latestVersion?.versionNumber &&
    updatesViewed.latestNonBreaking === changelog.latestNonBreakingVersion;

  const router = useRouter();

  return (
    <Box as="aside" bg="sidebar" sx={{ minWidth: "270px", display: "flex" }}>
      <Box
        sx={{
          p: "40px 20px 20px",
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <Logo />
        <ItemsList mt={4} links={links} sx={{ flex: "1" }} />
        <Box>
          {changelog.updateAvailable && (
            <UpdateInfo
              onClick={() => {
                setUpdatesViewed({
                  latest: latestVersion && latestVersion.versionNumber,
                  latestNonBreaking: changelog.latestNonBreakingVersion,
                });
                return router.push("/changelog");
              }}
              hasSeenUpdate={hasSeenLatestUpdates}
            />
          )}
          <VideoItem
            hasSeenTutorialsTooTip={hasSeenTutorialsTooTip}
            onClose={setSeenTutorialsToolTip}
          />
          <Divider variant="sidebar" />
          <ChangelogItem currentVersion={changelog.currentVersion} />
        </Box>
      </Box>
    </Box>
  );
};

export default Desktop;
