import { Box } from "theme-ui";

import TabZone from "./TabZone";
import { Tabs } from "./Layout";

const CustomTypeBuilder = () => {
  return (
    <Box sx={{ flex: 1 }}>
      <Tabs
        renderTab={({ value, sliceZone, key }) => (
          <Box sx={{ mt: 4 }}>
            <TabZone
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              fields={value}
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
