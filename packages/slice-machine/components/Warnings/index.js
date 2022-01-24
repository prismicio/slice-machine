import { Box, Flex, Heading, useThemeUI, Text } from "theme-ui";
import { NewVersionAvailable, ClientError, NotConnected } from "./Errors";
import ConfigErrors from "../ConfigErrors";

import { warningStates } from "lib/consts";
import { FiZap } from "react-icons/fi";

const Renderers = {
  [warningStates.NOT_CONNECTED]: NotConnected,
  [warningStates.CLIENT_ERROR]: ClientError,
  [warningStates.NEW_VERSION_AVAILABLE]: NewVersionAvailable,
};

const Warnings = ({ list, configErrors, priority }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { theme } = useThemeUI();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment
  const orderedList = priority
    ? // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      [priority, ...list.filter((e) => e !== priority)]
    : list;
  return (
    <Box bg="background" sx={{ minHeight: "100vh", maxWidth: 480 }}>
      <Flex
        sx={{
          height: "57px",
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          orderedList.map((warning) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
            const Component = Renderers[warning.key];
            if (!Component) {
              return null;
            }
            return (
              <Component
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                key={warning.key}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                errorType={warning.title}
                {...warning}
              />
            );
          })
        }
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          Object.entries(configErrors || {}).length ? (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            <ConfigErrors errors={configErrors} />
          ) : null
        }
      </Box>
    </Box>
  );
};

export default Warnings;
