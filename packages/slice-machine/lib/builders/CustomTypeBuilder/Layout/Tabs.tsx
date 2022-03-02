import { MouseEventHandler, useState } from "react";
import { CustomTypeState } from "@lib/models/ui/CustomTypeState";
import { AiOutlinePlus } from "react-icons/ai";

import { Box, Button, Flex, Theme, useThemeUI } from "theme-ui";
import { Tabs, TabPanel } from "react-tabs";

import { HiOutlineCog } from "react-icons/hi";

import {
  CustomTab as Tab,
  CustomTabList as TabList,
} from "../../../../components/Card/WithTabs/components";

import FlexWrapper from "./FlexWrapper";

import CreateModal from "../TabModal/create";
import UpdateModal, {
  ActionType as UpdateModalActionType,
} from "../TabModal/update";
import CustomTypeStore from "src/models/customType/store";
import SliceMachineIconButton from "@components/SliceMachineIconButton";

enum ModalType {
  CREATE = "create",
  UPDATE = "udate",
}
interface EditState {
  title: string;
  type: ModalType.UPDATE;
  key: string;
  allowDelete: boolean;
}

interface CreateState {
  title: string;
  type: ModalType.CREATE;
}

type ModalState = EditState | CreateState;

const Icon = ({
  theme,
  onClick,
}: {
  theme: Theme;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) => (
  <SliceMachineIconButton
    size={20}
    Icon={HiOutlineCog}
    label="Edit tab"
    sx={{ cursor: "pointer", color: theme.colors?.icons }}
    onClick={onClick}
  />
);

const CtTabs = ({
  sx,
  Model,
  store,
  renderTab,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sx?: any;
  Model: CustomTypeState;
  store: CustomTypeStore;
  // eslint-disable-next-line @typescript-eslint/ban-types
  renderTab: Function;
}) => {
  const { theme } = useThemeUI();

  const [tabIndex, setTabIndex] = useState<number>(0);
  const [state, setState] = useState<ModalState | undefined>();

  return (
    <Box sx={{ bg: "backgroundClear" }}>
      <FlexWrapper
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        sx={sx}
      >
        <Tabs
          selectedIndex={tabIndex}
          onSelect={(index) => setTabIndex(index)}
          style={{ width: "100%" }}
        >
          <TabList>
            {Model.current.tabs.map((tab, i) => (
              <Tab
                key={tab.key}
                style={{
                  display: "flex",
                  height: "48px",
                }}
              >
                <Flex sx={{ alignItems: "center" }}>
                  {tab.key}
                  &nbsp;
                  {i === tabIndex ? (
                    <Icon
                      theme={theme}
                      onClick={(
                        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
                      ) => {
                        e.preventDefault();
                        setState({
                          title: "Edit Tab",
                          type: ModalType.UPDATE,
                          key: tab.key,
                          allowDelete: Model.current.tabs.length > 1,
                        });
                      }}
                    />
                  ) : null}
                </Flex>
              </Tab>
            ))}
            <Tab
              key={"new-tab"}
              style={{ height: "48px" }}
              disabled
              onClick={() =>
                setState({ title: "Add Tab", type: ModalType.CREATE })
              }
            >
              <Button variant="transparent" sx={{ m: 0, color: "text" }}>
                <AiOutlinePlus style={{ position: "relative", top: "2px" }} />{" "}
                Add Tab
              </Button>
            </Tab>
          </TabList>
          {Model.current.tabs.map((tab) => (
            <TabPanel key={tab.key}>{renderTab(tab)}</TabPanel>
          ))}
          <TabPanel key={"new-tab"} />
        </Tabs>
      </FlexWrapper>
      {state?.type === ModalType.CREATE ? (
        <CreateModal
          {...state}
          isOpen
          tabIds={Model.current.tabs.map((e) => e.key.toLowerCase())}
          close={() => setState(undefined)}
          onSubmit={({ id }: { id: string }) => {
            store.createTab(id);
            // current.tabs is not updated yet
            setTabIndex(Model.current.tabs.length);
          }}
        />
      ) : null}
      {state?.type === ModalType.UPDATE ? (
        <UpdateModal
          {...state}
          isOpen
          tabIds={Model.current.tabs
            .filter((e) => e.key !== state.key)
            .map((e) => e.key.toLowerCase())}
          close={() => setState(undefined)}
          onSubmit={({
            id,
            actionType,
          }: {
            id: string;
            actionType: UpdateModalActionType;
          }) => {
            if (actionType === UpdateModalActionType.UPDATE) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return store.updateTab(state.key, id);
            }
            if (actionType === UpdateModalActionType.DELETE) {
              store.deleteTab(state.key);
              setTabIndex(0);
            }
          }}
        />
      ) : null}
    </Box>
  );
};

export default CtTabs;
