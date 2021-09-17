import { ReactNode } from "react";
import { useRouter } from "next/router";
import { Box } from "theme-ui";

import Navigation from "./Navigation";

import Environment from "@lib/models/common/Environment";
import { ServerState } from "@lib/models/server/ServerState";

const AsIs: { [x: string]: boolean } = {
  "/onboarding": true,
};

const AppLayout = ({
  children,
  env,
  data,
}: {
  children: ReactNode;
  env: Environment;
  data: ServerState;
}) => {
  const router = useRouter();
  if (AsIs[router.asPath]) {
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
        warnings={data.warnings}
        configErrors={data.configErrors}
      />
      <Box
        as="main"
        sx={{
          flex: 1,
          px: [2, 4, null],
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;
