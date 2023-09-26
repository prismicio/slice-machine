import {
  Button,
  Box,
  Switch,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Icon,
} from "@prismicio/editor-ui";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { BaseStyles } from "theme-ui";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

import { CustomTypeSM, CustomTypes } from "@lib/models/common/CustomType";
import { CreateSliceModal } from "@components/Forms/CreateSliceModal";
import type { SliceZoneSlice } from "@lib/models/common/CustomType/sliceZone";
import type { ComponentUI } from "@lib/models/common/ComponentUI";
import type { LibraryUI } from "@lib/models/common/LibraryUI";
import type { SlicesSM } from "@lib/models/common/Slices";
import { List, ListHeader } from "@src/components/List";
import { SliceZoneBlankSlate } from "@src/features/customTypes/customTypesBuilder/SliceZoneBlankSlate";
import { telemetry } from "@src/apiClient";
import {
  getFrontendSlices,
  getLibraries,
  getRemoteSlices,
} from "@src/modules/slices";
import type { SliceMachineStoreType } from "@src/redux/type";
import { useSlicesTemplates } from "@src/features/slicesTemplates/useSlicesTemplates";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { addSlicesToSliceZone } from "@src/features/slices/actions/addSlicesToSliceZone";
import { ToastMessageWithPath } from "@components/ToasterContainer";

import { DeleteSliceZoneModal } from "./DeleteSliceZoneModal";
import UpdateSliceZoneModal from "./UpdateSliceZoneModal";
import { SlicesTemplatesModal } from "./SlicesTemplatesModal";
import { SlicesList } from "./List";

const mapAvailableAndSharedSlices = (
  sliceZone: SlicesSM,
  libraries: ReadonlyArray<LibraryUI> | null
) => {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const availableSlices = (libraries || []).reduce<ReadonlyArray<ComponentUI>>(
    (acc, curr: LibraryUI) => {
      return [...acc, ...curr.components];
    },
    []
  );
  const { slicesInSliceZone, notFound } = sliceZone.value.reduce<{
    slicesInSliceZone: ReadonlyArray<SliceZoneSlice>;
    notFound: ReadonlyArray<{ key: string }>;
  }>(
    (acc, { key, value }) => {
      // Shared Slice
      if (value.type === "SharedSlice") {
        const maybeSliceState: ComponentUI | undefined = availableSlices.find(
          (slice) => slice.model.id === key
        );

        if (maybeSliceState) {
          return {
            ...acc,
            slicesInSliceZone: [
              ...acc.slicesInSliceZone,
              { type: "SharedSlice", payload: maybeSliceState },
            ],
          };
        }

        return { ...acc, notFound: [...acc.notFound, { key }] };
      }
      // Legacy Slice
      else if (value.type === "Slice") {
        return {
          ...acc,
          slicesInSliceZone: [
            ...acc.slicesInSliceZone,
            { type: "Slice", payload: { key, value } },
          ],
        };
      }

      // Really old legacy Slice are ignored
      return acc;
    },
    { slicesInSliceZone: [], notFound: [] }
  );

  return { availableSlices, slicesInSliceZone, notFound };
};

interface SliceZoneProps {
  customType: CustomTypeSM;
  onCreateSliceZone: () => void;
  onDeleteSliceZone: () => void;
  onRemoveSharedSlice: (sliceId: string) => void;
  sliceZone?: SlicesSM | null | undefined;
  tabId: string;
}

