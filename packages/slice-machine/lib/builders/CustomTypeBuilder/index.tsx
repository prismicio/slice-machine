import { useEffect, useRef } from "react";
import { Box } from "theme-ui";

import TabZone from "./TabZone";
import { Header, Tabs } from "./Layout";

import { CustomTypeState } from "../../models/ui/CustomTypeState";
import CustomTypeStore from "../../../src/models/customType/store";
import Container from "../../../components/Container";

const CustomTypeBuilder = ({
  Model,
  store,
}: {
  Model: CustomTypeState;
  store: CustomTypeStore;
}) => {
  const modelRef = useRef(Model);

  useEffect(() => {
    modelRef.current = Model;
  }, [Model]);

  useEffect(() => {
    return () => store.reset();
  }, []);

  return (
    <Box sx={{ flex: 1 }}>
      <Container sx={{ pb: 0 }}>
        <Header Model={Model} store={store} />
      </Container>
      <Tabs
        Model={Model}
        store={store}
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
              store={store}
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
