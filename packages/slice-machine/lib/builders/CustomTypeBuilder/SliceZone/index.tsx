import { useEffect, useMemo, useState } from "react";
import { Text, Box, Flex, Heading, Button } from "theme-ui";

import ZoneHeader from "../../common/Zone/components/ZoneHeader";

import UpdateSliceZoneModal from "./UpdateSliceZoneModal";

import { SlicesList } from "./List";
import EmptyState from "./EmptyState";
import { SlicesSM } from "@lib/models/common/Slices";
import {
  NonSharedSliceInSliceZone,
  SliceZoneSlice,
} from "@lib/models/common/CustomType/sliceZone";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getFrontendSlices, getLibraries } from "@src/modules/slices";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { useModelStatus } from "@src/hooks/useModelStatus";
import { CustomTypeFormat } from "@slicemachine/manager/*";

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
  onRemoveSharedSlice: (sliceId: string) => void;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onSelectSharedSlices: Function;
  sliceZone?: SlicesSM | null | undefined;
  tabId: string;
}

const SliceZone: React.FC<SliceZoneProps> = ({
  format,
  onCreateSliceZone,
  onRemoveSharedSlice,
  onSelectSharedSlices,
  sliceZone,
  tabId,
}) => {
  const [formIsOpen, setFormIsOpen] = useState(false);
  const { libraries, slices } = useSelector((store: SliceMachineStoreType) => ({
    libraries: getLibraries(store),
    slices: getFrontendSlices(store),
  }));

  const { modelsStatuses, authStatus, isOnline } = useModelStatus({ slices });

  const { availableSlices, slicesInSliceZone, notFound } = useMemo(
    () =>
      sliceZone
        ? mapAvailableAndSharedSlices(sliceZone, libraries)
        : { availableSlices: [], slicesInSliceZone: [], notFound: [] },
    [sliceZone, libraries]
  );

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

  return (
    <Box my={3}>
      <ZoneHeader
        Heading={<Heading as="h6">Slice Zone</Heading>}
        Actions={
          <Flex sx={{ alignItems: "center" }}>
            {sliceZone ? (
              <Text pr={3} sx={{ fontSize: "14px" }}>
                data.{sliceZone.key}
              </Text>
            ) : null}
            {!!slicesInSliceZone.length && (
              <Button
                variant="buttons.darkSmall"
                onClick={onAddNewSlice}
                data-cy="update-slices"
              >
                Update Slice Zone
              </Button>
            )}
          </Flex>
        }
      />
      {!slicesInSliceZone.length ? (
        <EmptyState format={format} onAddNewSlice={onAddNewSlice} />
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
    </Box>
  );
};

export default SliceZone;
