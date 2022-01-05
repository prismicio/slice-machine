import React, { useEffect } from "react";

import Drawer from "rc-drawer";
import { Close, Flex, Text } from "theme-ui";

import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  getFramework,
  selectIsPreviewAvailableForFramework,
  getStorybookUrl,
} from "@src/modules/environment";
import StorybookSection from "./components/StorybookSection";
import { selectIsSetupDrawerOpen } from "@src/modules/preview";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

import Stepper from "./Stepper";

const SetupDrawer: React.FunctionComponent = ({}) => {
  const { isSetupDrawerOpen } = useSelector((state: SliceMachineStoreType) => ({
    isSetupDrawerOpen: selectIsSetupDrawerOpen(state),
  }));

  const { closeSetupDrawerDrawer } = useSliceMachineActions();

  const { storybook, framework, isPreviewAvailableForFramework } = useSelector(
    (state: SliceMachineStoreType) => ({
      framework: getFramework(state),
      isPreviewAvailableForFramework:
        selectIsPreviewAvailableForFramework(state),
      storybook: getStorybookUrl(state),
    })
  );

  // We close the drawer if the framework cannot handle the preview
  useEffect(() => {
    if (isPreviewAvailableForFramework) return;
    closeSetupDrawerDrawer();
  }, [isPreviewAvailableForFramework]);

  return (
    <Drawer
      placement="right"
      open={isSetupDrawerOpen}
      level={null}
      onClose={closeSetupDrawerDrawer}
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
            p: 20,
            justifyContent: "space-between",
            borderBottomStyle: "solid",
            borderBottomWidth: "1px",
            borderBottomColor: (t) => t.colors?.borders,
          }}
        >
          <Text sx={{ fontSize: 3 }}>Setup Slice Preview</Text>
          <Close color={"#4E4E55"} onClick={closeSetupDrawerDrawer} />
        </Flex>
        <Flex
          sx={{
            flex: 1,
            overflow: "auto",
            flexDirection: "column",
            pl: 4,
            pr: 4,
          }}
        >
          <Flex as={"section"} sx={{ flexDirection: "column" }}>
            <Stepper framework={framework} />
          </Flex>
        </Flex>
        {!storybook && !!framework && (
          <StorybookSection framework={framework} />
        )}
      </Flex>
    </Drawer>
  );
};

export default SetupDrawer;
