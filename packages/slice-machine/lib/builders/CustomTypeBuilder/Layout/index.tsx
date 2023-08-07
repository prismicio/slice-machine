import { MouseEventHandler, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";

import { Button, Flex, Theme, ThemeUIStyleObject, useThemeUI } from "theme-ui";
import { Tabs, TabPanel } from "react-tabs";

import { HiOutlineCog } from "react-icons/hi";

import {
  CustomTab as Tab,
  CustomTabList as TabList,
} from "../../../../components/Card/WithTabs/components";

import CreateModal from "../TabModal/create";
import UpdateModal, {
  ActionType as UpdateModalActionType,
} from "../TabModal/update";
import SliceMachineIconButton from "@components/SliceMachineIconButton";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { TabSM } from "@lib/models/common/CustomType";

enum ModalType {
  CREATE = "create",
  UPDATE = "update",
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

interface CustomTypeTabsProps {
  sx?: ThemeUIStyleObject;
  tabs: TabSM[];
  renderTab: (tab: TabSM) => JSX.Element;
}

const CustomTypeTabs: React.FC<CustomTypeTabsProps> = ({ tabs, renderTab }) => {
  const { theme } = useThemeUI();
  const { createCustomTypeTab, updateCustomTypeTab, deleteCustomTypeTab } =
    useSliceMachineActions();

  const [tabIndex, setTabIndex] = useState<number>(0);
  const [state, setState] = useState<ModalState | undefined>();

  return (
    <>
      <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
        <TabList>
          {tabs.map((tab, i) => (
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
                        allowDelete: tabs.length > 1,
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
              <AiOutlinePlus style={{ position: "relative", top: "2px" }} /> Add
              Tab
            </Button>
          </Tab>
        </TabList>
        {tabs.map((tab) => (
          <TabPanel key={tab.key}>{renderTab(tab)}</TabPanel>
        ))}
        <TabPanel key={"new-tab"} />
      </Tabs>
      {state?.type === ModalType.CREATE ? (
        <CreateModal
          {...state}
          isOpen
          tabIds={tabs.map((e) => e.key.toLowerCase())}
          close={() => setState(undefined)}
          onSubmit={({ id }: { id: string }) => {
            createCustomTypeTab(id);
            // current.tabs is not updated yet
            setTabIndex(tabs.length);
          }}
        />
      ) : null}
      {state?.type === ModalType.UPDATE ? (
        <UpdateModal
          {...state}
          isOpen
          tabIds={tabs
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
              updateCustomTypeTab(state.key, id);
            }
            if (actionType === UpdateModalActionType.DELETE) {
              deleteCustomTypeTab(state.key);
              setTabIndex(0);
            }
          }}
        />
      ) : null}
    </>
  );
};

export default CustomTypeTabs;
