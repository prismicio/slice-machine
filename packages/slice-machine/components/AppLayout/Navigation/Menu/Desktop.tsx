import React from "react";
import { Box, Divider, Heading, Paragraph, Button, Flex } from "theme-ui";
import { FiZap } from "react-icons/fi";
import VersionBadge from "../Badge";
import ItemsList from "./Navigation/List";
import Logo from "../Menu/Logo";
import { LinkProps } from "..";
import Item from "./Navigation/Item";

import NotLoggedIn from "./Navigation/NotLoggedIn";

import { warningStates } from "@lib/consts";

import { useSelector } from "react-redux";
import {
  getConfigErrors,
  getUpdateVersionInfo,
  getWarnings,
} from "@src/modules/environment";
import { SliceMachineStoreType } from "@src/redux/type";
import { getVersionsTheUserKnowsAbout } from "@src/modules/userContext";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useRouter } from "next/router";

const formatWarnings = (len: number) => ({
  title: `Warnings${len ? ` (${len})` : ""}`,
  delimiter: true,
  href: "/warnings",
  match(pathname: string) {
    return pathname.indexOf("/warnings") === 0;
  },
  Icon: FiZap,
});

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
  const { warnings, configErrors, updateVersionInfo, versionsSeen } =
    useSelector((store: SliceMachineStoreType) => ({
      warnings: getWarnings(store),
      configErrors: getConfigErrors(store),
      updateVersionInfo: getUpdateVersionInfo(store),
      versionsSeen: getVersionsTheUserKnowsAbout(store),
    }));

  const { viewedUpdates } = useSliceMachineActions();

  const userSeenUpdates =
    versionsSeen &&
    versionsSeen.patch === updateVersionInfo.availableVersions.patch &&
    versionsSeen.minor === updateVersionInfo.availableVersions.minor &&
    versionsSeen.major === updateVersionInfo.availableVersions.major
      ? true
      : false;

  const isNotLoggedIn = !!warnings.find(
    (e) => e.key === warningStates.NOT_CONNECTED
  );

  const router = useRouter();

  return (
    <Box as="aside" bg="sidebar" sx={{ minWidth: "270px" }}>
      <Box py={4} px={3}>
        <Logo />
        <ItemsList mt={4} links={links} />
        <Box sx={{ position: "absolute", bottom: "3" }}>
          {updateVersionInfo.updateAvailable && (
            <UpdateInfo
              onClick={() => {
                viewedUpdates(updateVersionInfo.availableVersions);
                return router.push("/changelog");
              }}
              hasSeenUpdate={userSeenUpdates}
            />
          )}
          {isNotLoggedIn && <NotLoggedIn />}
          <Divider variant="sidebar" />
          <Item
            link={formatWarnings(
              warnings.length + Object.keys(configErrors).length
            )}
          />
          <VersionBadge
            label="Version"
            version={updateVersionInfo.currentVersion}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Desktop;
