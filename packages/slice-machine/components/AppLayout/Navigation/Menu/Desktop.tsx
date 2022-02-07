import React from "react";
import { Box, Divider, Heading, Paragraph, Button, Flex, Text } from "theme-ui";
import { FiZap } from "react-icons/fi";
import VersionBadge from "../Badge";
import ItemsList from "./Navigation/List";
import Logo from "../Menu/Logo";
import { LinkProps } from "..";
import Item from "./Navigation/Item";

import NotLoggedIn from "./Navigation/NotLoggedIn";

import { warningStates } from "@lib/consts";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useSelector } from "react-redux";
import {
  getConfigErrors,
  getUpdateVersionInfo,
  getWarnings,
} from "@src/modules/environment";
import { SliceMachineStoreType } from "@src/redux/type";
import type { UpdateVersionInfo } from "@lib/models/common/Environment";

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
  versions: UpdateVersionInfo["availableVersions"];
}> = ({ onClick, versions }) => {
  return (
    <Flex
      sx={{
        maxWidth: "230px",
        border: "1px solid #E6E6EA",
        padding: "8px",
        flexDirection: "column",
      }}
    >
      {(versions.major || versions.minor || versions.patch) && (
        <Box sx={{ margin: "4px" }}>
          {/* This is not semantic */}
          {(versions.major || versions.minor) && (
            <Text
              sx={{
                fontSize: "8px",
                color: "#5B3DF5",
                background: "rgba(91, 61, 245, 0.15)",
                padding: "4px 8px",
                borderRadius: "4px",
                margin: "4px",
              }}
            >
              Major
            </Text>
          )}
          {/* This is not semantic */}
          {versions.patch && (
            <Text
              sx={{
                fontSize: "8px",
                color: "#667587",
                background: "#E6E6EA",
                padding: "4px 8px",
                borderRadius: "4px",
                margin: "4px",
              }}
            >
              Minor
            </Text>
          )}
        </Box>
      )}
      <Heading
        as="h6"
        sx={{
          fontSize: "14px",
          margin: "8px",
        }}
      >
        Update Available
      </Heading>
      <Paragraph
        sx={{
          fontSize: "14px",
          color: "#4E4E55",
          margin: "8px",
        }}
      >
        A new version of Slice Machine is available
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
  const { warnings, configErrors, updateVersionInfo } = useSelector(
    (store: SliceMachineStoreType) => ({
      warnings: getWarnings(store),
      configErrors: getConfigErrors(store),
      updateVersionInfo: getUpdateVersionInfo(store),
    })
  );
  const { openUpdateVersionModal } = useSliceMachineActions();

  const isNotLoggedIn = !!warnings.find(
    (e) => e.key === warningStates.NOT_CONNECTED
  );

  return (
    <Box as="aside" bg="sidebar" sx={{ minWidth: "260px" }}>
      <Box py={4} px={3}>
        <Logo />
        <ItemsList mt={4} links={links} />
        <Box sx={{ position: "absolute", bottom: "3" }}>
          {updateVersionInfo.updateAvailable && (
            <UpdateInfo
              onClick={openUpdateVersionModal}
              versions={updateVersionInfo.availableVersions}
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
