import { useEffect, useMemo, useState } from "react";
import { Text, Box, Flex, Heading } from "theme-ui";
import { useSelector } from "react-redux";
import { Switch, vars, Button, Icon } from "@prismicio/editor-ui";

import { SlicesSM } from "@lib/models/common/Slices";
import {
  NonSharedSliceInSliceZone,
  SliceZoneSlice,
} from "@lib/models/common/CustomType/sliceZone";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { CustomTypeSM } from "@lib/models/common/CustomType";
import { CreateSliceModal } from "@components/Forms/CreateSliceModal";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  getFrontendSlices,
  getLibraries,
  getRemoteSlices,
} from "@src/modules/slices";
import { useModelStatus } from "@src/hooks/useModelStatus";
import { SliceZoneBlankState } from "@src/features/customTypes/customTypesBuilder/SliceZoneBlankState";
import { DeleteSliceZoneModal } from "./DeleteSliceZoneModal";
import ZoneHeader from "../../common/Zone/components/ZoneHeader";
import UpdateSliceZoneModal from "./UpdateSliceZoneModal";
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
    <Box mt={3}>
      <ZoneHeader
        Heading={
          <div style={{ display: "flex", alignItems: "center" }}>
            <Heading as="h6" style={{ marginRight: vars.size[8] }}>
              Slice Zone
            </Heading>
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
          </div>
        }
        Actions={
          <Flex sx={{ alignItems: "center" }}>
            {sliceZone ? (
              <Text pr={3} sx={{ fontSize: "14px" }}>
                data.{sliceZone.key}
              </Text>
            ) : null}
            <Flex sx={{ gap: "8px" }}>
              <Button
                variant="secondary"
                startIcon={<Icon name="add" />}
                onClick={onCreateNewSlice}
              >
                New slice
              </Button>
              {availableSlices.length > 0 && (
                <Button
                  variant="secondary"
                  startIcon={<Icon name="edit" />}
                  onClick={onAddNewSlice}
                  data-cy="update-slices"
                >
                  Update Slices
                </Button>
              )}
            </Flex>
          </Flex>
        }
      />
      {sliceZone && !slicesInSliceZone.length ? (
        <SliceZoneBlankState
          onAddNewSlice={onAddNewSlice}
          onCreateNewSlice={onCreateNewSlice}
          projectHasAvailableSlices={availableSlices.length > 0}
        />
      ) : (
        <SlicesList
          slices={slicesInSliceZone}
          modelsStatuses={modelsStatuses}
          authStatus={authStatus}
          isOnline={isOnline}
          format={customType.format}
        />
      )}
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
