import { useEffect, useRef } from "react";
import { Box } from "theme-ui";

import TabZone from "./TabZone";
import { Header, Tabs } from "./Layout";

import { CustomTypeState } from "@models/ui/CustomTypeState";
import Container from "@components/Container";
import { UseCustomTypeActionsReturnType } from "@src/models/customType/useCustomTypeActions";

const CustomTypeBuilder = ({
  Model,
  customTypeActions,
}: {
  Model: CustomTypeState;
  customTypeActions: UseCustomTypeActionsReturnType;
}) => {
  const modelRef = useRef(Model);

  useEffect(() => {
    modelRef.current = Model;
  }, [Model]);

  useEffect(() => {
    return () => customTypeActions.reset();
  }, []);

  return (
    <Box sx={{ flex: 1 }}>
      <Container sx={{ pb: 0 }}>
        <Header Model={Model} customTypeActions={customTypeActions} />
      </Container>
      <Tabs
        Model={Model}
        customTypeActions={customTypeActions}
        renderTab={({
          value,
          sliceZone,
          key,
        }: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          value: any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sliceZone: any;
          key: string;
        }) => (
          <Box sx={{ mt: 4 }}>
            <TabZone
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              fields={value}
              Model={Model}
              customTypeActions={customTypeActions}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              sliceZone={sliceZone}
              showHints={true}
              tabId={key}
            />
          </Box>
        )}
      />
    </Box>
  );
};

export default CustomTypeBuilder;
