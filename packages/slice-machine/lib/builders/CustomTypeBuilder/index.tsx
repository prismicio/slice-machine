import { DropdownMenuItem, Icon } from "@prismicio/editor-ui";
import { type FC, useState } from "react";

import type { CustomTypeSM } from "@lib/models/common/CustomType";
import {
  Window,
  WindowFrame,
  WindowTabs,
  WindowTabsContent,
  WindowTabsList,
  WindowTabsTrigger,
} from "@src/components/Window";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

import CreateModal from "./TabModal/create";
import DeleteModal from "./TabModal/delete";
import UpdateModal from "./TabModal/update";
import TabZone from "./TabZone";

type CustomTypeBuilderProps = { customType: CustomTypeSM };

type DialogState =
  | { type: "CREATE_CUSTOM_TYPE" }
  | { type: "UPDATE_CUSTOM_TYPE"; tabKey: string }
  | { type: "DELETE_CUSTOM_TYPE"; tabKey: string }
  | undefined;

export const CustomTypeBuilder: FC<CustomTypeBuilderProps> = (props) => {
  const { customType } = props;

  const [tabValue, setTabValue] = useState(customType.tabs[0]?.key);

  const [dialog, setDialog] = useState<DialogState>();
  const { createCustomTypeTab, updateCustomTypeTab, deleteCustomTypeTab } =
    useSliceMachineActions();

  return (
    <>
      <Window>
        {customType.format === "page" ? <WindowFrame /> : undefined}
        <WindowTabs onValueChange={setTabValue} value={tabValue}>
          <WindowTabsList
            onAddNewTab={() => {
              setDialog({ type: "CREATE_CUSTOM_TYPE" });
            }}
          >
            {customType.tabs.map((tab) => (
              <WindowTabsTrigger
                key={tab.key}
                menu={
                  <>
                    <DropdownMenuItem
                      onSelect={() => {
                        setDialog({
                          type: "UPDATE_CUSTOM_TYPE",
                          tabKey: tab.key,
                        });
                      }}
                      startIcon={<Icon name="edit" />}
                    >
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      color="tomato"
                      disabled={customType.tabs.length <= 1}
                      onSelect={() => {
                        setDialog({
                          type: "DELETE_CUSTOM_TYPE",
                          tabKey: tab.key,
                        });
                      }}
                      startIcon={<Icon name="delete" />}
                    >
                      Remove
                    </DropdownMenuItem>
                  </>
                }
                value={tab.key}
              >
                {tab.key}
              </WindowTabsTrigger>
            ))}
          </WindowTabsList>
          {customType.tabs.map((tab) => (
            <WindowTabsContent key={tab.key} value={tab.key}>
              <TabZone
                customType={customType}
                fields={tab.value}
                sliceZone={tab.sliceZone}
                tabId={tab.key}
              />
            </WindowTabsContent>
          ))}
        </WindowTabs>
      </Window>
      {dialog?.type === "CREATE_CUSTOM_TYPE" ? (
        <CreateModal
          close={() => {
            setDialog(undefined);
          }}
          isOpen
          onSubmit={({ id }) => {
            createCustomTypeTab(id);
            setTabValue(id);
          }}
          tabIds={customType.tabs.map((tab) => tab.key.toLowerCase())}
        />
      ) : undefined}
      {dialog?.type === "UPDATE_CUSTOM_TYPE" ? (
        <UpdateModal
          close={() => {
            setDialog(undefined);
          }}
          isOpen
          onSubmit={({ id }) => {
            updateCustomTypeTab(dialog.tabKey, id);
            if (tabValue === dialog.tabKey) setTabValue(id);
          }}
          tabIds={customType.tabs
            .filter((tab) => tab.key !== dialog.tabKey)
            .map((tab) => tab.key.toLowerCase())}
        />
      ) : undefined}
      {dialog?.type === "DELETE_CUSTOM_TYPE" ? (
        <DeleteModal
          close={() => {
            setDialog(undefined);
          }}
          isOpen
          onSubmit={() => {
            deleteCustomTypeTab(dialog.tabKey);
            if (tabValue === dialog.tabKey) {
              const otherTabValue = customType.tabs.find(
                (tab) => tab.key !== dialog.tabKey
              )?.key;
              if (otherTabValue !== undefined) setTabValue(otherTabValue);
            }
          }}
        />
      ) : undefined}
    </>
  );
};
