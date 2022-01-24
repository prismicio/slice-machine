import React, { useEffect } from "react";

import Drawer from "rc-drawer";
import { Close, Flex, Text } from "theme-ui";

import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  getFramework,
  selectIsSimulatorAvailableForFramework,
  getLinkToStorybookDocs,
} from "@src/modules/environment";
import StorybookSection from "./components/StorybookSection";
import { selectIsSetupDrawerOpen } from "@src/modules/simulator";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

import Stepper from "./Stepper";

const SetupDrawer: React.FunctionComponent = () => {
  const { closeSetupDrawer } = useSliceMachineActions();

  const {
    isSetupDrawerOpen,
    linkToStorybookDocs,
    framework,
    isSimulatorAvailableForFramework,
  } = useSelector((state: SliceMachineStoreType) => ({
    isSetupDrawerOpen: selectIsSetupDrawerOpen(state),
    framework: getFramework(state),
    linkToStorybookDocs: getLinkToStorybookDocs(state),
    isSimulatorAvailableForFramework:
      selectIsSimulatorAvailableForFramework(state),
  }));

  // We close the drawer if the framework cannot handle the simulator
  useEffect(() => {
    if (isSimulatorAvailableForFramework) return;
    closeSetupDrawer();
  }, [isSimulatorAvailableForFramework]);

  return (
    <Drawer
      placement="right"
      open={isSetupDrawerOpen}
      level={null}
      onClose={closeSetupDrawer}
      width={492}
    >
      <Flex
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Flex
          sx={{
            p: "20px",
            justifyContent: "space-between",
            borderBottomStyle: "solid",
            borderBottomWidth: "1px",
            borderBottomColor: (t) => t.colors?.borders,
          }}
        >
          <Text sx={{ fontSize: 3 }}>Setup Slice Simulator</Text>
          <Close
            data-testid="close-set-up-simulator"
            color={"#4E4E55"}
            onClick={closeSetupDrawer}
          />
        </Flex>
        <Flex
          sx={{
            flex: 1,
            overflow: "auto",
            flexDirection: "column",
            pl: "24px",
            pr: "24px",
          }}
        >
          <Flex as={"section"} sx={{ flexDirection: "column" }}>
            <Stepper
              framework={framework}
              isSimulatorAvailableForFramework={
                isSimulatorAvailableForFramework
              }
            />
          </Flex>
        </Flex>
        <StorybookSection linkToStorybookDocs={linkToStorybookDocs} />
      </Flex>
    </Drawer>
  );
};

export default SetupDrawer;
