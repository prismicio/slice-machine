import Navigation from "./Navigation";
import { Box } from "theme-ui";

import Environment from "../../lib/models/common/Environment";

const AppLayout = ({ children, env }: { children: any; env: Environment }) => {
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        flexDirection: ["column", "row", null],
      }}
    >
      <Navigation env={env} />
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
