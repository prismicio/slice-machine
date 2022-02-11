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

import { useSelector } from "react-redux";
import {
  getConfigErrors,
  getChangelog,
  getWarnings,
} from "@src/modules/environment";
import { SliceMachineStoreType } from "@src/redux/type";

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
  versions: { major?: string; minor?: string; patch?: string };
}> = ({ onClick, versions }) => {
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
      {(versions.major || versions.minor || versions.patch) && (
        <Box sx={{ margin: "0px 4px 4px 4px" }}>
          {/* This is not semantic */}
          {(versions.major || versions.minor) && (
            <Text
              sx={{
                fontSize: "8px",
                color: "#5B3DF5",
                background: "rgba(91, 61, 245, 0.15)",
                padding: "2px 4px",
                borderRadius: "4px",
                margin: "2px",
              }}
            >
              MAJOR
            </Text>
          )}
          {/* This is not semantic */}
          {versions.patch && (
            <Text
              sx={{
                fontSize: "8px",
                color: "#667587",
                background: "#E6E6EA",
                padding: "2px 4px",
                borderRadius: "4px",
                margin: "2px",
              }}
            >
              MINOR
            </Text>
          )}
        </Box>
      )}
      <Heading
        as="h6"
        sx={{
          fontSize: "14px",
          margin: "4px 8px",
        }}
      >
        Updates Available
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
  const { warnings, configErrors, changelog } = useSelector(
    (store: SliceMachineStoreType) => ({
      warnings: getWarnings(store),
      configErrors: getConfigErrors(store),
      changelog: getChangelog(store),
    })
  );

  const isNotLoggedIn = !!warnings.find(
    (e) => e.key === warningStates.NOT_CONNECTED
  );

  return (
    <Box as="aside" bg="sidebar" sx={{ minWidth: "270px" }}>
      <Box py={4} px={3}>
        <Logo />
        <ItemsList mt={4} links={links} />
        <Box sx={{ position: "absolute", bottom: "3" }}>
          {changelog.updateAvailable && (
            <UpdateInfo onClick={() => void 0} versions={{}} />
          )}
          {isNotLoggedIn && <NotLoggedIn />}
          <Divider variant="sidebar" />
          <Item
            link={formatWarnings(
              warnings.length + Object.keys(configErrors).length
            )}
          />
          <VersionBadge label="Version" version={changelog.currentVersion} />
        </Box>
      </Box>
    </Box>
  );
};

export default Desktop;
