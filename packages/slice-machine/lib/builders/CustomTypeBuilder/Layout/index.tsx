import { MouseEventHandler, useState, FC } from "react";
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
import DeleteModal from "../TabModal/delete";
import SliceMachineIconButton from "@components/SliceMachineIconButton";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { TabSM } from "@lib/models/common/CustomType";

export enum ModalType {
  CREATE = "create",
  UPDATE = "update",
  RENAME = "rename",
  DELETE = "delete",
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

interface DeleteState {
  title: string;
  type: ModalType.DELETE;
  key: string;
}

export type ModalState = EditState | CreateState | DeleteState;

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
      <LayoutModals
        modalState={state}
        tabs={tabs}
        onClose={() => setState(undefined)}
        createCustomTypeTab={createCustomTypeTab}
        updateCustomTypeTab={updateCustomTypeTab}
        deleteCustomTypeTab={deleteCustomTypeTab}
        setTabIndex={setTabIndex}
      />
    </>
  );
};

export const LayoutModals: FC<{
  modalState?: ModalState;
  tabs: Array<TabSM>;
  onClose: () => void;
  createCustomTypeTab: (tabId: string) => void;
  updateCustomTypeTab: (tabId: string, newTabId: string) => void;
  deleteCustomTypeTab: (tabId: string) => void;
  setTabIndex?: (idx: number) => void;
  setTabKey?: (tabKey: string | undefined) => void;
}> = ({
  modalState,
  tabs,
  onClose,
  createCustomTypeTab,
  updateCustomTypeTab,
  deleteCustomTypeTab,
  setTabIndex,
  setTabKey,
}) => {
  if (modalState === undefined) return null;

  if (modalState.type === ModalType.DELETE) {
    return (
      <DeleteModal
        {...modalState}
        isOpen
        close={onClose}
        onSubmit={() => {
          deleteCustomTypeTab(modalState.key);
          if (setTabIndex) setTabIndex(0);
          if (setTabKey) setTabKey(undefined);
        }}
      />
    );
  }

  if (modalState.type === ModalType.CREATE) {
    return (
      <CreateModal
        {...modalState}
        isOpen
        tabIds={tabs.map((e) => e.key.toLowerCase())}
        close={onClose}
        onSubmit={({ id }: { id: string }) => {
          createCustomTypeTab(id);
          // current.tabs is not updated yet
          if (setTabIndex) setTabIndex(tabs.length);
          if (setTabKey) setTabKey(id);
        }}
      />
    );
  }
  if (modalState.type === ModalType.UPDATE) {
    // TODO: this maybe unreachable code
    return (
      <UpdateModal
        {...modalState}
        isOpen
        tabIds={tabs
          .filter((e) => e.key !== modalState.key)
          .map((e) => e.key.toLowerCase())}
        close={onClose}
        onSubmit={({
          id,
          actionType,
        }: {
          id: string;
          actionType: UpdateModalActionType;
        }) => {
          if (actionType === UpdateModalActionType.UPDATE) {
            updateCustomTypeTab(modalState.key, id);
            if (setTabKey) setTabKey(id); // test this
          }
          if (actionType === UpdateModalActionType.DELETE) {
            deleteCustomTypeTab(modalState.key);
            if (setTabIndex) setTabIndex(0);
            if (setTabKey) setTabKey(id);
          }
        }}
      />
    );
  }

  return null;
};

export default CustomTypeTabs;
