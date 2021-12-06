import { Box, Flex, Text } from "@theme-ui/components";
import Container from "components/Container";
import ConfigErrors from "components/ConfigErrors";
import {
  NewVersionAvailable,
  ClientError,
  NotConnected,
} from "components/Warnings/Errors";
import { warningStates } from "lib/consts";

import { FiZap } from "react-icons/fi";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "src/redux/type";
import { getConfigErrors, getWarnings } from "src/modules/environment";

const WarningsPage: React.FunctionComponent = () => {
  const { warnings, configErrors } = useSelector(
    (store: SliceMachineStoreType) => ({
      configErrors: getConfigErrors(store),
      warnings: getWarnings(store),
    })
  );

  const Renderers: Record<string, React.FunctionComponent<any>> = {
    [warningStates.NOT_CONNECTED]: NotConnected,
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
          {(warnings || []).map((warning) => {
            const Component = Renderers[warning.key];
            return <Component errorType={warning.title} {...warning} />;
          })}
        </Box>
        <Box>
          {Object.entries(configErrors || {}).length ? (
            <ConfigErrors errors={configErrors} />
          ) : null}
        </Box>
        {(!warnings || !warnings.length) &&
        (!configErrors || Object.keys(configErrors).length === 0) ? (
          <Box>
            <Text>Your project is correctly configured. Well done!</Text>
          </Box>
        ) : null}
      </Container>
    </main>
  );
};

export default WarningsPage;
