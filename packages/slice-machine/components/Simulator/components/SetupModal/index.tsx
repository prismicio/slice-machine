import Card from "@components/Card";
import SliceMachineModal from "@components/SliceMachineModal";
import { Box, Flex, Heading, Text } from "theme-ui";

import { useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { selectIsSimulatorAvailableForFramework } from "@src/modules/environment";
import { selectSetupSteps } from "@src/modules/simulator";
import { telemetry } from "@src/apiClient";

import HTMLRenderer from "@components/HTMLRenderer";

import TextWithInlineCode from "./TextWithInlineCode";

const TitleCard: React.FC<{
  number: number;
  title: string;
  excerpt?: string;
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
      <Box sx={{ ml: 3, alignSelf: "center" }}>
        <Heading
          as="h4"
          sx={{ color: "whiteButtonText", fontSize: "14px", fontWeight: "600" }}
        >
          <TextWithInlineCode>{title}</TextWithInlineCode>
        </Heading>
        {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
        {excerpt && (
          <Text
            as="p"
            sx={{
              mt: 2,
              color: "textClear",
              fontSize: "13px",
              lineHeight: "24px",
            }}
          >
            <TextWithInlineCode>{excerpt}</TextWithInlineCode>
          </Text>
        )}
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
      fontSize: "13px",
    }}
  >
    {number}
  </Flex>
);

const SetupModal: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const { isSimulatorAvailableForFramework, setupSteps } = useSelector(
    (state: SliceMachineStoreType) => ({
      isSimulatorAvailableForFramework:
        selectIsSimulatorAvailableForFramework(state),
      setupSteps: selectSetupSteps(state),
    })
  );

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const steps = setupSteps || [];

  useEffect(() => {
    if (isOpen) void telemetry.track({ event: "slice-simulator:setup" });
  }, [isOpen]);

  return (
    <SliceMachineModal isOpen={isOpen}>
      <Card
        bodySx={{
          p: 0,
          bg: "grey07",
          height: steps.length === 4 ? "640px" : "480px",
        }}
        Header={({ radius }: { radius: string | number }) => (
          <Flex
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
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
            <Heading sx={{ fontSize: "14px", fontWeight: "600" }} as="h5">
              Set up the simulator
            </Heading>
          </Flex>
        )}
      >
        <Tabs defaultFocus className="react-tabs__vertical">
          <TabList className="react-tabs__vertical__tab-list">
            {steps.map((step, i) => (
              <TitleCard
                number={i + 1}
                key={step.title}
                title={step.title}
                excerpt={step.description}
              />
            ))}
          </TabList>
          {isSimulatorAvailableForFramework ? (
            <>
              {steps.map((step) => {
                return (
                  <TabPanel
                    key={step.title}
                    selectedClassName="react-tabs__vertical__tab-panel--selected"
                    className="react-tabs__vertical__tab-panel"
                  >
                    <HTMLRenderer html={step.body} />
                  </TabPanel>
                );
              })}
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