const SliceZone: React.FC<SliceZoneProps> = ({
  customType,
  onCreateSliceZone,
  onDeleteSliceZone,
  onRemoveSharedSlice,
  sliceZone,
  tabId,
}) => {
  const { query, replace, pathname } = useRouter();
  const availableSlicesTemplates = useSlicesTemplates();
  const [isSlicesTemplatesModalOpen, setIsSlicesTemplatesModalOpen] =
    useState(false);
  const [isUpdateSliceZoneModalOpen, setIsUpdateSliceZoneModalOpen] =
    useState(false);
  const [isCreateSliceModalOpen, setIsCreateSliceModalOpen] = useState(false);
  const { remoteSlices, libraries } = useSelector(
    (store: SliceMachineStoreType) => ({
      remoteSlices: getRemoteSlices(store),
      libraries: getLibraries(store),
      slices: getFrontendSlices(store),
    })
  );
  const { initCustomTypeStore, saveCustomTypeSuccess } =
    useSliceMachineActions();
  const localLibraries: readonly LibraryUI[] = libraries.filter(
    (library) => library.isLocal
  );
  const { availableSlices, slicesInSliceZone, notFound } = useMemo(
    () =>
      sliceZone
        ? mapAvailableAndSharedSlices(sliceZone, libraries)
        : { availableSlices: [], slicesInSliceZone: [], notFound: [] },
    [sliceZone, libraries]
  );
  const [isDeleteSliceZoneModalOpen, setIsDeleteSliceZoneModalOpen] =
    useState(false);

  useEffect(() => {
    if (notFound?.length) {
      notFound.forEach(({ key }) => {
        onRemoveSharedSlice(key);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notFound]);

  const sharedSlicesInSliceZone = slicesInSliceZone
    .filter((e) => e.type === "SharedSlice")
    .map((e) => e.payload) as ReadonlyArray<ComponentUI>;

  const availableSlicesToAdd = availableSlices.filter(
    (slice) =>
      !sharedSlicesInSliceZone.some(
        (sharedSlice) => sharedSlice.model.id === slice.model.id
      )
  );

  const openUpdateSliceZoneModal = () => {
    setIsUpdateSliceZoneModalOpen(true);
  };

  const openCreateSliceModal = () => {
    setIsCreateSliceModalOpen(true);
  };

  const openSlicesTemplatesModal = () => {
    setIsSlicesTemplatesModalOpen(true);

    void telemetry.track({
      event: "custom-type:open-add-from-templates",
      customTypeId: customType.id,
      customTypeFormat: customType.format,
    });
  };

  const redirectToEditMode = () => {
    if (query.newPageType === "true") {
      void replace(
        { pathname, query: { pageTypeId: query.pageTypeId } },
        undefined,
        { shallow: true }
      );
    }
  };

  const closeUpdateSliceZoneModal = () => {
    setIsUpdateSliceZoneModalOpen(false);
    redirectToEditMode();
  };

  const closeCreateSliceModal = () => {
    setIsCreateSliceModalOpen(false);
    redirectToEditMode();
  };

  const closeSlicesTemplatesModal = () => {
    setIsSlicesTemplatesModalOpen(false);
    redirectToEditMode();
  };

  const onAddSlicesToSliceZone = (newCustomType: CustomTypeSM) => {
    // Reset selected custom type store to update slice zone and saving status
    initCustomTypeStore(newCustomType, newCustomType);

    // Update available custom type store with new custom type
    saveCustomTypeSuccess(CustomTypes.fromSM(newCustomType));
  };

  return (
    <Box flexDirection="column" height="100%">
      {query.newPageType === undefined ? (
        <List>
          <ListHeader
            actions={
              sliceZone ? (
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="secondary" startIcon="add">
                      Add slices
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      startIcon={<Icon name="add" size="large" />}
                      onSelect={openCreateSliceModal}
                      description="Start from scratch."
                    >
                      Create new
                    </DropdownMenuItem>

                    {availableSlicesTemplates.length > 0 ? (
                      <DropdownMenuItem
                        onSelect={openSlicesTemplatesModal}
                        startIcon={<Icon name="contentCopy" size="large" />}
                        description="Select from premade examples."
                      >
                        Use template
                      </DropdownMenuItem>
                    ) : undefined}

                    {availableSlicesToAdd.length > 0 ? (
                      <DropdownMenuItem
                        onSelect={openUpdateSliceZoneModal}
                        startIcon={<Icon name="folder" size="large" />}
                        description="Select from your own slices."
                      >
                        Select existing
                      </DropdownMenuItem>
                    ) : undefined}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : undefined
            }
            toggle={
              customType.format !== "page" || tabId !== "Main" ? (
                <Switch
                  checked={!!sliceZone}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onCreateSliceZone();
                    } else {
                      setIsDeleteSliceZoneModalOpen(true);
                    }
                  }}
                />
              ) : undefined
            }
          >
            Slice Zone
          </ListHeader>
        </List>
      ) : undefined}
      {sliceZone ? (
        slicesInSliceZone.length > 0 ? (
          <BaseStyles>
            <SlicesList
              slices={slicesInSliceZone}
              format={customType.format}
              onRemoveSharedSlice={onRemoveSharedSlice}
            />
          </BaseStyles>
        ) : (
          <SliceZoneBlankSlate
            openUpdateSliceZoneModal={openUpdateSliceZoneModal}
            openCreateSliceModal={openCreateSliceModal}
            openSlicesTemplatesModal={openSlicesTemplatesModal}
            projectHasAvailableSlices={availableSlicesToAdd.length > 0}
            isSlicesTemplatesSupported={availableSlicesTemplates.length > 0}
          />
        )
      ) : undefined}
      <UpdateSliceZoneModal
        isOpen={isUpdateSliceZoneModalOpen}
        formId={`tab-slicezone-form-${tabId}`}
        availableSlices={availableSlicesToAdd}
        onSubmit={async (slices: SharedSlice[]) => {
          const newCustomType = await addSlicesToSliceZone({
            customType,
            tabId,
            slices,
          });
          onAddSlicesToSliceZone(newCustomType);
          closeUpdateSliceZoneModal();
          toast.success("Slice(s) added to slice zone");
        }}
        close={closeUpdateSliceZoneModal}
      />
      <SlicesTemplatesModal
        isOpen={isSlicesTemplatesModalOpen}
        formId={`tab-slicezone-form-${tabId}`}
        availableSlicesTemplates={availableSlicesTemplates}
        localLibraries={localLibraries}
        onSuccess={async (slices: SharedSlice[]) => {
          const newCustomType = await addSlicesToSliceZone({
            customType,
            tabId,
            slices,
          });
          onAddSlicesToSliceZone(newCustomType);
          closeSlicesTemplatesModal();
          toast.success(
            <ToastMessageWithPath
              message="Slice(s) added to slice zone and created at: "
              path={`${localLibraries[0].name}/`}
            />
          );
        }}
        close={closeSlicesTemplatesModal}
      />
      <DeleteSliceZoneModal
        isDeleteSliceZoneModalOpen={isDeleteSliceZoneModalOpen}
        closeDeleteSliceZoneModal={() => {
          setIsDeleteSliceZoneModalOpen(false);
        }}
        deleteSliceZone={() => {
          onDeleteSliceZone();
          setIsDeleteSliceZoneModalOpen(false);
        }}
      />
      {localLibraries?.length !== 0 && isCreateSliceModalOpen && (
        <CreateSliceModal
          onSuccess={async (newSlice: SharedSlice) => {
            const newCustomType = await addSlicesToSliceZone({
              customType,
              tabId,
              slices: [newSlice],
            });
            onAddSlicesToSliceZone(newCustomType);
            closeCreateSliceModal();
            toast.success(
              <ToastMessageWithPath
                message="Slice added to slice zone and created at: "
                path={`${localLibraries[0].name}/${newSlice.name}/model.json`}
              />
            );
          }}
          localLibraries={localLibraries}
          remoteSlices={remoteSlices}
          onClose={closeCreateSliceModal}
        />
      )}
    </Box>
  );
};

export default SliceZone;
