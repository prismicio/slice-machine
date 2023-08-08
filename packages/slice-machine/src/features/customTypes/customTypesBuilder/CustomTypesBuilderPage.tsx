import {
  Button,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from "@prismicio/editor-ui";
import Head from "next/head";
import { useRouter } from "next/router";
import { type FC, useEffect, PropsWithChildren, useState } from "react";
import { useSelector } from "react-redux";
import { BaseStyles } from "theme-ui";

// import CustomTypeBuilder from "@lib/builders/CustomTypeBuilder";
import TabZone from "@builders/CustomTypeBuilder/TabZone";
import { SliceMachineStoreType } from "@src/redux/type";
import { CustomTypeSM, CustomTypes } from "@lib/models/common/CustomType";
import { hasLocal, hasRemote } from "@lib/models/common/ModelData";
import {
  AppLayout,
  AppLayoutActions,
  AppLayoutBackButton,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@components/AppLayout";
import { readBuilderPageDynamicSegment } from "@src/features/customTypes/customTypesConfig";
import { selectCustomTypeById } from "@src/modules/availableCustomTypes";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import {
  isSelectedCustomTypeTouched,
  selectCurrentCustomType,
} from "@src/modules/selectedCustomType";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { Window, WindowFrame } from "@src/components/Window";

import { EditDropdown } from "../EditDropdown";
import { PageSnippetDialog } from "./PageSnippetDialog";

import { CUSTOM_TYPES_CONFIG } from "../customTypesConfig";
import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";
import {
  WindowFrameDots,
  WindowTabs,
  WindowTabsContent,
  WindowTabsList,
  WindowTabsListContainer,
  // WindowTabsTrigger,
  Tab,
  ThreeDotsButton,
  AddButton,
} from "@src/components/Window/Window";
import {
  LayoutModals,
  ModalState,
  ModalType,
} from "@builders/CustomTypeBuilder/Layout";
import { DropdownMenu } from "@prismicio/editor-ui";

export const CustomTypesBuilderPage: FC = () => {
  const router = useRouter();
  const { selectedCustomType } = useSelector(
    (store: SliceMachineStoreType) => ({
      selectedCustomType: selectCustomTypeById(
        store,
        readBuilderPageDynamicSegment(router.query) as string
      ),
    })
  );

  const { cleanupCustomTypeStore } = useSliceMachineActions();

  useEffect(() => {
    if (!selectedCustomType || !hasLocal(selectedCustomType)) {
      void router.replace("/");
    }
  }, [selectedCustomType, router]);

  useEffect(() => {
    return () => {
      cleanupCustomTypeStore();
    };
    // we don't want to re-run this effect when the cleanupCustomTypeStore is redefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!selectedCustomType || !hasLocal(selectedCustomType)) {
    return <AppLayout />;
  }

  return (
    <>
      <Head>
        <title>{selectedCustomType.local.label} - Slice Machine</title>
      </Head>
      <CustomTypesBuilderPageWithProvider
        customType={selectedCustomType.local}
        remoteCustomType={
          hasRemote(selectedCustomType) ? selectedCustomType.remote : undefined
        }
      />
    </>
  );
};

type CustomTypesBuilderPageWithProviderProps = {
  customType: CustomTypeSM;
  remoteCustomType: CustomTypeSM | undefined;
};

const CustomTypesBuilderPageWithProvider: React.FC<
  CustomTypesBuilderPageWithProviderProps
> = ({ customType, remoteCustomType }) => {
  const {
    initCustomTypeStore,
    saveCustomType,
    createCustomTypeTab,
    updateCustomTypeTab,
    deleteCustomTypeTab,
  } = useSliceMachineActions();

  useEffect(
    () => {
      initCustomTypeStore(customType, remoteCustomType);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      /* leave this empty to prevent local updates to disappear */
    ]
  );

  const { currentCustomType, hasPendingModifications, isSavingCustomType } =
    useSelector((store: SliceMachineStoreType) => ({
      currentCustomType: selectCurrentCustomType(store),
      hasPendingModifications: isSelectedCustomTypeTouched(store),
      isSavingCustomType: isLoading(store, LoadingKeysEnum.SAVE_CUSTOM_TYPE),
    }));

  const [modalState, setModalState] = useState<ModalState | undefined>();
  const [currentTab, setCurrentTab] = useState<string | undefined>(
    currentCustomType?.tabs[0].key ?? undefined
  );

  if (currentCustomType === null) {
    return <AppLayout />;
  }

  const config = CUSTOM_TYPES_CONFIG[currentCustomType.format];
  const messages = CUSTOM_TYPES_MESSAGES[currentCustomType.format];

  return (
    <AppLayout>
      <AppLayoutHeader>
        <AppLayoutBackButton url={config.tablePagePathname} />
        <AppLayoutBreadcrumb
          folder={messages.name({ start: true, plural: true })}
          page={currentCustomType.label ?? currentCustomType.id}
        />
        <AppLayoutActions>
          {currentCustomType.format === "page" ? (
            <PageSnippetDialog model={CustomTypes.fromSM(currentCustomType)} />
          ) : undefined}
          <EditDropdown
            isChangesLocal
            format={currentCustomType.format}
            customType={CustomTypes.fromSM(currentCustomType)}
          />
          <Button
            onClick={saveCustomType}
            loading={isSavingCustomType}
            data-testid="builder-save-button"
            disabled={!hasPendingModifications || isSavingCustomType}
          >
            Save
          </Button>
        </AppLayoutActions>
      </AppLayoutHeader>
      <AppLayoutContent>
        <Window>
          {currentCustomType.format === "page" && (
            <WindowFrame>
              <WindowFrameDots />
            </WindowFrame>
          )}
          <WindowTabs
            value={currentTab ?? currentCustomType.tabs[0].key}
            onValueChange={setCurrentTab}
          >
            <WindowTabsListContainer>
              <WindowTabsList>
                {currentCustomType.tabs.map((tab) => (
                  <CustomTypeBuildTab
                    key={tab.key}
                    value={tab.key}
                    onSelect={(type: ModalType) => {
                      if (type === ModalType.RENAME) {
                        setModalState({
                          title: "Rename Tab",
                          type: ModalType.UPDATE,
                          key: tab.key,
                          allowDelete: false,
                        });
                      } else if (type === ModalType.DELETE) {
                        setModalState({
                          title: "Delete Tab",
                          type: ModalType.DELETE,
                          key: tab.key,
                        });
                      } else {
                        setModalState({
                          title: "Edit Tab",
                          type: ModalType.UPDATE,
                          key: tab.key,
                          allowDelete: currentCustomType.tabs.length > 1,
                        });
                      }
                    }}
                  >
                    {tab.key}
                  </CustomTypeBuildTab>
                ))}
              </WindowTabsList>
              <AddButton
                onClick={() =>
                  setModalState({ title: "Add Tab", type: ModalType.CREATE })
                }
              />
            </WindowTabsListContainer>

            {currentCustomType.tabs.map((tab) => (
              <WindowTabsContent key={tab.key} value={tab.key}>
                <BaseStyles>
                  <TabZone
                    tabId={tab.key}
                    sliceZone={tab.sliceZone}
                    fields={tab.value}
                    customType={currentCustomType}
                  />
                </BaseStyles>
              </WindowTabsContent>
            ))}
          </WindowTabs>
        </Window>
        <LayoutModals
          tabs={currentCustomType.tabs}
          modalState={modalState}
          onClose={() => setModalState(undefined)}
          createCustomTypeTab={createCustomTypeTab}
          deleteCustomTypeTab={deleteCustomTypeTab}
          updateCustomTypeTab={updateCustomTypeTab}
          setTabKey={setCurrentTab}
        />
        {/* <BaseStyles> 
      <CustomTypeBuilder customType={currentCustomType} />
    </BaseStyles> */}
      </AppLayoutContent>
    </AppLayout>
  );
};

// TODO: add proper icons
const CustomTypeBuildTab: FC<
  PropsWithChildren<{
    value: string;
    onSelect: (value: ModalType) => void;
  }>
> = ({ children, value, onSelect, ...props }) => (
  <Tab {...props} value={value}>
    {children}
    <DropdownMenu>
      <DropdownMenuTrigger>
        <ThreeDotsButton />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/**TODO: change this to dedicated modals */}
        <DropdownMenuItem
          onSelect={() => onSelect(ModalType.RENAME)}
          startIcon={<Icon name="folder" />}
        >
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => onSelect(ModalType.DELETE)}
          color="tomato"
          startIcon={<Icon name="folder" />}
        >
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </Tab>
);
