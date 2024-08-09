import {
  DropdownMenuItem,
  Icon,
  Window,
  WindowFrame,
  WindowTabs,
  WindowTabsContent,
  WindowTabsList,
  WindowTabsTrigger,
} from "@prismicio/editor-ui";
import { useState } from "react";

import {
  createSection,
  deleteSection,
  renameSection,
} from "@/domain/customType";
import { useCustomTypeState } from "@/features/customTypes/customTypesBuilder/CustomTypeProvider";
import { UIDEditor } from "@/features/customTypes/customTypesBuilder/UIDEditor";
import { CustomTypes } from "@/legacy/lib/models/common/CustomType";

import CreateModal from "./TabModal/create";
import DeleteModal from "./TabModal/delete";
import UpdateModal from "./TabModal/update";
import TabZone from "./TabZone";

type DialogState =
  | { type: "CREATE_CUSTOM_TYPE_TAB" }
  | { type: "UPDATE_CUSTOM_TYPE_TAB"; tabKey: string }
  | { type: "DELETE_CUSTOM_TYPE_TAB"; tabKey: string }
  | undefined;

export const CustomTypeBuilder = () => {
  const { customType, setCustomType } = useCustomTypeState();
  const customTypeSM = CustomTypes.toSM(customType);
  const [tabValue, setTabValue] = useState(customTypeSM.tabs[0]?.key);

  const [dialog, setDialog] = useState<DialogState>();

  const sliceZoneEmpty =
    customTypeSM.tabs.find((tab) => tab.key === tabValue)?.sliceZone?.value
      .length === 0;

  function isRemoveDisabled(tabKey: string) {
    if (customTypeSM.tabs.length <= 1) return true;

    const tabWithUID = customTypeSM.tabs.find((tab) =>
      tab.value.find((field) => field.key === "uid"),
    );
    return (
      customType.format === "page" &&
      customType.repeatable &&
      tabWithUID?.key === tabKey
    );
  }

  return (
    <>
      <Window sx={sliceZoneEmpty ? { flexGrow: 1 } : undefined}>
        {customType.format === "page" ? (
          <WindowFrame
            title={customType.repeatable ? <UIDEditor /> : undefined}
          />
        ) : undefined}

        <WindowTabs onValueChange={setTabValue} value={tabValue}>
          <WindowTabsList
            onAddNewTab={() => {
              setDialog({ type: "CREATE_CUSTOM_TYPE_TAB" });
            }}
          >
            {customTypeSM.tabs.map((tab) => (
              <WindowTabsTrigger
                key={tab.key}
                menu={
                  <>
                    <DropdownMenuItem
                      onSelect={() => {
                        setDialog({
                          type: "UPDATE_CUSTOM_TYPE_TAB",
                          tabKey: tab.key,
                        });
                      }}
                      startIcon={<Icon name="edit" />}
                    >
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      color="tomato"
                      disabled={isRemoveDisabled(tab.key)}
                      onSelect={() => {
                        setDialog({
                          type: "DELETE_CUSTOM_TYPE_TAB",
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
          {customTypeSM.tabs.map((tab) => (
            <WindowTabsContent key={tab.key} value={tab.key}>
              <TabZone tabId={tab.key} />
            </WindowTabsContent>
          ))}
        </WindowTabs>
      </Window>
      {dialog?.type === "CREATE_CUSTOM_TYPE_TAB" ? (
        <CreateModal
          close={() => {
            setDialog(undefined);
          }}
          isOpen
          onSubmit={({ id }) => {
            const newCustomType = createSection(customType, id);
            setCustomType(newCustomType);
            setTabValue(id);
          }}
          tabIds={customTypeSM.tabs.map((tab) => tab.key.toLowerCase())}
        />
      ) : undefined}
      {dialog?.type === "UPDATE_CUSTOM_TYPE_TAB" ? (
        <UpdateModal
          close={() => {
            setDialog(undefined);
          }}
          initialTabKey={dialog.tabKey}
          isOpen
          onSubmit={({ id }) => {
            const newCustomType = renameSection(customType, dialog.tabKey, id);
            setCustomType(newCustomType);

            if (tabValue === dialog.tabKey) setTabValue(id);
          }}
          tabIds={customTypeSM.tabs
            .filter((tab) => tab.key !== dialog.tabKey)
            .map((tab) => tab.key.toLowerCase())}
        />
      ) : undefined}
      {dialog?.type === "DELETE_CUSTOM_TYPE_TAB" ? (
        <DeleteModal
          close={() => {
            setDialog(undefined);
          }}
          isOpen
          onSubmit={() => {
            const newCustomType = deleteSection(customType, dialog.tabKey);
            setCustomType(newCustomType);

            if (tabValue === dialog.tabKey) {
              const otherTabValue = customTypeSM.tabs.find(
                (tab) => tab.key !== dialog.tabKey,
              )?.key;
              if (otherTabValue !== undefined) setTabValue(otherTabValue);
            }
          }}
        />
      ) : undefined}
    </>
  );
};
