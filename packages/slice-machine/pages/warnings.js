import { useContext } from "react";
import { ConfigContext } from "src/config-context";
import { Box, Flex, Text } from "@theme-ui/components";
import Container from "../components/Container";
import ConfigErrors from "../components/ConfigErrors"
import {
  NewVersionAvailable,
  ClientError,
  NotConnected,
} from "../components/Warnings/Errors";
import { warningStates } from "lib/consts";
import {
  StorybookNotInstalled,
  StorybookNotRunning,
  StorybookNotInManifest,
} from "../components/Warnings/Storybook";
import { FiZap } from "react-icons/fi";

export default function WarningsPage() {
  const { warnings, configErrors } = useContext(ConfigContext)

  const Renderers = {
    [warningStates.NOT_CONNECTED]: NotConnected,
    [warningStates.STORYBOOK_NOT_IN_MANIFEST]: StorybookNotInManifest,
    [warningStates.STORYBOOK_NOT_INSTALLED]: StorybookNotInstalled,
    [warningStates.STORYBOOK_NOT_RUNNING]: StorybookNotRunning,
    [warningStates.CLIENT_ERROR]: ClientError,
    [warningStates.NEW_VERSION_AVAILABLE]: NewVersionAvailable,
  };

  return (
    <main>
      <Container sx={{ maxWidth: "890px" }}>
        <Flex
          sx={{
            alignItems: "center",
            fontSize: 4,
            lineHeight: "48px",
            fontWeight: "heading",
            mb: 4,
          }}
        >
          <FiZap /> <Text ml={2}>Warnings</Text>
        </Flex>
        <Box>
          {warnings.map((warning) => {
            const Component = Renderers[warning.key];
            return (
              <Component
                key={warning.key}
                errorType={warning.title}
                {...warning}
              />
            )
          })}
        </Box>
        <Box>
          {Object.entries(configErrors || {}).length ? (
          <ConfigErrors errors={configErrors} />
        ) : null}
        </Box>
        {
          (!warnings || !warnings.length) && Object.keys(configErrors).length === 0 ? (
            <Box>
              <Text>Your project is correctly configured. Well done!</Text>
            </Box>
          ) : null
        }
      </Container>
    </main>
  );
}
