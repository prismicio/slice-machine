import { useRouter } from "next/router";
import { Box } from "theme-ui";

import Navigation from "./Navigation";

import Environment from "@lib/models/common/Environment";
import { ServerState } from "@lib/models/server/ServerState";

const AsIs: { [x: string]: boolean } = {
  "/onboarding": true,
  "/[lib]/[sliceName]/[variation]/preview": true,
};

type AppLayoutProps = {
  env: Environment;
  serverState: ServerState;
};

const AppLayout: React.FunctionComponent<AppLayoutProps> = ({
  children,
  env,
  serverState,
}) => {
  const router = useRouter();
  if (AsIs[router.asPath] || AsIs[router.pathname]) {
    return <main>{children}</main>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        flexDirection: ["column", "row", null],
      }}
    >
      <Navigation
        env={env}
        warnings={serverState.warnings}
        configErrors={serverState.configErrors}
      />
      <Box
        as="main"
        sx={{
          flex: 1,
          px: [2, 4, null],
          overflow: "auto",
          display: "flex",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;
