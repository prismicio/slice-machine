import { Box, Flex, Heading, useThemeUI, Text } from "theme-ui";
import { AiFillWarning } from "react-icons/ai";
import { NewVersionAvailable, ClientError, NotConnected } from "./Errors";
import {
  StorybookNotInstalled,
  StorybookNotRunning,
  StorybookNotInManifest,
} from "./Storybook";
import ConfigErrors from "../ConfigErrors";

import { warningStates } from "lib/consts";
import { FiZap } from "react-icons/fi";

const Renderers = {
  [warningStates.NOT_CONNECTED]: NotConnected,
  [warningStates.STORYBOOK_NOT_IN_MANIFEST]: StorybookNotInManifest,
  [warningStates.STORYBOOK_NOT_INSTALLED]: StorybookNotInstalled,
  [warningStates.STORYBOOK_NOT_RUNNING]: StorybookNotRunning,
  [warningStates.CLIENT_ERROR]: ClientError,
  [warningStates.NEW_VERSION_AVAILABLE]: NewVersionAvailable,
};

const Warnings = ({ list, configErrors, priority }) => {
  const { theme } = useThemeUI();
  const orderedList = priority
    ? [priority, ...list.filter((e) => e !== priority)]
    : list;
  return (
    <Box bg="background" sx={{ minHeight: "100vh", maxWidth: 480 }}>
      <Flex
        sx={{
          height: "57px",
          borderBottom: ({ colors }) => `1px solid ${colors.deep}`,
          p: 3,
          bg: "deep",
        }}
      >
        <Heading
          as="h3"
          sx={{ display: "flex", alignItems: "center", color: "#FFF" }}
        >
          <FiZap /> <Text ml={2}>Warnings</Text>
        </Heading>
      </Flex>
      <Box p={3} sx={{ overflow: "auto" }}>
        {orderedList.map((warning) => {
          const Component = Renderers[warning.key];
          return (
            <Component
              key={warning.key}
              errorType={warning.title}
              {...warning}
            />
          );
        })}
        {Object.entries(configErrors || {}).length ? (
          <ConfigErrors errors={configErrors} />
        ) : null}
      </Box>
    </Box>
  );
};

export default Warnings;
