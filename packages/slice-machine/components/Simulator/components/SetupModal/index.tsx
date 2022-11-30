import Card from "@components/Card";
import SliceMachineModal from "@components/SliceMachineModal";
import { Box, Flex, Heading, Text } from "theme-ui";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  getFramework,
  getLinkToStorybookDocs,
  getLinkToTroubleshootingDocs,
  selectIsSimulatorAvailableForFramework,
} from "@src/modules/environment";

import { getStepperConfigurationByFramework } from "./steps";

const TitleCard: React.FC<{
  number: number;
  title: string;
  excerpt: string;
}> & { tabsRole: string } = ({ number, title, excerpt, ...rest }) => (
  <Tab
    className="react-tabs__vertical__tab"
    selectedClassName="react-tabs__vertical__tab--selected"
    {...rest}
  >
    <Flex
      sx={{
        alignItems: "flex-start",
      }}
    >
      <NumberBox number={number} />
      <Box sx={{ ml: 3 }}>
        <Heading as="h4" sx={{ color: "whiteButtonText" }}>
          {title}
        </Heading>
        <Text as="p" sx={{ mt: 2, color: "textClear" }}>
          {excerpt}
        </Text>
      </Box>
    </Flex>
  </Tab>
);

TitleCard.tabsRole = "Tab";

const NumberBox: React.FC<{ number: number }> = ({ number }) => (
  <Flex
    sx={{
      height: "32px",
      width: "32px",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid #E4E2E4",
      borderRadius: "6px",
      bg: "grey07",
      color: "textClear",
      flexShrink: "0",
    }}
  >
    {number}
  </Flex>
);

const SetupModal: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const {
    linkToTroubleshootingDocs,
    framework,
    isSimulatorAvailableForFramework,
  } = useSelector((state: SliceMachineStoreType) => ({
    framework: getFramework(state),
    linkToStorybookDocs: getLinkToStorybookDocs(state),
    isSimulatorAvailableForFramework:
      selectIsSimulatorAvailableForFramework(state),
    linkToTroubleshootingDocs: getLinkToTroubleshootingDocs(state),
  }));

  return (
    <SliceMachineModal isOpen={isOpen}>
      <Card
        bodySx={{
          p: 0,
          bg: "grey07",
          height: "480px",
        }}
        Header={({ radius }: { radius: string | number }) => (
          <Flex
            sx={{
              p: "16px",
              pl: 4,
              bg: "grey07",
              alignItems: "center",
              justifyContent: "space-between",
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
              borderBottom: (t) => `1px solid ${String(t.colors?.borders)}`,
            }}
          >
            <Heading sx={{ fontSize: "20px" }} as="h5">
              Set up the simulator
            </Heading>
          </Flex>
        )}
      >
        <Tabs defaultFocus className="react-tabs__vertical">
          <TabList className="react-tabs__vertical__tab-list">
            <TitleCard
              number={1}
              title="install the simulator"
              excerpt="Run this command to install the simular package via npm."
            />
            <TitleCard
              number={2}
              title="Create a slice-simulator.js route"
              excerpt="In your pages/ directory, create a file called slice-simulator.js and paste this code."
            />
            <TitleCard
              number={3}
              title="Update your sm.json"
              excerpt="Add a property localSliceCanvasURL to your sm.json file."
            />
          </TabList>
          {isSimulatorAvailableForFramework ? (
            <>
              {getStepperConfigurationByFramework(framework).steps.map(
                (Step, i) => {
                  return (
                    <TabPanel
                      key={`next-step-${i + 1}`}
                      selectedClassName="react-tabs__vertical__tab-panel--selected"
                      className="react-tabs__vertical__tab-panel"
                    >
                      <Step
                        stepNumber={i + 1}
                        linkToTroubleshootingDocs={linkToTroubleshootingDocs}
                      />
                    </TabPanel>
                  );
                }
              )}
            </>
          ) : (
            <TabPanel
              selectedClassName="react-tabs__vertical__tab-panel--selected"
              className="react-tabs__vertical__tab-panel"
            >
              Framework not supported.
            </TabPanel>
          )}
        </Tabs>
      </Card>
    </SliceMachineModal>
  );
};

export default SetupModal;
