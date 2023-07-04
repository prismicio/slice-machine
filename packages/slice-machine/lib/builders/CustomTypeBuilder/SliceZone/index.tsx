import { useEffect, useMemo, useState } from "react";
import { Text, Box, Flex, Heading } from "theme-ui";
import { useSelector } from "react-redux";
import { Switch, vars, Button, Icon } from "@prismicio/editor-ui";

import { snakelize } from "@lib/utils/str";
import { SlicesSM } from "@lib/models/common/Slices";
import {
  NonSharedSliceInSliceZone,
  SliceZoneSlice,
} from "@lib/models/common/CustomType/sliceZone";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { CreateSliceModal } from "@components/Forms/CreateSliceModal";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  getFrontendSlices,
  getLibraries,
  getRemoteSlices,
} from "@src/modules/slices";
import { useModelStatus } from "@src/hooks/useModelStatus";
import { CustomTypeFormat } from "@slicemachine/manager";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { isModalOpen } from "@src/modules/modal";
import { isLoading } from "@src/modules/loading";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";
import { SliceZoneBlankState } from "@src/features/customTypes/customTypesBuilder/SliceZoneBlankState";
import { ReplaceSharedSliceCreatorPayload } from "@src/modules/selectedCustomType";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { DeleteSliceZoneModal } from "./DeleteSliceZoneModal";
import ZoneHeader from "../../common/Zone/components/ZoneHeader";
import UpdateSliceZoneModal from "./UpdateSliceZoneModal";
import { SlicesList } from "./List";

const mapAvailableAndSharedSlices = (
  sliceZone: SlicesSM,
  libraries: ReadonlyArray<LibraryUI> | null
) => {
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
  format: CustomTypeFormat;
  onCreateSliceZone: () => void;
  onDeleteSliceZone: () => void;
  onRemoveSharedSlice: (sliceId: string) => void;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onSelectSharedSlices: Function;
  sliceZone?: SlicesSM | null | undefined;
  tabId: string;
}

const SliceZone: React.FC<SliceZoneProps> = ({
  format,
  onCreateSliceZone,
  onDeleteSliceZone,
  onRemoveSharedSlice,
  onSelectSharedSlices,
  sliceZone,
  tabId,
}) => {
  const [formIsOpen, setFormIsOpen] = useState(false);
  const {
    isCreateSliceModalOpen,
    isCreatingSlice,
    remoteSlices,
    libraries,
    slices,
  } = useSelector((store: SliceMachineStoreType) => ({
    isCreateSliceModalOpen: isModalOpen(store, ModalKeysEnum.CREATE_SLICE),
    isCreatingSlice: isLoading(store, LoadingKeysEnum.CREATE_SLICE),
    remoteSlices: getRemoteSlices(store),
    libraries: getLibraries(store),
    slices: getFrontendSlices(store),
  }));
  const localLibraries: LibraryUI[] = libraries.filter(
    (library) => library.isLocal
  );
  const { modelsStatuses, authStatus, isOnline } = useModelStatus({ slices });
  const availableAndSharedSlices = useMemo(
    () =>
      sliceZone
        ? mapAvailableAndSharedSlices(sliceZone, libraries)
        : { availableSlices: [], slicesInSliceZone: [], notFound: [] },
    [sliceZone, libraries]
  );
  const { notFound } = availableAndSharedSlices;
  const { openCreateSliceModal, closeModals, createSlice } =
    useSliceMachineActions();
  const [isDeleteSliceZoneModalOpen, setIsDeleteSliceZoneModalOpen] =
    useState(false);
  const [slicesToDisplay, setSlicesToDisplay] = useState({
    availableSlices: availableAndSharedSlices.availableSlices,
    slicesInSliceZone: availableAndSharedSlices.slicesInSliceZone,
  });
  const { availableSlices, slicesInSliceZone } = slicesToDisplay;

  useEffect(() => {
    if (!isCreatingSlice) {
      setSlicesToDisplay({
        availableSlices: availableAndSharedSlices.availableSlices,
        slicesInSliceZone: availableAndSharedSlices.slicesInSliceZone,
      });
    }
  }, [isCreatingSlice, availableAndSharedSlices]);

  useEffect(() => {
    if (notFound?.length) {
      notFound.forEach(({ key }) => {
        onRemoveSharedSlice(key);
      });
    }
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
    openCreateSliceModal();
  };

  return (
    <Box my={3}>
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
            {!!slicesInSliceZone.length && (
              <Flex sx={{ gap: "8px" }}>
                <Button
                  variant="secondary"
                  startIcon={<Icon name="add" />}
                  onClick={onCreateNewSlice}
                  loading={isCreatingSlice}
                >
                  New slice
                </Button>
                <Button
                  variant="secondary"
                  startIcon={<Icon name="edit" />}
                  onClick={onAddNewSlice}
                  disabled={isCreatingSlice}
                  data-cy="update-slices"
                >
                  Update Slices
                </Button>
              </Flex>
            )}
          </Flex>
        }
      />
      {sliceZone && !slicesInSliceZone.length ? (
        <SliceZoneBlankState
          onAddNewSlice={onAddNewSlice}
          onCreateNewSlice={onCreateNewSlice}
          isCreatingSlice={isCreatingSlice}
          projectHasAvailableSlices={availableSlices.length > 0}
        />
      ) : (
        <SlicesList
          slices={slicesInSliceZone}
          modelsStatuses={modelsStatuses}
          authStatus={authStatus}
          isOnline={isOnline}
          format={format}
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
      {localLibraries?.length != 0 && (
        <CreateSliceModal
          isCreatingSlice={isCreatingSlice}
          isOpen={isCreateSliceModalOpen}
          close={closeModals}
          libraries={localLibraries}
          remoteSlices={remoteSlices}
          actionMessage={
            CUSTOM_TYPES_MESSAGES[format].createSliceFromTypeActionMessage
          }
          onSubmit={({ sliceName, from }) => {
            const replaceSharedSliceCreatorPayload: ReplaceSharedSliceCreatorPayload =
              {
                tabId,
                sliceKeys: sharedSlicesInSliceZone
                  .map((slice) => slice.model.id)
                  .concat([snakelize(sliceName)]),
                preserve: nonSharedSlicesKeysInSliceZone,
              };
            createSlice(sliceName, from, replaceSharedSliceCreatorPayload);
          }}
        />
      )}
    </Box>
  );
};

export default SliceZone;
