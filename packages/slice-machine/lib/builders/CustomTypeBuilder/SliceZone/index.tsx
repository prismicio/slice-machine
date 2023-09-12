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

import { CreateSliceModal } from "@components/Forms/CreateSliceModal";
import type {
  NonSharedSliceInSliceZone,
  SliceZoneSlice,
} from "@lib/models/common/CustomType/sliceZone";
import type { CustomTypeSM } from "@lib/models/common/CustomType";
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
import { createSlicesTemplates } from "@src/features/slicesTemplates/actions/createSlicesTemplates";

import { DeleteSliceZoneModal } from "./DeleteSliceZoneModal";
import { SlicesList } from "./List";
import UpdateSliceZoneModal from "./UpdateSliceZoneModal";
import { SlicesTemplatesModal } from "./SlicesTemplatesModal";
import { getState } from "@src/apiClient";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

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
  // eslint-disable-next-line @typescript-eslint/ban-types
  onSelectSharedSlices: Function;
  sliceZone?: SlicesSM | null | undefined;
  tabId: string;
}

const SliceZone: React.FC<SliceZoneProps> = ({
  customType,
  onCreateSliceZone,
  onDeleteSliceZone,
  onRemoveSharedSlice,
  onSelectSharedSlices,
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
  const { createSliceSuccess } = useSliceMachineActions();
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

  /* Preserve these keys in SliceZone */
  const nonSharedSlicesKeysInSliceZone = slicesInSliceZone
    .filter((e) => e.type === "Slice")
    .map((e) => (e.payload as NonSharedSliceInSliceZone).key);

  const availableSlicesToAdd = availableSlices.filter(
    (slice) =>
      !sharedSlicesInSliceZone.some(
        (sharedSlice) => sharedSlice.model.id === slice.model.id
      )
  );

  const onAddNewSlice = () => {
    setIsUpdateSliceZoneModalOpen(true);
  };

  const onCreateNewSlice = () => {
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
                      Add
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      startIcon={<Icon name="add" />}
                      onSelect={onCreateNewSlice}
                    >
                      Blank slice
                    </DropdownMenuItem>

                    {availableSlicesTemplates.length > 0 ? (
                      <DropdownMenuItem
                        onSelect={openSlicesTemplatesModal}
                        startIcon={<Icon name="contentCopy" />}
                      >
                        From templates
                      </DropdownMenuItem>
                    ) : undefined}

                    {availableSlicesToAdd.length > 0 ? (
                      <DropdownMenuItem
                        onSelect={onAddNewSlice}
                        startIcon={<Icon name="folder" />}
                      >
                        From library
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
            onAddNewSlice={onAddNewSlice}
            onCreateNewSlice={onCreateNewSlice}
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
        onSubmit={({ sliceKeys }) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          onSelectSharedSlices(
            sliceKeys.concat(sharedSlicesInSliceZone.map((s) => s.model.id)),
            nonSharedSlicesKeysInSliceZone
          );
          redirectToEditMode();
        }}
        close={() => setIsUpdateSliceZoneModalOpen(false)}
      />
      <SlicesTemplatesModal
        isOpen={isSlicesTemplatesModalOpen}
        formId={`tab-slicezone-form-${tabId}`}
        availableSlicesTemplates={availableSlicesTemplates}
        onSubmit={({ sliceKeys }) =>
          void createSlicesTemplates({
            templateIDs: sliceKeys,
            localLibrariesNames: localLibraries.map((library) => library.name),
            onSuccess: async (slicesIds: string[]) => {
              // TODO(DT-1453): Remove the need of the global getState
              const serverState = await getState();

              // Update Redux store
              createSliceSuccess(serverState.libraries);

              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              onSelectSharedSlices(
                slicesIds.concat(
                  sharedSlicesInSliceZone.map((s) => s.model.id)
                ),
                nonSharedSlicesKeysInSliceZone
              );

              setIsSlicesTemplatesModalOpen(false);
              redirectToEditMode();
            },
          })
        }
        close={() => setIsSlicesTemplatesModalOpen(false)}
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
          onClose={() => {
            setIsCreateSliceModalOpen(false);
          }}
          localLibraries={localLibraries}
          remoteSlices={remoteSlices}
          customType={customType}
          tabId={tabId}
        />
      )}
    </Box>
  );
};

export default SliceZone;
