import { useRouter } from "next/router";
import { Box } from "theme-ui";

import Navigation from "./Navigation";

const AsIs: { [x: string]: boolean } = {
  "/onboarding": true,
};

type AppLayoutProps = {};

const AppLayout: React.FunctionComponent<AppLayoutProps> = ({ children }) => {
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
      <Navigation />
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
