import { useEffect } from "react";
import { Box } from "theme-ui";

import TabZone from "./TabZone";
import { Header, Tabs } from "./Layout";

import Container from "@components/Container";
import { UseCustomTypeActionsReturnType } from "@src/models/customType/useCustomTypeActions";

const CustomTypeBuilder = ({
  customTypeActions,
}: {
  customTypeActions: UseCustomTypeActionsReturnType;
}) => {
  useEffect(() => {
    return () => customTypeActions.reset();
  }, []);

  return (
    <Box sx={{ flex: 1 }}>
      <Container sx={{ pb: 0 }}>
        <Header />
      </Container>
      <Tabs
        renderTab={({ value, sliceZone, key }) => (
          <Box sx={{ mt: 4 }}>
            <TabZone
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              fields={value}
              customTypeActions={customTypeActions}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              sliceZone={sliceZone}
              tabId={key}
            />
          </Box>
        )}
      />
    </Box>
  );
};

export default CustomTypeBuilder;
