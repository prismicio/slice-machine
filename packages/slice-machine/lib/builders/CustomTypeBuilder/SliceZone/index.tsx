import { Button, Box, Switch } from "@prismicio/editor-ui";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { BaseStyles } from "theme-ui";

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
import { useModelStatus } from "@src/hooks/useModelStatus";
import {
  getFrontendSlices,
  getLibraries,
  getRemoteSlices,
} from "@src/modules/slices";
import type { SliceMachineStoreType } from "@src/redux/type";

import { DeleteSliceZoneModal } from "./DeleteSliceZoneModal";
import { SlicesList } from "./List";
import UpdateSliceZoneModal from "./UpdateSliceZoneModal";

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
  const [formIsOpen, setFormIsOpen] = useState(false);
  const [isCreateSliceModalOpen, setIsCreateSliceModalOpen] = useState(false);
  const { remoteSlices, libraries, slices } = useSelector(
    (store: SliceMachineStoreType) => ({
      remoteSlices: getRemoteSlices(store),
      libraries: getLibraries(store),
      slices: getFrontendSlices(store),
    })
  );
  const localLibraries: readonly LibraryUI[] = libraries.filter(
    (library) => library.isLocal
  );
  const { modelsStatuses, authStatus, isOnline } = useModelStatus({ slices });
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

  const onAddNewSlice = () => {
    if (!sliceZone) {
      onCreateSliceZone();
    }
    setFormIsOpen(true);
  };

  const onCreateNewSlice = () => {
    if (!sliceZone) {
      onCreateSliceZone();
    }
    setIsCreateSliceModalOpen(true);
  };

  return (
    <Box flexDirection="column">
      <List>
        <ListHeader
          actions={
            <>
              <Button onClick={onCreateNewSlice} startIcon="add">
                New slice
              </Button>
              {availableSlices.length > 0 ? (
                <Button
                  data-cy="update-slices"
                  onClick={onAddNewSlice}
                  startIcon="edit"
                >
                  Update Slices
                </Button>
              ) : undefined}
            </>
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
      {sliceZone ? (
        slicesInSliceZone.length > 0 ? (
          <BaseStyles>
            <SlicesList
              slices={slicesInSliceZone}
              modelsStatuses={modelsStatuses}
              authStatus={authStatus}
              isOnline={isOnline}
              format={customType.format}
            />
          </BaseStyles>
        ) : (
          <SliceZoneBlankSlate
            onAddNewSlice={onAddNewSlice}
            onCreateNewSlice={onCreateNewSlice}
            projectHasAvailableSlices={availableSlices.length > 0}
          />
        )
      ) : undefined}
      <UpdateSliceZoneModal
        isOpen={formIsOpen}
        formId={`tab-slicezone-form-${tabId}`}
        availableSlices={availableSlices}
        slicesInSliceZone={sharedSlicesInSliceZone}
        onSubmit={({ sliceKeys }) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          onSelectSharedSlices(sliceKeys, nonSharedSlicesKeysInSliceZone)
        }
        close={() => setFormIsOpen(false)}
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
