import React, { useEffect, useContext } from "react";

import Drawer from "rc-drawer";
import { Close, Flex, Text } from "theme-ui";

import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { TrackerContext } from "@src/utils/tracker";
import {
  getFramework,
  selectIsPreviewAvailableForFramework,
  getLinkToStorybookDocs,
  getCurrentVersion,
} from "@src/modules/environment";
import StorybookSection from "./components/StorybookSection";
import { selectIsSetupDrawerOpen } from "@src/modules/preview";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

import Stepper from "./Stepper";

const SetupDrawer: React.FunctionComponent = () => {
  const { closeSetupDrawerDrawer } = useSliceMachineActions();
  const tracker = useContext(TrackerContext);

  const {
    isSetupDrawerOpen,
    linkToStorybookDocs,
    framework,
    isPreviewAvailableForFramework,
    version,
  } = useSelector((state: SliceMachineStoreType) => ({
    isSetupDrawerOpen: selectIsSetupDrawerOpen(state),
    framework: getFramework(state),
    linkToStorybookDocs: getLinkToStorybookDocs(state),
    isPreviewAvailableForFramework: selectIsPreviewAvailableForFramework(state),
    version: getCurrentVersion(state),
  }));

  useEffect(() => {
    tracker?.Track.SlicePreviewSetup({ framework, version });
  }, []);

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
            p: "20px",
            justifyContent: "space-between",
            borderBottomStyle: "solid",
            borderBottomWidth: "1px",
            borderBottomColor: (t) => t.colors?.borders,
          }}
        >
          <Text sx={{ fontSize: 3 }}>Setup Slice Preview</Text>
          <Close
            data-testid="close-set-up-preview"
            color={"#4E4E55"}
            onClick={closeSetupDrawerDrawer}
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
              isPreviewAvailableForFramework={isPreviewAvailableForFramework}
            />
          </Flex>
        </Flex>
        <StorybookSection linkToStorybookDocs={linkToStorybookDocs} />
      </Flex>
    </Drawer>
  );
};

export default SetupDrawer;
