import { Box } from "theme-ui";

import TabZone from "./TabZone";
import Tabs from "./Layout";
import { CustomTypeSM } from "@lib/models/common/CustomType";

type CustomTypeBuilderProps = {
  customType: CustomTypeSM;
};
const CustomTypeBuilder = ({ customType }: CustomTypeBuilderProps) => {
  return (
    <Tabs
      tabs={customType.tabs}
      renderTab={({ value, sliceZone, key }) => (
        <Box sx={{ mt: 4 }}>
          <TabZone
            fields={value}
            sliceZone={sliceZone}
            tabId={key}
            customType={customType}
          />
        </Box>
      )}
    />
  );
};

export default CustomTypeBuilder;
